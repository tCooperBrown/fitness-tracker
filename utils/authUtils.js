import { testClient } from "../__tests__/setup/setup.js";

export const logIn = (credentials) => {
  return testClient.post("/api/login/password").send(credentials);
};

export const logOut = () => {
  return testClient.post("/logout");
};
