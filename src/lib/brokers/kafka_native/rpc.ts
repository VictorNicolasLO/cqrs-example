import { v1 as uuid } from 'uuid';
import { IAdminClient } from 'node-rdkafka';
import {
  defaultReplyTopic,
  defaultReplyConsumerconfig,
  defaultRequestTopic,
} from './default-config';
import { NConsumer, NProducer, KafkaMessage } from 'sinek';
import { RequestTimeoutException } from '@nestjs/common';
import { Subscriber } from './subscriber';

export class Rpc {
  private consumer: NConsumer;
  private pendingResponses = {};
  private createdTopics = {};
  private replyTopic: string;
  constructor(
    private kafkaClient: IAdminClient,
    private producer: NProducer,
    private subscriber: Subscriber,
  ) {
    this.replyTopic = `reply.${uuid()}`;
    kafkaClient.createTopic(defaultReplyTopic(this.replyTopic), () => {
      this.setupReplyConsumer();
    });
    process.on('exit', () => {
      this.consumer.close(true);
      kafkaClient.deleteTopic(this.replyTopic);
      console.log('Goodbye!');
    });
  }

  private async setupReplyConsumer() {
    this.consumer = new NConsumer(
      [this.replyTopic],
      defaultReplyConsumerconfig,
    );

    await this.consumer.connect();
    this.consumer.on('error', error => {
      throw error;
    });
    await this.consumer.consume(
      async (messages, callback) => {
        const proccessMessage = (message: KafkaMessage) => {
          const {
            value: { error, response, requestId },
          } = message;
          const { timeoutId, resolve, reject } = this.pendingResponses[
            requestId
          ];
          clearTimeout(timeoutId);
          if (!error) resolve(response);
          else reject(error);
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

  public rpc(topic: string, cb: (data: any) => any) {
    this.subscriber.subscribe(
      topic,
      async message => {
        const { data, replyTopic, requestId } = message.value;
        try {
          const response = await cb(data);
          await this.producer.send(
            replyTopic,
            JSON.stringify({
              response,
              requestId,
            }),
          );
        } catch (e) {
          console.log(e);
          await this.producer.send(
            replyTopic,
            JSON.stringify({
              error: e,
              requestId,
            }),
          );
        }
      },
      defaultRequestTopic(topic),
    );
  }

  request(topic: string, data: any) {
    return new Promise(async (resolve, reject) => {
      const run = async () => {
        const requestId = uuid();
        await this.producer.send(
          topic,
          JSON.stringify({
            data,
            replyTopic: this.replyTopic,
            requestId,
          }),
        );
        const timeoutId = setTimeout(() => {
          reject(
            new RequestTimeoutException(`Request time out for topic ${topic}`),
          );
        }, ((process.env.REQUEST_TIME_OUT as unknown) as number) || 30000);
        this.pendingResponses[requestId] = { resolve, timeoutId, reject };
      };
      if (this.createdTopics[topic]) {
        run();
      } else {
        console.log(topic);
        this.kafkaClient.createTopic(defaultRequestTopic(topic), () => {
          run();
        });
        this.createdTopics[topic] = true;
      }
    });
  }
}
