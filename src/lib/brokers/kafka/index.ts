import { Kafka, Admin, Producer } from 'kafkajs';
import { Rpc } from './rpc';
import { Subscriber } from './subscriber';
import { defaultEventTopicConfig, kafkaConfig } from './default-config';
const kafka = new Kafka(kafkaConfig);

let instances = {};
export class KafkaBroker {
  private createdTopics = {};
  private kafkaRpc: Rpc;
  private admin: Admin;
  private producer: Producer;
  private subscriber: Subscriber;
  private subscribeToQueue: any[] = [];
  constructor(private options: { groupId: string }, singleton?: boolean) {
    if (instances[options.groupId] && singleton)
      return instances[options.groupId];
    console.log('INNIT', options.groupId);
    this.init();
    instances[options.groupId] = this;
  }

  private async init() {
    this.admin = await kafka.admin();
    this.producer = await kafka.producer();

    this.producer.connect().then(() => {
      console.log(this.options.groupId);
      console.log('CONNECTED');
    });
    this.subscriber = new Subscriber(kafka, this.admin, this.options.groupId);
    this.subscribeToQueue.forEach(args => {
      (this.subscribeTo as any)(...args);
    });
    this.kafkaRpc = new Rpc(kafka, this.admin, this.producer, this.subscriber);
  }

  public async request(topic: string, data: any) {
    return await this.kafkaRpc.request(topic, data);
  }

  public rpc(topic: string, cb: (message: any) => any) {
    this.kafkaRpc.rpc(topic, cb);
  }

  public subscribeTo(topic: string, cb: (message: any) => void) {
    if (this.subscriber)
      this.subscriber.subscribe(topic, ({ message: { value } }) => {
        cb(JSON.parse(value.toString('utf-8')));
      });
    else this.subscribeToQueue.push([topic, cb]);
  }

  public async publish(topic: string, message: any, key: string) {
    const payload = {
      topic,
      messages: [{ value: JSON.stringify(message), key }],
    };
    if (this.createdTopics[topic]) {
      this.producer.send(payload);
    } else {
      await this.admin.createTopics({
        topics: [defaultEventTopicConfig(topic)],
      });
      this.producer.send(payload);
      this.createdTopics[topic] = true;
    }
  }
}
