import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'gestor_llamados';

let client;
let connectionPromise;

export function hasMongoConfig() {
  return Boolean(uri);
}

export async function getMongoClient() {
  if (!uri) {
    throw new Error('Falta configurar MONGODB_URI.');
  }

  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });
  }

  connectionPromise ||= client.connect();
  return connectionPromise;
}

export async function getMongoDb() {
  const connectedClient = await getMongoClient();
  return connectedClient.db(dbName);
}

export async function checkMongoConnection() {
  const db = await getMongoDb();
  await db.command({ ping: 1 });
  return { ok: true, database: db.databaseName };
}
