import { Module } from '@nestjs/common';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { AppCommandBus } from '../../lib/publishers/app-command-bus';
import { AppEventPublisher } from '../../lib/publishers/event.publisher';
import { commandHandlers } from './commands/handlers';

import { CarRepository } from './repositories/car.repository';

@Module({
    imports: [CqrsModule],
    controllers: [],
    providers: [
        CarRepository,
        AppCommandBus,
        AppEventPublisher,
        ...commandHandlers,
    ],
})
export class CarModule {
    constructor(
        private readonly command$: AppCommandBus,
        private readonly event$: EventBus,
        private readonly eventPublisher: AppEventPublisher,
    ) {
        /** ------------ */
        this.eventPublisher.setDomainName('car');
        this.eventPublisher.registerEvents([]);
        this.eventPublisher.bridgeEventsTo((this.event$ as any).subject$);
        this.event$.publisher = this.eventPublisher;
        /** ------------ */
        this.command$.domainName = 'car';
        this.command$.register(commandHandlers);
    }
}