import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { db } from "../dbConnection.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { z } from "zod";
import { AppError } from "../Types/errorTypes.js";

const baseGoalSchema = z.object({
  goalType: z.enum(["loss", "gain", "maintain"]),
  goalWeight: z
    .number()
    .positive("Goal weight must be a positive number")
    .max(1200, "Goal weight cannot exceed 1200kg"),
});

const goalWithIdSchema = baseGoalSchema.extend({
  goalId: z
    .number("goalId must be a number")
    .positive("goalId must be positive"),
});

const router = express.Router();

router.post(
  "/api/goal",
  isAuthenticated,
  asyncHandler(async (req, res, next) => {
    const validatedData = await baseGoalSchema
      .parseAsync(req.body)
      .catch((err) => {
        throw new AppError(err.errors[0].message, 400);
      });

    // devNote: need to confirm string formatting. Create test to see if this works
    // e.g. suffix "*.930Z" likely cut off when serialised in db.
    const todayISOString = new Date().toISOString();

    const existingGoal = await db("goal")
      .where({
        userId: req.user.id,
        startDate: todayISOString,
      })
      .first();

    if (existingGoal) {
      throw new AppError("Goal already exists for this date", 409);
    }

    const [goal] = await db.transaction((trx) =>
      trx("goal")
        .insert({
          userId: req.user.id,
          startDate: todayISOString,
          goalType: validatedData.goalType,
          goalWeight: validatedData.goalWeight,
        })
        .returning("*")
    );

    res.status(201).json({
      status: "success",
      message: "Goal successfully created.",
      data: { goal },
    });
  })
);

router.get(
  "/api/goal",
  isAuthenticated,
  asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const goalEntries = await db.select().from("goal").where({ userId });

    res.status(200).json({
      status: "success",
      message: "Goal entries retrieved.",
      data: { goalEntries },
    });
  })
);

router.put(
  "/api/goal",
  isAuthenticated,
  asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const validatedData = await goalWithIdSchema
      .parseAsync(req.body)
      .catch((err) => {
        throw new AppError(err.errors[0].message, 400);
      });

    const requestedGoal = await db
      .select()
      .from("goal")
      .where({ userId, id: validatedData.goalId })
      .first();

    if (!requestedGoal) {
      throw new AppError(
        "Specified goal could not be found. Goal update was not attempted.",
        404
      );
    }

    const [updatedGoal] = await db.transaction((trx) =>
      trx("goal")
        .where({ userId, id: validatedData.goalId })
        .update({
          goalType: validatedData.goalType || requestedGoal.goalType,
          goalWeight: validatedData.goalWeight || requestedGoal.goalWeight,
        })
        .returning("*")
    );

    res.status(200).json({
      status: "success",
      message: "Goal updated successfully.",
      data: { updatedGoal },
    });
  })
);

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
