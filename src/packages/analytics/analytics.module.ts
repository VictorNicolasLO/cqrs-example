import { Module } from '@nestjs/common';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { AppEventPublisher } from '../../lib/publishers/event.publisher';
import { AppQueryBus } from '../../lib/publishers/app-query-bus';

import { CarCreatedEvent } from '../car/events/aggregate-events/car-created.event';
import { ItemAddedEvent } from '../car/events/aggregate-events/item-added';
import { ItemRemovedEvent } from '../car/events/aggregate-events/item-removed';
import { eventHandlers } from './events';
import { ItemsAddedCountRepository } from './repositories/car-view.repository';
import { GeItemsAddedCountHandler } from './queries/handlers/get-items-added-count.handler';

@Module({
    imports: [CqrsModule],
    controllers: [],
    providers: [
        ItemsAddedCountRepository,
        AppQueryBus,
        AppEventPublisher,
        ...eventHandlers,
        ...[GeItemsAddedCountHandler],
    ],
})
export class AnalyticsModule {
    constructor(
        private readonly query$: AppQueryBus,
        private readonly event$: EventBus,
        private readonly eventPublisher: AppEventPublisher,
    ) {
        /** ------------ */
        this.eventPublisher.setDomainName('analytics');
        this.event$.register(eventHandlers);
        this.eventPublisher.registerEvents([
            CarCreatedEvent,
            ItemAddedEvent,
            ItemRemovedEvent,
        ]);
        this.eventPublisher.bridgeEventsTo((this.event$ as any).subject$);
        this.event$.publisher = this.eventPublisher;
        /** ------------ */
        this.query$.domainName = 'analytics';
        this.query$.register([GeItemsAddedCountHandler]);
    }
}
