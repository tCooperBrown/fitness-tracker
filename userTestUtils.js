import { db } from "./dbConnection";
import crypto from "crypto";
import { testClient } from "./__tests__/setup/setup.js";

const salt = crypto.randomBytes(16);
const password = "a_password";
const passwordHash = crypto.pbkdf2Sync(password, salt, 310000, 32, "sha256");
const email = "genesis@email.com";
const firstName = "Theo";
const lastName = "Cooper-Brown";
const height = 180;
const gender = "male";
const dateOfBirth = "1998-10-17T11:17:17.235Z";

const user = {
  password,
  passwordHash,
  email,
  firstName,
  lastName,
  height,
  gender,
  dateOfBirth,
  salt,
};

const createUser = async () => {
  const userDetails = {
    passwordHash,
    email,
    firstName,
    lastName,
    height,
    gender,
    dateOfBirth,
    salt,
  };
  await db("users").insert(userDetails);
  const { id } = await db.select().from("users").where({ email }).first();

  user.id = id;
};

const createUserViaAPI = (credentials) => {
  const { email, password, firstName, lastName, height, gender, dateOfBirth } =
    credentials;

  return testClient.post(`/api/signup`).send({
    password,
    firstName,
    lastName,
    height,
    gender,
    dateOfBirth,
    salt,
    email,
  });
};

export { user, createUser, createUserViaAPI };
