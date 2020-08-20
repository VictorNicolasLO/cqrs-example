export abstract class DbDriver<T> {
  abstract async findOne(filter: Partial<T>): Promise<T | null>;
  abstract async findById(id: string): Promise<T | null>;
  abstract async find(filter: Partial<T>): Promise<T[]>;
  abstract async insert(data: T): Promise<T>;
  abstract async update(filter: Partial<T>, data: T): Promise<T>;
  abstract async delete(filter: Partial<T>): Promise<T>;
}
