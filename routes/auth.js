import express from "express";
import { passport } from "../middleware/authMiddleware.js";
import crypto from "crypto";
import { db } from "../dbConnection.js";
import { AppError } from "../Types/errorTypes.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { z } from "zod";
const router = express.Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  height: z.number().positive().max(300),
  gender: z.enum(["male", "female"]),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    return age >= 18 && age <= 120;
  }, "Age must be between 18 and 120 years"),
});

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

// dev notes 2024-10-24
// does rejecting the err in in the pbkdf2 promise go through the expected error normalisation path.
router.post(
  "/api/signup",
  asyncHandler(async (req, res, next) => {
    const validatedData = await signupSchema
      .parseAsync(req.body)
      .catch((err) => {
        throw new AppError(err.errors[0].message, 400);
      });

    const existingUser = await db("users")
      .where({ email: validatedData.email })
      .first();

    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    const salt = crypto.randomBytes(16);

    const passwordHash = await new Promise((resolve, reject) => {
      crypto.pbkdf2(
        req.body.password,
        salt,
        310000,
        32,
        "sha256",
        (err, derivedKey) => {
          if (err) reject(new AppError("Password processing failed", 500));
          else resolve(derivedKey);
        }
      );
    });

    const [user] = await db.transaction((trx) =>
      trx("users")
        .insert({
          email: validatedData.email,
          passwordHash,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          height: validatedData.height,
          gender: validatedData.gender,
          dateOfBirth: validatedData.dateOfBirth,
          salt,
        })
        .returning(["id", "email"])
    );

    req.login({ id: user.id, email: user.email }, (err) => {
      if (err) {
        return next(new AppError("Login failed after signup", 500, false));
      }
      res.status(201).json({
        status: "success",
        message: "User created successfully",
        data: { email: user.email },
      });
    });
  })
);

export { router };
