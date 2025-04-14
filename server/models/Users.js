// Import necessary modules
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/User"); // Import the User model

// Export a function to configure Passport with Google strategy
module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: "YOUR_GOOGLE_CLIENT_ID",         // Replace with your actual client ID
        clientSecret: "YOUR_GOOGLE_CLIENT_SECRET", // Replace with your actual client secret
        callbackURL: "/auth/google/callback",      // Route to redirect after successful login
      },
      async (accessToken, refreshToken, profile, done) => {
        // Extract profile data and check if user exists
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
        };

        try {
          // Find user by Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user); // If user exists, return it
          }

          // If not, create a new user
          user = await User.create(newUser);
          done(null, user);
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  // Serialize user to save to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user to retrieve full user data
  passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => done(null, user));
  });
};
