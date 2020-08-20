import { Injectable } from '@nestjs/common';
import { GenericRepository } from '../../../lib/repositories/generic-repository';
import { MongoDriver } from '../../../lib/db-drivers/mongo-driver';
import { EventPublisher } from '@nestjs/cqrs';
import { CarModel } from '../models/car.model';
import { ICar } from '../models/interfaces/icar';

@Injectable()
export class CarRepository extends GenericRepository<
CarModel,
ICar
> {
    constructor(public ep: EventPublisher) {
        super(new MongoDriver('car'), CarModel, ep);
    }
}
