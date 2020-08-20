import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetItemsAddedCountQuery } from '../impl/get-items-added-count.query';
import { ItemsAddedCountRepository } from '../../repositories/car-view.repository';


@QueryHandler(GetItemsAddedCountQuery)
export class GeItemsAddedCountHandler
    implements IQueryHandler<GetItemsAddedCountQuery> {
    constructor(private readonly repository: ItemsAddedCountRepository) { }

    async execute(query: GetItemsAddedCountQuery) {
        return await this.repository.findOne({});
    }
}
