import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer | null = null;

export async function setupTestDB() {
  if (mongo) return;

  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URL_TEST = mongo.getUri();
  process.env.TOKEN_SECRET = process.env.TOKEN_SECRET || "test-secret";
}

export async function clearDatabase() {
  const connection = mongoose.connection;
  if (connection.readyState !== 1) return;

  const collections = await connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export async function teardownTestDB() {
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
    mongo = null;
  }
}
