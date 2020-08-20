import { DbDriver } from '../db-drivers/db-driver';
import uuid from 'uuid/v4';

export class GenericReadRepository<T> {
  find: (filter: Partial<T>) => Promise<T[] | []>;
  findById: (id: string) => Promise<T | null>;
  findOne: (filter: Partial<T>) => Promise<T | null>;
  create: (dto: T) => Promise<T>;
  update: (filter: Partial<T>, dto: Partial<T>) => Promise<T>;
  delete: (filter: Partial<T>) => Promise<any>;

  constructor(public driver: DbDriver<T>) {
    this.find = async filter => await driver.find(filter as any);

    this.findOne = async filter => await driver.findOne(filter as any);

    this.findById = async id => await driver.findById(id);

    this.create = async dto => {
      if (!(dto as any).id) (dto as any).id = uuid();
      return await driver.insert(dto);
    };

    this.update = async (filter, dto) =>
      await driver.update(filter, dto as any);

    this.delete = async filter => await driver.delete(filter);
  }
}
