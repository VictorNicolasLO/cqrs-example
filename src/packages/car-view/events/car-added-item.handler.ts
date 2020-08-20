import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CarViewRepository } from '../repositories/car-view.repository';
import { ItemAddedEvent } from '../../car/events/aggregate-events/item-added';

@EventsHandler(ItemAddedEvent)
export class CarItemAddedHandler
    implements IEventHandler<ItemAddedEvent> {
    constructor(
        private carViewRepository: CarViewRepository
    ) { }

    async handle({
        item,
        aggregateId
    }: ItemAddedEvent) {
        const car = await this.carViewRepository.findById(aggregateId)
        car.items.push(item);
        this.carViewRepository.update({ id: aggregateId, }, car)
    }
}
