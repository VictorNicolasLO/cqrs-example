import mongoose, { Schema, Model, Document } from 'mongoose';
import { DbDriver } from './db-driver';

export class MongoDriver<T> extends DbDriver<T> {
  collection: Model<Document>;
  constructor(collection: string) {
    super();
    const customSchema = new Schema(
      {
        id: String,
      },
      {
        strict: false,
        id: false,
      },
    );
    this.collection = mongoose.model(collection, customSchema);
  }

  static init(url: string) {
    mongoose.connect(url, err => {
      if (!err) {
        console.log('MONGO RUNNING');
      } else {
        console.log(err);
      }
    });
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    const result = await this.collection.findOne(filter);
    return result && result.toObject();
  }
  async find(filter: Partial<T>): Promise<T[]> {
    return (await this.collection.find(filter)).map(item => item.toObject());
  }
  async findById(id: string): Promise<T | null> {
    const result = await this.collection.findOne({ id });
    return result && result.toObject();
  }
  async insert(data: T): Promise<T> {
    return (await this.collection.create(data)) as any;
  }
  async update(filter: Partial<T>, data: Partial<T>): Promise<T> {
    return await this.collection.update(filter, data);
  }
  async delete(data: Partial<T>): Promise<any> {
    return await this.collection.deleteOne((data as any).id);
  }
}
