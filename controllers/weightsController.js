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

/**
 * Standard EMA formula used:
 * EMA = (Current Value × Alpha) + (Previous EMA × (1 - Alpha))
 *
 * 2 EMA values are calculated:
 * currentTrendWeight: weightEMA
 * dailyChangeTrend: dailyChangeEMA
 *
 * time-weighted formula: α_t = 1 - (1 - α)^t
 * time-weighted alphas provide resilience against irregular user weight logging.
 */

const calculateWeightProjection = (weightData, daysToProject = 30) => {
  const BASE_ALPHA_WEIGHT = 0.1; // Base alpha for daily measurements
  const WEEKS_FOR_TREND = 2; // Look-back period for alpha trend
  const BASE_ALPHA_TREND = 2 / (WEEKS_FOR_TREND * 7 + 1); // Base alpha for trend where α = 2 / (N + 1), with N being days.

  // Sort data by date
  const sortedData = [...weightData].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  let weightEMA = sortedData[0].weight;
  let previousWeightEMA = weightEMA;
  let dailyChangeEMA = 0;
  let lastDate = new Date(sortedData[0].createdAt);

  sortedData.forEach((entry, index) => {
    if (index === 0) return;

    const currentDate = new Date(entry.createdAt);
    const daysSinceLastWeighIn =
      (currentDate - lastDate) / (1000 * 60 * 60 * 24);

    // Adjust alpha based on time elapsed
    // Use time-weighted formula: α_t = 1 - (1 - α)^t
    const timeAdjustedAlpha =
      1 - Math.pow(1 - BASE_ALPHA_WEIGHT, daysSinceLastWeighIn);
    const timeAdjustedAlphaTrend =
      1 - Math.pow(1 - BASE_ALPHA_TREND, daysSinceLastWeighIn);

    // Update weight EMA with time-adjusted alpha
    weightEMA =
      entry.weight * timeAdjustedAlpha + weightEMA * (1 - timeAdjustedAlpha);

    // Calculate daily rate of change
    const weightChange = weightEMA - previousWeightEMA;
    const dailyChange = weightChange / daysSinceLastWeighIn; // Normalise to daily rate

    // Update trend EMA
    dailyChangeEMA =
      dailyChange * timeAdjustedAlphaTrend +
      dailyChangeEMA * (1 - timeAdjustedAlphaTrend);

    previousWeightEMA = weightEMA;
    lastDate = currentDate;
  });

  // Project future weight
  const projectedWeight = weightEMA + dailyChangeEMA * daysToProject;

  return {
    currentTrendWeight: weightEMA,
    dailyChangeTrend: dailyChangeEMA,
    projectedWeight,
  };
};

export {
  deleteScaleWeightEntry,
  retrieveWeightData,
  verifyExistingScaleWeight,
  calculateWeightProjection,
};
