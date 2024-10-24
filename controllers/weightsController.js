import { db } from "../dbConnection.js";

const deleteScaleWeightEntry = async (userId, date) => {
  const scaleWeightEntry = await db
    .select()
    .from("scale_weight")
    .where({ userId, createdAt: date })
    .first();

  if (!scaleWeightEntry) {
    const err = new Error(
      `No scale weight entry exists for this date: ${date}`
    );
    err.code = 400;
    throw err;
  }

  await db("scale_weight").delete().where({ userId, createdAt: date });
};

const retrieveWeightData = async (userId) => {
  return db.select().from("scale_weight").where({ userId });
};

const verifyExistingScaleWeight = async (userId) => {
  const result = await db("scale_weight").where({ userId }).first();

  return result !== undefined;
};

export {
  deleteScaleWeightEntry,
  retrieveWeightData,
  verifyExistingScaleWeight,
};
