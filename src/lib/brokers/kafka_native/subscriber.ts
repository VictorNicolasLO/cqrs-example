import { Consumer, KafkaConsumerConfig } from 'sinek';
import { IAdminClient, NewTopic } from 'node-rdkafka';
import { NConsumer, NProducer, KafkaMessage } from 'sinek';
import {
  defaultConsumerConfig,
  defaultEventTopicConfig,
} from './default-config';

export class Subscriber {
  private consumer: NConsumer;
  private callbacks = {};
  constructor(private kafkaClient: IAdminClient, private groupId: string) {
    this.setupConsumer();
  }

  subscribe(
    topic: string,
    cb: (message: KafkaMessage) => void,
    topicConfig?: NewTopic,
  ) {
    this.kafkaClient.createTopic(
      topicConfig || defaultEventTopicConfig(topic),
      () => {
        if (!this.callbacks[topic]) this.callbacks[topic] = [cb];
        else this.callbacks[topic].push(cb);
        this.consumer.addSubscriptions([topic]);
      },
    );
  }

  private async setupConsumer() {
    this.consumer = new NConsumer([], defaultConsumerConfig(this.groupId));

    await this.consumer.connect();
    this.consumer.on('error', error => {
      throw error;
    });

    await this.consumer.consume(
      async (messages, callback) => {
        console.log('llego');
        const proccessMessage = (message: KafkaMessage) => {
          this.callbacks[message.topic].forEach(cb => {
            cb(message);
          });
        };
        if (Array.isArray(messages)) {
          messages.forEach(proccessMessage);
        } else {
          proccessMessage(messages as KafkaMessage);
        }
        callback();
      },
      false,
      true,
    );
  }
}
