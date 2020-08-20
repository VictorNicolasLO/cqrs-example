import { MongoClient, Db } from 'mongodb';
// Connection URL
const url =
  'mongodb+srv://victornicolaslo:test@miinversion-tml3t.mongodb.net?retryWrites=true&w=majority';
const client = new MongoClient(url);
// Database Name

const dbName = 'snapshots';
export const db: Promise<Db> = new Promise(async resolve => {
  await client.connect();
  resolve(client.db(dbName));
});
