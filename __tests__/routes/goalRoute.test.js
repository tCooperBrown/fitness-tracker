import { user } from "../../userTestUtils.js";
import { logIn } from "../../utils/authUtils.js";
import { testClient } from "../setup/setup.js";

// JIRA - KAN-4 - implement testUtil for goal creation
//  Jest wiping entries between tests
beforeEach(async () => {
  await logIn({ email: user.email, password: user.password });
});

describe("Creating new goals", () => {
  test("creating a new goal given no goal exists on date of entry", async () => {
    const goalType = "loss";
    const goalWeight = 62;

    await testClient
      .post("/api/goal")
      .send({ goalType, goalWeight })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          status: "success",
          message: "Goal successfully created.",
          data: {
            goal: {
              endDate: null,
              goalType: "loss",
              goalWeight: 62,
              id: 1,
              optimisticETA: null,
              userId: 1,
            },
          },
        });
      });
  });
});

describe("interacting with a user's existing goals", () => {
  const goalType = "loss";
  const goalWeight = 62;
  let goalId;
  beforeEach(async () => {
    await testClient
      .post("/api/goal")
      .send({ goalType, goalWeight })
      .then((res) => {
        goalId = res.body.data.goal.id;
      });
  });

  test("retrieving a user's goals", async () => {
    await testClient
      .get("/api/goal")
      .expect(200)
      .expect((res) => {
        expect(res.body.data.goalEntries).toHaveLength(1);
        expect(res.body).toMatchObject({
          status: "success",
          message: "Goal entries retrieved.",
          data: {
            goalEntries: expect.arrayContaining([
              expect.objectContaining({
                goalType,
                goalWeight,
                id: goalId,
                userId: user.id,
              }),
            ]),
          },
        });
      });
  });

  test("updating an existing goal", async () => {
    await testClient
      .put("/api/goal")
      .send({ goalId, goalType: "gain", goalWeight: 84 })
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          status: "success",
          message: "Goal updated successfully.",
          data: {
            updatedGoal: expect.objectContaining({
              goalType: "gain",
              goalWeight: 84,
              id: goalId,
              startDate: expect.any(String),
              userId: user.id,
            }),
          },
        });
      });
  });

  test("deleting an existing goal", async () => {
    await testClient
      .delete(`/api/goal/${goalId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe("Goal successfully deleted");
      });
  });
});
