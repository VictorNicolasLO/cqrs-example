import { ReducerEvent, Reducer, ComingEventValue, Snapshot } from './types';

import { Kafka, Admin, Producer, Consumer } from 'kafkajs';
import {
  kafkaConfig,
  defaultEventTopicConfig,
} from '../brokers/kafka/default-config';
import { defaultConsumerConfig } from './default-config';
import { db } from './mongo';
import { Collection } from 'mongodb';
const SNAPSHOT_COUNT_LIMIT = 50;
type Instance = {
  data: any;
  offset: string;
  key: string;
  snapshotCount: number;
  partition: number;
};

const kafka = new Kafka(kafkaConfig);

export class Store<T> {
  ready: boolean = false;
  dataDictionary: { [name: string]: Instance } = {};
  dataArray: Instance[] = [];
  admin: Admin;
  consumer: Consumer;
  producer: Producer;
  dbCollection: Collection;
  aggregateTopic: string;
  partitionOffset: {
    [partition: string]: number;
  } = {};
  partitionCount: { [partition: string]: number } = {};
  currentPartitions = {};

  constructor(
    private storeName: string,
    private reducer: Reducer<T>,
    options: { realTimeDatabase: boolean },
  ) {
    this.admin = kafka.admin();
    this.producer = kafka.producer();
    this.consumer = kafka.consumer(defaultConsumerConfig(`store.${storeName}`));

    this.aggregateTopic = `events.aggregate.${this.storeName}`;
  }
  public async init() {
    this.dbCollection = (await db).collection(this.storeName);
    await this.admin.createTopics({
      topics: [defaultEventTopicConfig(this.aggregateTopic)],
    });
    await this.producer.connect();
    await this.consumer.connect();
    this.setupStore();
    await this.consumer.subscribe({
      topic: this.aggregateTopic,
      fromBeginning: true,
    });

    this.consumer.run({
      autoCommit: true,
      partitionsConsumedConcurrently: 5,
      eachMessage: async ({
        message: { key: keyBuffer, offset, value },
        partition,
      }) => {
        const key = keyBuffer.toString('utf-8');
        console.log(partition, key, offset);
        const event: ComingEventValue = JSON.parse(value.toString('utf-8'));
        const currentState = await this.getCurrentState(key, partition, offset);
        if (currentState === null) return;
        const newState = this.reducer(currentState.data, {
          payload: event.data,
          type: event.type,
        });
        this.dataDictionary[key].offset = offset;
        this.dataDictionary[key].data = newState;
        this.partitionOffset[partition] = parseInt(offset);
        console.log(this.partitionCount[partition]);
        if (this.partitionCount[partition] > SNAPSHOT_COUNT_LIMIT) {
          this.dataArray
            .filter(
              ({ partition: objectPartition }) => partition === objectPartition,
            )
            .forEach(({ data, key }) => {
              this.dbCollection.update(
                { snapId: key },
                { data, offset, snapId: key, partition },
              );
            });
          this.partitionCount[partition] = 0;
        }
        this.partitionCount[partition] =
          this.partitionCount[partition] !== undefined
            ? this.partitionCount[partition] + 1
            : 0;
      },
    });
  }

  setupStore() {
    this.consumer.on('consumer.group_join', async (...args) => {
      console.log('REBALANCING');
      const partitions = args[0].payload.memberAssignment[this.aggregateTopic];
      this.ready = false;
      this.dataArray = [];
      this.dataDictionary = {};
      this.currentPartitions = {};
      partitions.forEach(n => {
        this.currentPartitions[n] = true;
      });
      const results = await this.dbCollection
        .find({
          partition: { $in: partitions },
        })
        .sort({ offset: 1 })
        .toArray();
      results.forEach(snapshot => {
        this.getCurrentState(
          snapshot.snapId,
          snapshot.partition,
          snapshot.offset,
          snapshot,
        );
      });
      this.ready = true;
    });
  }

  async getCurrentState(
    key: string,
    partition: number,
    offset: string,
    storeFound?: any,
  ) {
    let currentState = this.dataDictionary[key];

    if (currentState && parseInt(currentState.offset) > parseInt(offset)) {
      return null;
    }
    if (currentState) return currentState;
    const snapshot: Snapshot =
      storeFound || (await this.dbCollection.findOne({ snapId: key }));
    if (snapshot) {
      this.dataDictionary[key] = {
        data: snapshot.data,
        offset,
        key,
        snapshotCount: 0,
        partition,
      };
      this.dataArray.push(this.dataDictionary[key]);
      if (
        // Current partition offset is grater than snapshot offset go back
        !this.partitionOffset[partition] ||
        this.partitionOffset[partition] > parseInt(snapshot.offset)
      ) {
        this.consumer.seek({
          offset: (parseInt(snapshot.offset) + 1).toString(),
          partition,
          topic: this.aggregateTopic,
        });
        this.partitionOffset[partition] = parseInt(snapshot.offset);
      }

      return null;
    } else {
      this.dataDictionary[key] = {
        data: {},
        offset,
        key,
        snapshotCount: 0,
        partition,
      };
      this.dataArray.push(this.dataDictionary[key]);
      await this.dbCollection.insertOne({
        snapId: key,
        data: {},
        offset,
        partition,
      } as Snapshot);
      return { data: {} };
    }
  }
}
