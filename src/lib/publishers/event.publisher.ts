import {
  IEventPublisher,
  IMessageSource,
  IEvent,
  EventPublisher as Es,
  EventBus,
} from '@nestjs/cqrs';
import { Subject } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { rabbitPrefix } from '../../const';
import { KafkaBroker } from '../brokers/kafka';

@Injectable()
export class AppEventPublisher extends Es
  implements IEventPublisher, IMessageSource {
  domainName: string;
  eventClasses: any[] = [];
  constructor(private es: EventBus) {
    super(es);
  }

  setDomainName(domainName: string) {
    new KafkaBroker({ groupId: domainName }, true);
    this.domainName = domainName;
  }

  publish<T extends IEvent>(event: T) {
    const broker = new KafkaBroker({ groupId: this.domainName }, true);
    let routing = '';
    const aggregateId = (event as any).aggregateId;
    if ((event as any).constructor.aggregateName) {
      const aggregateName = (event as any).constructor.aggregateName;

      routing = `events.aggregate.${aggregateName}`;
    } else if ((event as any).constructor.domainName) {
      const domainName = (event as any).constructor.domainName;
      routing = `events.domain.${domainName}.${event.constructor.name}`;
    }

    broker.publish(
      rabbitPrefix + routing,
      {
        aggregateId: aggregateId || null,
        type: event.constructor.name,
        data: event,
      },
      aggregateId || null,
    );
  }

  bridgeEventsTo<T extends IEvent>(subject: Subject<T>) {
    const broker = new KafkaBroker({ groupId: this.domainName }, true);
    this.eventClasses.forEach(async EventClass => {
      const onEvent = async msg => {
        // Await or not await ?
        if (msg.type === EventClass.name) {
          const obj = new EventClass();
          await subject.next(Object.setPrototypeOf(msg.data, obj));
        }
      };
      if (EventClass.domainName) {
        broker.subscribeTo(
          rabbitPrefix +
          `events.domain.${EventClass.domainName}.${EventClass.name}`,
          onEvent,
        );
      } else if (EventClass.aggregateName) {
        broker.subscribeTo(
          rabbitPrefix + `events.aggregate.${EventClass.aggregateName}`,
          onEvent,
        );
      }
    });
  }

  public registerEvents(eventClasses: any[]) {
    this.eventClasses = eventClasses;
  }
}
