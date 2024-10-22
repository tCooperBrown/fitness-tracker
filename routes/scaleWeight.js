import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  deleteScaleWeightEntry,
  retrieveWeightData,
  verifyExistingScaleWeight,
} from "../controllers/weightsController.js";

const router = express.Router();

router.get("/api/weights", isAuthenticated, async (req, res) => {
  const userId = req.user.id;

  try {
    const existingScaleWeightEntries = verifyExistingScaleWeight(userId);

    if (existingScaleWeightEntries) {
      const userWeights = await retrieveWeightData(userId);
      res.json({ message: userWeights });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Error retrieving scale weight data for userId: ${userId}`,
    });
  }
});

router.delete("/api/weights/:date", isAuthenticated, async (req, res) => {
  const { date } = req.params;
  const userId = req.user.id;

  try {
    await deleteScaleWeightEntry(userId, date);
    res.json({
      message: `Successfully deleted scale weight entry for date: ${date}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Error deleting scale weight entry from date: ${date}`,
    });
  }
});

export { router };
