// config/passport.js

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config(); // Load env variables

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID, // Use env vars
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
        };

        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log("User already exists:", user.displayName);
            return done(null, user);
          }

          user = await User.create(newUser);
          console.log("New user created:", user.displayName);
          return done(null, user);
        } catch (err) {
          console.error("Error during authentication:", err);
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => done(null, user))
      .catch((err) => done(err, null));
  });
};
