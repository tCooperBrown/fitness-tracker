import { db } from "./dbConnection";
const tablesToTruncate = ["users", "scale_weight", "goal", "sessions"];

beforeEach(() => {
  return Promise.all(tablesToTruncate.map((t) => db(t).truncate()));
});
