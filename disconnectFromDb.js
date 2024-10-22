// const { db } = require("./dbConnection");
import { db } from "./dbConnection";

afterAll(() => db.destroy());
