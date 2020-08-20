import { CarCommand } from '../car.command'
import { ICar } from '../../models/interfaces/icar';
export class CreateCarCommand extends CarCommand {
  constructor(public carDto: ICar) {
    super();
  }
}
