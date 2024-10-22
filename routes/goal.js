import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { db } from "../dbConnection.js";
const router = express.Router();

router.post("/api/goal", isAuthenticated, async (req, res, next) => {
  try {
    const { goalType, startDate, goalWeight, userId } = req.body;

    const goal = await db("goal")
      .insert({ goalType, startDate, goalWeight, userId })
      .returning("*");

    res.status(201).json({
      message: `Goal successfully created for userId: ${req.user.id}`,
      goal,
    });
  } catch (error) {
    // Implement error logging middleware later.
    error.code = 500;
    console.error(error);
    res.status(error.code).json({ message: "Error creating new goal." });
  }
});

router.get("/api/goal", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const goalEntries = await db.select().from("goal").where({ userId });

    res.status(200).json({ goalEntries });
  } catch (error) {
    // Implement error logging middleware later.
    error.code = 500;
    console.error(error);
    res.status(error.code).json({ message: "Error retrieving goal entries." });
  }
});

router.put("/api/goal", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { goalId, goalType, goalWeight } = req.body;

    const requestedGoal = await db
      .select()
      .from("goal")
      .where({ userId, id: goalId })
      .first();

    if (!requestedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const updatedGoal = await db("goal")
      .where({ userId, id: goalId })
      .update({
        goalType: goalType || requestedGoal.goalType,
        goalWeight: goalWeight || requestedGoal.goalWeight,
      })
      .returning("*");

    res.status(201).json({
      message: "Goal updated successfully",
      goal: updatedGoal[0],
    });
  } catch (error) {
    error.code = 500;
    console.error(error);
    res.status(error.code).json({ message: "Error retrieving goal entries." });
  }
});

router.delete("/api/goal/:goalId", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    const requestedGoal = await db("goal")
      .where({ userId, id: goalId })
      .first();

    if (!requestedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    await db("goal").where({ userId, id: goalId }).delete();

    res.status(200).json({ message: "Goal successfully deleted" });
  } catch (error) {
    error.code = 500;
    console.error(error);
    res.status(error.code).json({ message: "Error retrieving goal entries." });
  }
});

export { router };
