
export interface IItem {
    name: string
}

export interface ICarView {
    id: string
    ownerId: string
    items: IItem[]
}