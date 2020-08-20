export abstract class AggregateEvent {
  abstract aggregateId: string;
  static aggregateName: string;
}
