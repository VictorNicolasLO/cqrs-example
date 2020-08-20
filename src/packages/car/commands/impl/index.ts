import { CreateCarCommand } from "./create-car.command";
import { AddItemToCarCommand } from "./add-item-to-car.command";
import { RemoveItemFromCarCommand } from "./remove-item-from-car.command";

export const commands = [
    CreateCarCommand,
    AddItemToCarCommand,
    RemoveItemFromCarCommand
]