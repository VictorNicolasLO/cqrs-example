import { Client, Producer } from 'pulsar-client';
import { Rpc } from './rpc';
const client = new Client({
  serviceUrl: process.env.PULSAR_URL || 'pulsar://localhost:6650',
  operationTimeoutSeconds: 30,
  ioThreads: 100,
  messageListenerThreads: 100,
});
let instances = {};
export class PulsarBroker {
  private pulsarRpc: Rpc;
  private producers: { [x: string]: Producer } = {};
  private groupId: string;

  constructor(private options: { groupId: string }, singleton?: boolean) {
    if (instances[options.groupId] && singleton)
      return instances[options.groupId];

    console.log('INNIT', options.groupId);
    this.groupId = options.groupId;
    this.init();
    instances[options.groupId] = this;
  }

  private init() {
    this.pulsarRpc = new Rpc(client, this.groupId);
  }

  public async request(topic: string, data: any) {
    return await this.pulsarRpc.request(topic, data);
  }

  public rpc(topic: string, cb: (message: any) => any) {
    this.pulsarRpc.rpc(topic, cb);
  }

  public async subscribeTo(topic: string, cb: (message: any) => Promise<void>) {
    await (client.subscribe as any)({
      topic: `persistent://public/default/${topic}`,
      subscription: this.groupId,
      subscriptionType: 'KeyShared' as any,
      ackTimeoutMs: 10000,
      ...{ subscriptionInitialPosition: 'Earliest' },
      listener: async (msg, msgConsumer) => {
        try {
          await cb(JSON.parse(msg.getData().toString()));
          msgConsumer.acknowledge(msg);
        } catch (e) {
          msgConsumer.negativeAcknowledge(msg);
        }
      },
    });
  }

  public async publish(topic: string, message: any, key: string) {
    if (!this.producers[topic]) {
      this.producers[topic] = await client.createProducer({
        topic: `persistent://public/default/${topic}`,
        sendTimeoutMs: 30000,
        batchingEnabled: true,
        hashingScheme: 'Murmur3_32Hash',
      });
    }
    this.producers[topic].send({
      data: Buffer.from(JSON.stringify(message)),
      partitionKey: key,
      eventTimestamp: Date.now(),
    });
  }
}
