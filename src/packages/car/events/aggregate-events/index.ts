import { CarCreatedEvent } from "./car-created.event";
import { ItemAddedEvent } from "./item-added";
import { ItemRemovedEvent } from "./item-removed";

export const aggregateEvents = [
    CarCreatedEvent,
    ItemAddedEvent,
    ItemRemovedEvent
]