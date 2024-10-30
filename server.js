import express from "express";
import { router as authRouter } from "./routes/auth.js";
import { router as scaleWeightRouter } from "./routes/scaleWeight.js";
import { router as goalRouter } from "./routes/goal.js";
import { passport } from "./middleware/authMiddleware.js";
import { ConnectSessionKnexStore } from "connect-session-knex";
import session from "express-session";
import { db } from "./dbConnection.js";
import { errorHandler, errorLogger } from "./middleware/errorMiddleware.js";
import cors from "cors";

const store = new ConnectSessionKnexStore({
  knex: db,
  tableName: "sessions",
  createTable: true,
});

const app = express();

app.use(
  session({
    secret: "very-secret-key-replace-later",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Routes
app.use(authRouter);
app.use(scaleWeightRouter);
app.use(goalRouter);

// Error logging and handling
app.use(errorLogger);
app.use(errorHandler);

export { app };
