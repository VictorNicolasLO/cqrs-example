import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CarRepository } from '../../repositories/car.repository';
import { NotFoundException } from '@nestjs/common';
import { RemoveItemFromCarCommand } from '../impl/remove-item-from-car.command';

@CommandHandler(RemoveItemFromCarCommand)
export class RemoveItemFromCarHandler
  implements ICommandHandler<RemoveItemFromCarCommand> {
  constructor(
    private repository: CarRepository,
  ) { }

  async execute({ carId, itemDto }: RemoveItemFromCarCommand) {
    const car = await this.repository.findById(carId)
    if (!car) {
      throw new NotFoundException("Car not exist")
    }
    car.removeItem(itemDto);
    this.repository.persist(car)
    return car.toDto()
  }
}