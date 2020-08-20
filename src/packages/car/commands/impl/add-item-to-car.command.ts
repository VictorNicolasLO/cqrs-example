import { CarCommand } from '../car.command'
import { IItem } from '../../models/interfaces/icar';
export class AddItemToCarCommand extends CarCommand {
  constructor(public itemDto: IItem, public carId: string) {
    super();
  }
}
