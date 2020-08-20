import { AggregateEvent } from '../../../lib/events/aggregate-event';

export abstract class CarAggregateEvent extends AggregateEvent {
  static aggregateName = 'car';
}
