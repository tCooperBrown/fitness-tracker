import express from "express";
import { router as authRouter } from "./routes/auth.js";
import { router as scaleWeightRouter } from "./routes/scaleWeight.js";
import { passport } from "./middleware/authMiddleware.js";
import { ConnectSessionKnexStore } from "connect-session-knex";
import session from "express-session";
import { db } from "./dbConnection.js";

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
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(authRouter);
app.use(scaleWeightRouter);

export { app };
