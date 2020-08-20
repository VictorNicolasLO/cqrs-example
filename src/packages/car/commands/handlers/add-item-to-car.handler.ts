import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CarRepository } from '../../repositories/car.repository';
import { NotFoundException } from '@nestjs/common';
import { AddItemToCarCommand } from '../impl/add-item-to-car.command';

@CommandHandler(AddItemToCarCommand)
export class AddItemToCarHandler
  implements ICommandHandler<AddItemToCarCommand> {
  constructor(
    private repository: CarRepository,
  ) { }

  async execute({ carId, itemDto }: AddItemToCarCommand) {
    const car = await this.repository.findById(carId)
    if (!car) {
      throw new NotFoundException("Car not exist")
    }
    car.addItem(itemDto);
    this.repository.persist(car)
    return car.toDto()
  }
}