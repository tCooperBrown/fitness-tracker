import passport from "passport";
import LocalStrategy from "passport-local";
import { db } from "../dbConnection.js";
import crypto from "crypto";
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      const user = await db("users").select().first().where({ email });

      if (!user) {
        return done(null, false, { message: "Incorrect email or password." });
      }

      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        (err, passwordHash) => {
          if (err) {
            console.error(err);
            return done(err);
          }
          if (!crypto.timingSafeEqual(user.passwordHash, passwordHash)) {
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }
          return done(null, user);
        }
      );
    }
  )
);

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, user);
  });
});

passport.deserializeUser((user, done) => {
  process.nextTick(() => {
    return done(null, user);
  });
});

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};

export { passport, isAuthenticated };
