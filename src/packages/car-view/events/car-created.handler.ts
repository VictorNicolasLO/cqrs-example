import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CarCreatedEvent } from '../../car/events/aggregate-events/car-created.event';
import { CarViewRepository } from '../repositories/car-view.repository';

@EventsHandler(CarCreatedEvent)
export class CarCreatedHandler
    implements IEventHandler<CarCreatedEvent> {
    constructor(
        private carViewRepository: CarViewRepository
    ) { }

    async handle({
        car
    }: CarCreatedEvent) {
        this.carViewRepository.create(car)
    }
}
