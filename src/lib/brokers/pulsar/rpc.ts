import { v1 as uuid } from 'uuid';
import { RequestTimeoutException } from '@nestjs/common';
import { Client, Producer } from 'pulsar-client';
import { jsonToBuffer } from './utils';
export class Rpc {
  private pendingResponses = {};
  private replyTopic: string;
  private producers: { [x: string]: Producer } = {};
  constructor(private client: Client, private groupId: string) {
    this.replyTopic = `reply-${uuid()}`;
    this.init();
  }

  private async init() {
    this.setupReplyConsumer();
  }

  private async setupReplyConsumer() {
    await (this.client.subscribe as any)({
      topic: `non-persistent://public/default/${this.replyTopic}`,
      subscription: this.replyTopic,
      subscriptionType: 'Exclusive',
      ackTimeoutMs: 10000,
      listener: async (msg, msgConsumer) => {
        const { error, response, requestId } = JSON.parse(
          msg.getData().toString(),
        );
        const { timeoutId, resolve, reject } = this.pendingResponses[requestId];
        clearTimeout(timeoutId);
        if (!error) resolve(response);
        else reject(error);
        msgConsumer.acknowledge(msg);
      },
    });
  }

  public async rpc(topic: string, cb: (data: any) => any) {
    await (this.client.subscribe as any)({
      topic: `non-persistent://public/default/${topic}`,
      subscription: this.groupId,
      subscriptionType: 'Shared',
      ackTimeoutMs: 10000,
      listener: async (msg, msgConsumer) => {
        const { data, replyTopic, requestId } = JSON.parse(
          msg.getData().toString(),
        );
        const replyProducer = await this.getProducer(replyTopic);
        try {
          const response = await cb(data);
          replyProducer.send({
            data: jsonToBuffer({
              response,
              requestId,
            }),
            eventTimestamp: Date.now(),
          });
        } catch (e) {
          replyProducer.send({
            data: jsonToBuffer({
              error: e,
              requestId,
            }),
            eventTimestamp: Date.now(),
          });
        }
        msgConsumer.acknowledge(msg);
      },
    });
  }

  request(topic: string, data: any) {
    return new Promise(async (resolve, reject) => {
      const run = async () => {
        const requestId = uuid();
        const rpcProducer = await this.getProducer(topic);
        rpcProducer.send({
          data: jsonToBuffer({
            data,
            replyTopic: this.replyTopic,
            requestId,
          }),
          eventTimestamp: Date.now(),
        });
        const timeoutId = setTimeout(() => {
          reject(
            new RequestTimeoutException(`Request time out for topic ${topic}`),
          );
        }, ((process.env.REQUEST_TIME_OUT as unknown) as number) || 30000);
        this.pendingResponses[requestId] = { resolve, timeoutId, reject };
      };
      run();
    });
  }

  async getProducer(topic: string) {
    if (!this.producers[topic]) {
      this.producers[topic] = await this.client.createProducer({
        topic: `non-persistent://public/default/${topic}`,
        sendTimeoutMs: 30000,
        batchingEnabled: true,
      });
    }
    return this.producers[topic];
  }
}
