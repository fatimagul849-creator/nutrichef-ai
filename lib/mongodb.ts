import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB ?? "nutrichef";

let clientPromise: Promise<MongoClient> | undefined;

export async function getDatabase(): Promise<Db> {
  if (!uri) {
    throw new Error("MongoDB has not been configured.");
  }

  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  return (await clientPromise).db(databaseName);
}
