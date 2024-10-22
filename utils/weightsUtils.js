import { db } from "../dbConnection.js";

const clearScaleEntries = async (userId) => {
  const scaleWeightEntry = await db
    .select()
    .from("scale_weight")
    .where({ userId })
    .first();

  if (!scaleWeightEntry) {
    return;
  }

  await db("scale_weight").delete().where({ userId });
};

const insertScaleEntry = async ({ userId, weight }) => {
  await db("scale_weight").insert({ userId, weight });
};

export { clearScaleEntries, insertScaleEntry };
