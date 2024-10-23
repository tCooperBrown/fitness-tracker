import express from "express";
import { router as authRouter } from "./routes/auth.js";
import { router as scaleWeightRouter } from "./routes/scaleWeight.js";
import { router as goalRouter } from "./routes/goal.js";
import { passport } from "./middleware/authMiddleware.js";
import { ConnectSessionKnexStore } from "connect-session-knex";
import session from "express-session";
import { db } from "./dbConnection.js";
import { errorHandler, errorLogger } from "./middleware/errorMiddleware.js";

const app = express();

app.use(express.json());

const store = new ConnectSessionKnexStore({
  knex: db,
  tableName: "sessions",
});

app.use(
  session({
    secret: "very-secret-key-replace-later",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(authRouter);
app.use(scaleWeightRouter);
app.use(goalRouter);

// Error logging and handling
app.use(errorLogger);
app.use(errorHandler);

export { app };
