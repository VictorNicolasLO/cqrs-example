import { Model, ModelOptions } from "../../../lib/model";
import { ICar, IItem } from "./interfaces/icar";
import { ConflictException } from "@nestjs/common";
import { ItemAddedEvent } from "../events/aggregate-events/item-added";
import { ItemRemovedEvent } from "../events/aggregate-events/item-removed";
import { CarCreatedEvent } from "../events/aggregate-events/car-created.event";

// Domain Model!
export class CarModel extends Model<ICar> implements ICar {
    private _ownerId: string
    private _items: IItem[]

    constructor(dto: ICar, options?: ModelOptions) {
        super(dto, options)
    }

    get ownerId() {
        return this._ownerId
    }

    get items() {
        return this._items
    }

    set ownerId(value: string) {
        this._ownerId = value
    }

    set items(value: IItem[]) {
        this._items = value
    }

    create() {
        this.apply(new CarCreatedEvent(this.id, this.toDto()));
    }

    addItem(item: IItem) {
        const itemExist = this.items.find(({ name }) => item.name === name)
        if (itemExist)
            throw new ConflictException("Item already exist")
        this.items.push(item)
        this.apply(new ItemAddedEvent(this.id, item))
    }

    removeItem(item: IItem) {
        const itemExist = this.items.find(({ name }) => item.name === name)
        if (!itemExist)
            throw new ConflictException("Item doesn't exist")
        this.items = this.items.filter(({ name }) => item.name !== name)
        this.apply(new ItemRemovedEvent(this.id, item))
    }

}