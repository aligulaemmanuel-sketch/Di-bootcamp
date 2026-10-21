/**
 * Step 7: protected routes — only reachable with a valid access token.
 * Step 10 exercise #2: authenticated profile update.
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { authenticate } = require("../middleware/auth");
const { validateProfilePatch } = require("../utils/validate");

const router = express.Router();

// every route in this file requires authentication
router.use(authenticate);

// GET /api/users/me
router.get("/me", async (req, res, next) => {
  try {
    const user = await db.findUserById(req.user.sub);
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ id: user.id, username: user.username, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/me — update email and/or password
router.patch("/me", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const errors = validateProfilePatch({ email, password });
    if (errors.length) return res.status(400).json({ errors });

    const patch = {};
    if (email !== undefined) {
      const existing = await db.findUserByEmail(email);
      if (existing && existing.id !== req.user.sub) {
        return res.status(409).json({ error: "Email is already in use." });
      }
      patch.email = email;
    }
    if (password !== undefined) patch.passwordHash = await bcrypt.hash(password, 10);

    const user = await db.updateUser(req.user.sub, patch);
    res.json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
