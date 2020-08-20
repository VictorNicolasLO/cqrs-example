import { Injectable } from '@nestjs/common';
import { GenericReadRepository } from '../../../lib/repositories/generic-read-repository';
import { MongoDriver } from '../../../lib/db-drivers/mongo-driver';
import { ICarView } from './interfaces/icar-view';


@Injectable()
export class CarViewRepository extends GenericReadRepository<ICarView> {
  constructor() {
    super(new MongoDriver('car-view'));
  }
}
