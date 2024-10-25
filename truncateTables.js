import { db } from "./dbConnection";

beforeEach(async () => {
  const expectedTables = ["users", "scale_weight", "goal", "sessions"];
  const hasSessionsTable = await db.schema.hasTable("sessions");
  const tablesToTruncate = hasSessionsTable
    ? expectedTables
    : expectedTables.filter((table) => table !== "sessions");

  await Promise.all(tablesToTruncate.map((t) => db(t).truncate()));
});
