import express from "express";
import { passport } from "../middleware/authMiddleware.js";
import crypto from "crypto";
import { db } from "../dbConnection.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  // Return once ready for frontend implementation.
  if (req.isAuthenticated()) {
    const { email } = req.user;
    res.json({ message: `Currently serving user with email: ${email}` });
    return;
  }

  res.json({ message: "Session not currently authenticated." });
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    res.redirect("/");
  });
});

router.post(
  "/api/login/password",
  passport.authenticate("local", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/",
    failureMessage: true,
  })
);

router.post("/api/signup", async (req, res, next) => {
  try {
    const salt = crypto.randomBytes(16);
    const { email, firstName, lastName, height, gender, dateOfBirth } =
      req.body;

    const passwordHash = await new Promise((resolve, reject) => {
      crypto.pbkdf2(
        req.body.password,
        salt,
        310000,
        32,
        "sha256",
        (err, derivedKey) => {
          if (err) reject(err);
          else resolve(derivedKey);
        }
      );
    });

    const [userId] = await db("users")
      .insert({
        email,
        passwordHash,
        firstName,
        lastName,
        height,
        gender,
        dateOfBirth,
        salt,
      })
      .returning("id");

    const user = { id: userId.id, email };
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      res.status(201).json({ message: `User created with email: ${email}` });
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "An error occurred during signup" });
  }
});

export { router };
