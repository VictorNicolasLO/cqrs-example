import { v1 as uuid } from 'uuid';
import { IAdminClient } from 'node-rdkafka';
import {
  defaultReplyTopic,
  defaultReplyConsumerconfig,
  defaultRequestTopic,
} from './default-config';
import { Kafka, Admin, Consumer, EachMessagePayload, Producer } from 'kafkajs';
import { RequestTimeoutException } from '@nestjs/common';
import { Subscriber } from './subscriber';

export class Rpc {
  private consumer: Consumer;
  private pendingResponses = {};
  private createdTopics = {};
  private replyTopic: string;
  constructor(
    private kafka: Kafka,
    private kafkaClient: Admin,
    private producer: Producer,
    private subscriber: Subscriber,
  ) {
    this.init();
  }

  private async init() {
    this.replyTopic = `reply.${uuid()}`;
    await this.kafkaClient.createTopics({
      topics: [defaultReplyTopic(this.replyTopic)],
    });
    this.setupReplyConsumer();
    process.on('exit', async () => {
      this.consumer.disconnect();
      await this.kafkaClient.deleteTopics({ topics: [this.replyTopic] });
      console.log('Goodbye!');
    });
  }

  private async setupReplyConsumer() {
    this.consumer = this.kafka.consumer(defaultReplyConsumerconfig());

    await this.consumer.connect();
    this.consumer.on('consumer.crash', error => {
      throw error;
    });

    await this.consumer.subscribe({
      topic: this.replyTopic,
    });

    await this.consumer.run({
      autoCommit: true,
      eachMessage: async message => {
        const {
          message: { value },
        } = message;
        const { error, response, requestId } = JSON.parse(
          value.toString('utf-8'),
        );
        const { timeoutId, resolve, reject } = this.pendingResponses[requestId];
        clearTimeout(timeoutId);
        if (!error) resolve(response);
        else reject(error);
      },
    });
  }

  public rpc(topic: string, cb: (data: any) => any) {
    this.subscriber.subscribe(
      topic,
      async payload => {
        const { data, replyTopic, requestId } = JSON.parse(
          payload.message.value.toString('utf-8'),
        );
        try {
          const response = await cb(data);
          const responsePayload = {
            topic: replyTopic,
            messages: [
              {
                value: JSON.stringify({
                  response,
                  requestId,
                }),
              },
            ],
            acks: 0,
          };
          await this.producer.send(responsePayload);
        } catch (e) {
          console.log(e);
          await this.producer.send({
            topic: replyTopic,
            messages: [
              {
                value: JSON.stringify({
                  error: e,
                  requestId,
                }),
              },
            ],
            acks: 0,
          });
        }
      },
      defaultRequestTopic(topic),
    );
  }

  request(topic: string, data: any) {
    return new Promise(async (resolve, reject) => {
      const run = async () => {
        const requestId = uuid();

        await this.producer.send({
          topic,
          messages: [
            {
              value: JSON.stringify({
                data,
                replyTopic: this.replyTopic,
                requestId,
              }),
            },
          ],
          acks: 0,
        });

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
        await this.kafkaClient.createTopics({
          topics: [defaultRequestTopic(topic)],
        });
        run();
        this.createdTopics[topic] = true;
      }
    });
  }
}
