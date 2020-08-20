import { NewTopic } from 'node-rdkafka';
import { v1 as uuid } from 'uuid';

import { KafkaProducerConfig, KafkaConsumerConfig } from 'sinek';
export const defaultEventTopicConfig = (name: string): NewTopic => ({
  num_partitions: 10,
  topic: name,
  replication_factor: 1,
  config: { 'retention.ms': '-1' },
});

export const defaultReplyTopic = (name: string): NewTopic => ({
  num_partitions: 1,
  topic: name,
  replication_factor: 0,
  config: { 'retention.ms': '0' },
});

export const defaultRequestTopic = (name: string): NewTopic => ({
  num_partitions: 5,
  topic: name,
  replication_factor: 0,
  config: { 'retention.ms': '0' },
});

export const defaultClientConfig = {
  'client.id': 'kafka-admin',
  'metadata.broker.list': process.env.KAFKA_BROKER_LIST || 'localhost:9092',
};

export const defaultProducerConfig: KafkaProducerConfig = {
  noptions: {
    'metadata.broker.list': process.env.KAFKA_BROKER_LIST || 'localhost:9092',
    'client.id': 'app',
    'compression.codec': 'none',
    'socket.keepalive.enable': true,
    'api.version.request': true,
    'queue.buffering.max.ms': 10,
  },
  tconf: {
    'request.required.acks': 1,
  },
};

export const defaultConsumerConfig = (
  groupId: string,
): KafkaConsumerConfig => ({
  noptions: {
    'metadata.broker.list': process.env.KAFKA_BROKER_LIST || 'localhost:9092',
    'group.id': groupId,
    'client.id': 'example-client',
    'enable.auto.commit': false,
    'socket.keepalive.enable': true,
    'api.version.request': true,
    'fetch.wait.max.ms': 1,
  },
  tconf: {
    'auto.offset.reset': 'beginning',
  },
});

export const defaultReplyConsumerconfig: KafkaConsumerConfig = {
  noptions: {
    'metadata.broker.list': process.env.KAFKA_BROKER_LIST || 'localhost:9092',
    'enable.auto.commit': false,
    'group.id': uuid(),
    'socket.keepalive.enable': true,
    'api.version.request': true,
    'fetch.wait.max.ms': 1,
  },
};
