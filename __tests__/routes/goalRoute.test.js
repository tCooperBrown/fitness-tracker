import { user } from "../../userTestUtils.js";
import { logIn } from "../../utils/authUtils.js";
import { testClient } from "../setup/setup.js";

// JIRA - KAN-4 - implement testUtil for goal creation
//  Jest wiping entries between tests
beforeEach(async () => {
  await logIn({ email: user.email, password: user.password });
});

describe("Modifying a user's active goal", () => {
  test("creating a new goal", async () => {
    const goalType = "loss";
    const startDate = new Date();
    const goalWeight = 62;

    await testClient
      .post("/api/goal")
      .send({ goalType, startDate, goalWeight, userId: user.id })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe(
          `Goal successfully created for userId: ${user.id}`
        );
      });
  });
});

describe("interacting with a user's existing goals", () => {
  const goalType = "loss";
  const startDate = new Date().toISOString();
  const goalWeight = 62;
  let goalId;
  beforeEach(async () => {
    await testClient
      .post("/api/goal")
      .send({ goalType, startDate, goalWeight, userId: user.id })
      .then((res) => {
        goalId = res.body.goal[0].id;
      });
  });

  test("retrieving a user's goals", async () => {
    await testClient
      .get(`/api/goal`)
      .expect(200)
      .expect((res) => {
        expect(res.body.goalEntries[0]).toMatchObject({
          goalType,
          goalWeight,
          startDate,
          userId: user.id,
          id: goalId,
        });
      });
  });

  test("updating an existing goal", async () => {
    await testClient
      .put("/api/goal")
      .send({ goalId, goalType, goalWeight })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe("Goal updated successfully");
        expect(res.body.goal).toMatchObject({
          goalType,
          goalWeight,
          startDate,
          userId: user.id,
          id: goalId,
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
