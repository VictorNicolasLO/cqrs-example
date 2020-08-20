import { DbDriver } from './db-driver';

export class MysqlDriver<T> extends DbDriver<T> {
  findOne(filter: Partial<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<T> {
    throw new Error('Method not implemented.');
  }
  find(filter: Partial<T>): Promise<T[]> {
    throw new Error('Method not implemented.');
  }
  insert(data: T): Promise<T> {
    throw new Error('Method not implemented.');
  }
  update(filter: any, data: T): Promise<T> {
    throw new Error('Method not implemented.');
  }
  delete(filter: any): Promise<T> {
    throw new Error('Method not implemented.');
  }
}
