import { ICar } from '../../models/interfaces/icar';
import { CarAggregateEvent } from '../car.aggregate-event';

export class CarCreatedEvent extends CarAggregateEvent {
  constructor(public aggregateId: string, public car: ICar) {
    super();
  }
}
