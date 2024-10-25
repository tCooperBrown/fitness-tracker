import { testClient } from "../../__tests__/setup/setup.js";

const createGoalViaAPI = ({ goalType, goalWeight }) => {
  return testClient.post("/api/goal").send({ goalType, goalWeight });
};

export { createGoalViaAPI };
