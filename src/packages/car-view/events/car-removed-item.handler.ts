import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CarViewRepository } from '../repositories/car-view.repository';
import { ItemRemovedEvent } from '../../car/events/aggregate-events/item-removed';

@EventsHandler(ItemRemovedEvent)
export class CarRemovedItemHandler
    implements IEventHandler<ItemRemovedEvent> {
    constructor(
        private carViewRepository: CarViewRepository
    ) { }

    async handle({
        item,
        aggregateId
    }: ItemRemovedEvent) {
        const car = await this.carViewRepository.findById(aggregateId)
        car.items = car.items.filter(({ name }) => item.name !== name);
        this.carViewRepository.update({ id: aggregateId, }, car)
    }
}
