// server/routes/auth.js

const express = require("express");
const passport = require("passport");

const router = express.Router();

// Route to initiate Google login
// Visiting this route redirects user to Google OAuth consent screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback URL - this is where Google sends the user after login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login", // Redirect on failure
    session: true,             // Keep user logged in via session
  }),
  (req, res) => {
    // Redirect to frontend after successful login
    res.redirect("http://localhost:5173/editor");
  }
);

// Route to get current logged-in user info
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user); // Return user info if logged in
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Route to logout
router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.redirect("http://localhost:5173");
  });
});

module.exports = router;
