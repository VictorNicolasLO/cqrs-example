import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ItemAddedEvent } from '../../car/events/aggregate-events/item-added';
import { ItemsAddedCountRepository } from '../repositories/car-view.repository';

@EventsHandler(ItemAddedEvent)
export class CarItemAddedHandler
    implements IEventHandler<ItemAddedEvent> {
    constructor(
        private repository: ItemsAddedCountRepository
    ) { }

    async handle() {
        const itemAddedCount = await this.repository.findOne({})
        if (itemAddedCount) {
            itemAddedCount.number += 1;
            await this.repository.update({}, itemAddedCount)
        } else {
            this.repository.create({ number: 1 })
        }

    }
}
