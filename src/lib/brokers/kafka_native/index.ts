import { IAdminClient, AdminClient } from 'node-rdkafka';
import { NProducer } from 'sinek';
import { Rpc } from './rpc';
import { Subscriber } from './subscriber';
import {
  defaultClientConfig,
  defaultProducerConfig,
  defaultEventTopicConfig,
} from './default-config';
let instances = {};
export class KafkaBroker {
  private createdTopics = {};
  private kafkaRpc: Rpc;
  private admin: IAdminClient;
  private producer: NProducer;
  private subscriber: Subscriber;
  constructor(options: { groupId: string }, singleton?: boolean) {
    if (instances[options.groupId] && singleton)
      return instances[options.groupId];
    this.admin = AdminClient.create(defaultClientConfig);
    this.producer = new NProducer(defaultProducerConfig);
    this.producer.on('error', error => console.error(error));
    this.producer.connect().then(() => {
      console.log(options.groupId);
      console.log('CONNECTED');
    });
    this.subscriber = new Subscriber(this.admin, options.groupId);
    this.kafkaRpc = new Rpc(this.admin, this.producer, this.subscriber);
    instances[options.groupId] = this;
  }

  public async request(topic: string, data: any) {
    return await this.kafkaRpc.request(topic, data);
  }

  public rpc(topic: string, cb: (message: any) => any) {
    this.kafkaRpc.rpc(topic, cb);
  }

  public subscribeTo(topic: string, cb: (message: any) => void) {
    this.subscriber.subscribe(topic, ({ value }) => {
      cb(value);
    });
  }

  public publish(topic: string, message: any, key: string) {
    if (this.createdTopics[topic]) {
      this.producer.send(topic, JSON.stringify(message), null, key);
    } else {
      this.admin.createTopic(defaultEventTopicConfig(topic), () => {
        this.producer.send(topic, JSON.stringify(message), null, key);
      });
      this.createdTopics[topic] = true;
    }
  }
}
