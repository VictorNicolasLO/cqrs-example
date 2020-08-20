import { CarViewQuery } from '../car-view.query';

export class GetCarByIdQuery extends CarViewQuery {
    constructor(public id: string) {
        super();
    }
}
