import { AddItemToCarHandler } from "./add-item-to-car.handler";
import { CreateCarHandler } from "./create-car-handler";
import { RemoveItemFromCarHandler } from "./remove-item-from-car.handler";

export const commandHandlers = [
    AddItemToCarHandler,
    CreateCarHandler,
    RemoveItemFromCarHandler
]