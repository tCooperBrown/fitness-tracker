import { createUserViaAPI, user } from "../../userTestUtils.js";
import { logIn } from "../../utils/authUtils.js";

describe("creating a user", () => {
  test("creating a new user", async () => {
    return createUserViaAPI({
      email: "testEmail2@email.com",
      firstName: "John",
      lastName: "Smith",
      password: "password1234!",
      height: 185,
      gender: "male",
      dateOfBirth: new Date(),
    })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          message: "User created with email: testEmail2@email.com",
        });
      });
  });
});

describe("logging in to a user account", () => {
  test("logging into an existing account", async () => {
    const { email, password } = user;

    await logIn({ email, password })
      .redirects(1)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          message: `Currently serving user with email: ${email}`,
        });
      });
  });

  test("logging in with incorrect credentials", async () => {
    const { email } = user;

    await logIn({ email, password: "incorrectPass" })
      .redirects(1)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          message: "Session not currently authenticated.",
        });
      });
  });
});
