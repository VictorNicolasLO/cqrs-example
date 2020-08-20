
export interface IItem {
    name: string
}

export interface ICar {
    id: string
    ownerId: string
    items: IItem[]
}