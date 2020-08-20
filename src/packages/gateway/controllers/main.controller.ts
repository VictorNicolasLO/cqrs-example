import 'isomorphic-fetch';
import {
  Controller,
  Post,
  Body,
  Param,
  Get,
} from '@nestjs/common';
import { AppCommandBus } from '../../../lib/publishers/app-command-bus';
import { CreateCarCommand } from '../../car/commands/impl/create-car.command';
import { AddItemToCarCommand } from '../../car/commands/impl/add-item-to-car.command';
import { RemoveItemFromCarCommand } from '../../car/commands/impl/remove-item-from-car.command';
import { GetCarByIdQuery } from '../../car-view/queries/impl/get-car-by-id.query';
import { GetItemsAddedCountQuery } from '../../analytics/queries/impl/get-items-added-count.query';
import { AppQueryBus } from '../../../lib/publishers/app-query-bus';


@Controller('api/')
export class MainController {
  constructor(private commandBus: AppCommandBus, private queryBus: AppQueryBus) { }

  @Post()
  async createCar(@Body() body) {
    return await this.commandBus.execute(new CreateCarCommand(body));
  }

  @Post('car/:id/add-item-to-car')
  async signIn(@Body() body, @Param("id") id) {
    return await this.commandBus.execute(new AddItemToCarCommand(body, id));
  }

  @Post('car/:id/remove-item-from-car')
  async logout(@Body() body, @Param("id") id) {
    return await this.commandBus.execute(new RemoveItemFromCarCommand(body, id));
  }

  @Get("car/:id")
  async getCarById(@Param("id") id) {
    return await this.queryBus.execute(new GetCarByIdQuery(id))
  }

  @Get("/analytics/items-added-count")
  async getItemsAddedCount() {
    return await this.queryBus.execute(new GetItemsAddedCountQuery())
  }



}
