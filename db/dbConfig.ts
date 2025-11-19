import mongoose from "mongoose";

let isConnected = false;
let listenersBound = false;

const DEFAULT_DB_NAME = "comiccrate";
const DEFAULT_TEST_DB_NAME = "comiccrate_test";

function resolveDbConfig() {
  const isTestEnv =
    process.env.NODE_ENV === "test" || Boolean(process.env.JEST_WORKER_ID);

  const mongoUrl = isTestEnv
    ? process.env.MONGO_URL_TEST
    : process.env.MONGO_URL;

  if (!mongoUrl) {
    const key = isTestEnv ? "MONGO_URL_TEST" : "MONGO_URL";
    throw new Error(`${key} is not defined`);
  }

  const dbName =
    (isTestEnv
      ? process.env.MONGO_DB_NAME_TEST
      : process.env.MONGO_DB_NAME) ??
    (isTestEnv ? DEFAULT_TEST_DB_NAME : DEFAULT_DB_NAME);

  return { mongoUrl, dbName, isTestEnv };
}

export async function connectToDB() {
  try {
    if (isConnected) return;

    const { mongoUrl, dbName, isTestEnv } = resolveDbConfig();

    if (!listenersBound) {
      const connection = mongoose.connection;
      connection.on("connected", () => {
        console.log(
          `Connected to database✅ (${dbName}${isTestEnv ? " - test" : ""})`
        );
      });

      connection.on("error", (err) => {
        console.log(
          "MongoDB connection error. Please make sure MongoDB is running." + err
        );
      });

      listenersBound = true;
    }

    await mongoose.connect(mongoUrl, { dbName });
    isConnected = true;
  } catch (error) {
    console.log("Error connecting to database❌:", error);
    throw error;
  }
}
