import knex from "knex";
import knexfile from "./knexfile.js";

const environmentName = process.env.NODE_ENV || "test";
const environmentConfig = knexfile[environmentName];
const db = knex(environmentConfig);

export default async () => {
  try {
    // Migrate the database to the latest state
    await db.migrate.latest();
  } finally {
    // Close the connection to the database so that tests won't hang
    await db.destroy();
  }
};
