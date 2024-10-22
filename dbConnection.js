const environmentName = process.env.NODE_ENV || "test";
import knex from "knex";
import knexfile from "./knexfile.js";
const knexConfig = knexfile[environmentName];

const db = knex(knexConfig);

export { db };
