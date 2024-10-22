import { db } from "../../dbConnection.js";
import { user } from "../../userTestUtils.js";
import { logIn } from "../../utils/authUtils.js";
import {
  clearScaleEntries,
  insertScaleEntry,
} from "../../utils/weightsUtils.js";
import { testClient } from "../setup/setup.js";

beforeEach(async () => {
  await clearScaleEntries(user.id);
  await logIn({ email: user.email, password: user.password });
});

describe("retrieving a user's scale weight entries", () => {
  test("requesting entries when previous entries exist", async () => {
    const userId = user.id;

    Promise.all([
      insertScaleEntry({ userId, weight: 60 }),
      insertScaleEntry({ userId, weight: 70 }),
      insertScaleEntry({ userId, weight: 80 }),
    ]);

    await testClient
      .get("/api/weights")
      .redirects(1)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ userId, weight: 60 }),
            expect.objectContaining({ userId, weight: 70 }),
            expect.objectContaining({ userId, weight: 80 }),
          ])
        );
      });
  });

  test("requesting entries when no previous entries exist", async () => {
    await testClient
      .get("/api/weights")
      .redirects(1)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toEqual([]);
      });
  });
});

describe("updating user scale weight entries", () => {
  test("adding a scale weight entry", async () => {
    const scaleWeightInput = {
      userId: user.id,
      weight: 80.1,
    };

    await db("scale_weight").insert(scaleWeightInput);
    const latestScaleWeight = await db
      .select()
      .from("scale_weight")
      .where({ userId: user.id })
      .orderBy("createdAt", "desc")
      .first();

    expect(latestScaleWeight).toMatchObject(scaleWeightInput);

    const scaleWeightEntries = await db
      .select("*")
      .from("scale_weight")
      .where({ userId: user.id });

    expect(scaleWeightEntries).toHaveLength(1);
  });

  test("removing a scale weight entry", async () => {
    const dateToDelete = new Date().toISOString();

    Promise.all([
      db("scale_weight").insert({ userId: user.id, weight: 80.1 }),
      db("scale_weight").insert({
        userId: user.id,
        weight: 79.7,
        createdAt: dateToDelete,
      }),
      db("scale_weight").insert({ userId: user.id, weight: 79.6 }),
    ]);

    const response = await testClient.delete(`/api/weights/${dateToDelete}`);

    expect(response.body).toMatchObject({
      message: `Successfully deleted scale weight entry for date: ${dateToDelete}`,
    });

    const scaleWeightEntries = await db
      .select("*")
      .from("scale_weight")
      .where({ userId: user.id });

    expect(scaleWeightEntries).toHaveLength(2);

    expect(scaleWeightEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: user.id, weight: 79.6 }),
        expect.objectContaining({ userId: user.id, weight: 80.1 }),
      ])
    );
  });
});
