import { IItem } from '../../models/interfaces/icar';
import { CarAggregateEvent } from '../car.aggregate-event';

export class ItemAddedEvent extends CarAggregateEvent {
  constructor(public aggregateId: string, public item: IItem) {
    super();
  }
}
