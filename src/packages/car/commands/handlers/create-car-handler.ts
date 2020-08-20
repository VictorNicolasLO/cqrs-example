import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCarCommand } from '../impl/create-car.command';
import { CarRepository } from '../../repositories/car.repository';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(CreateCarCommand)
export class CreateCarHandler
  implements ICommandHandler<CreateCarCommand> {
  constructor(
    private repository: CarRepository,
  ) { }

  async execute({ carDto }: CreateCarCommand) {
    const carExist = await this.repository.findOne({ ownerId: carDto.ownerId })
    if (carExist) {
      throw new BadRequestException("Car already exist")
    }
    const carCreated = await this.repository.create(carDto)
    return carCreated.toDto()
  }
}