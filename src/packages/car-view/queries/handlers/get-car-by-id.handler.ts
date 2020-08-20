import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCarByIdQuery } from '../impl/get-car-by-id.query';
import { CarViewRepository } from '../../repositories/car-view.repository';

@QueryHandler(GetCarByIdQuery)
export class GetCarByIdHandler
    implements IQueryHandler<GetCarByIdQuery> {
    constructor(private readonly repository: CarViewRepository) { }

    async execute(query: GetCarByIdQuery) {
        return await this.repository.findById(query.id);
    }
}
