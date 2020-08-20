import { Injectable } from '@nestjs/common';
import { GenericReadRepository } from '../../../lib/repositories/generic-read-repository';
import { MongoDriver } from '../../../lib/db-drivers/mongo-driver';
import { IItemsAddedCount } from './interfaces/icar-view';


@Injectable()
export class ItemsAddedCountRepository extends GenericReadRepository<IItemsAddedCount> {
  constructor() {
    super(new MongoDriver('items-added-count'));
  }
}
