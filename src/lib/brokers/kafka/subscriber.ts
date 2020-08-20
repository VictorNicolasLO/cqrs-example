import {
  Kafka,
  Admin,
  Consumer,
  EachMessagePayload,
  ITopicConfig,
} from 'kafkajs';

import { NewTopic } from 'node-rdkafka';

import {
  defaultConsumerConfig,
  defaultEventTopicConfig,
} from './default-config';

export class Subscriber {
  private consumer: Consumer;
  private callbacks = {};
  constructor(
    private kafka: Kafka,
    private kafkaClient: Admin,
    private groupId: string,
  ) {
    this.setupConsumer();
    setTimeout(() => {
      this.runConsumer();
    }, 5000);
  }

  async subscribe(
    topic: string,
    cb: (message: EachMessagePayload) => void,
    topicConfig?: ITopicConfig,
  ) {
    await this.kafkaClient.createTopics({
      topics: [topicConfig || defaultEventTopicConfig(topic)],
    });
    if (!this.callbacks[topic]) {
      this.callbacks[topic] = [cb];
      console.log('TOPIC ADDED', topic);
      await this.consumer.subscribe({
        topic,
        fromBeginning: true,
      });
    } else {
      this.callbacks[topic].push(cb);
    }
  }

  private async setupConsumer() {
    this.consumer = this.kafka.consumer(defaultConsumerConfig(this.groupId));
    await this.consumer.connect();
    this.consumer.on('consumer.crash', error => {
      throw error;
    });
    console.log('CONSUMER CONNECTED');
  }

  public async runConsumer() {
    console.log('CONSUMER RUNNING');
    await this.consumer.run({
      autoCommit: true,
      eachMessage: async (message: EachMessagePayload) => {
        console.log('llego');
        console.log(message.partition, message.topic);
        this.callbacks[message.topic].forEach(cb => {
          cb(message);
        });
      },
    });
  }
}
