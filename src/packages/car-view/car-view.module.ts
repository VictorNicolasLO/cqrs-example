import { Module } from '@nestjs/common';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { AppEventPublisher } from '../../lib/publishers/event.publisher';
import { AppQueryBus } from '../../lib/publishers/app-query-bus';

import { CarCreatedEvent } from '../car/events/aggregate-events/car-created.event';
import { ItemAddedEvent } from '../car/events/aggregate-events/item-added';
import { ItemRemovedEvent } from '../car/events/aggregate-events/item-removed';
import { CarViewRepository } from './repositories/car-view.repository';
import { eventHandlers } from './events';
import { GetCarByIdHandler } from './queries/handlers/get-car-by-id.handler';

@Module({
    imports: [CqrsModule],
    controllers: [],
    providers: [
        CarViewRepository,
        AppQueryBus,
        AppEventPublisher,
        ...eventHandlers,
        ...[GetCarByIdHandler],
    ],
})
export class CarViewModule {
    constructor(
        private readonly query$: AppQueryBus,
        private readonly event$: EventBus,
        private readonly eventPublisher: AppEventPublisher,
    ) {
        /** ------------ */
        this.eventPublisher.setDomainName('car-view');
        this.event$.register(eventHandlers);
        this.eventPublisher.registerEvents([
            CarCreatedEvent,
            ItemAddedEvent,
            ItemRemovedEvent,
        ]);
        this.eventPublisher.bridgeEventsTo((this.event$ as any).subject$);
        this.event$.publisher = this.eventPublisher;
        /** ------------ */
        this.query$.domainName = 'car-view';
        this.query$.register([GetCarByIdHandler]);
    }
}
