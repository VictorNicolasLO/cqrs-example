import { CarCreatedHandler } from "./car-created.handler";
import { CarItemAddedHandler } from "./car-added-item.handler";
import { CarRemovedItemHandler } from "./car-removed-item.handler";

export const eventHandlers = [
    CarCreatedHandler,
    CarItemAddedHandler,
    CarRemovedItemHandler
]