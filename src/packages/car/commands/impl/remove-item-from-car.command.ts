import { CarCommand } from '../car.command'
import { IItem } from '../../models/interfaces/icar';
export class RemoveItemFromCarCommand extends CarCommand {
  constructor(public itemDto: IItem, public carId: string) {
    super();
  }
}
