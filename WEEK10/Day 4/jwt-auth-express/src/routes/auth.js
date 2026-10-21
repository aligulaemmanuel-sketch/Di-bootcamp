/**
 * Step 4 + 5 + 8 + 9: registration, login, refresh, logout.
 *
 * Token strategy:
 *  - access token  (short-lived, 15m)  -> httpOnly cookie + JSON body
 *  - refresh token (long-lived, 7d)    -> httpOnly cookie only
 *
 * httpOnly cookies are not readable from JavaScript, which defeats XSS token
 * theft. The refresh token never leaves as JSON, so only the short-lived
 * access token is exposed to client-side code at all.
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const config = require("../config");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokens");
const { validateRegistration } = require("../utils/validate");
const { rateLimit } = require("../middleware/rateLimit");

const router = express.Router();

const REFRESH_COOKIE = "refresh_token";
const ACCESS_COOKIE = "access_token";

function setAuthCookies(res, accessToken, refreshToken) {
  const base = { httpOnly: true, sameSite: "lax", secure: config.isProd };
  res.cookie(ACCESS_COOKIE, accessToken, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function publicUser(user) {
  return { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt };
}

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body || {};
    const errors = validateRegistration({ username, email, password });
    if (errors.length) return res.status(400).json({ errors });

    if (await db.findUserByUsername(username)) {
      return res.status(409).json({ error: "Username is already taken." });
    }
    if (await db.findUserByEmail(email)) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.createUser({ username, email, passwordHash });

    const accessToken = signAccessToken(user);
    const { token: refreshToken } = signRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({ user: publicUser(user), accessToken });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login — rate limited; only failed attempts count
router.post(
  "/login",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, skipSuccessful: true }),
  async (req, res, next) => {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }

      const user = await db.findUserByUsername(username);
      // Always run a compare so response time doesn't reveal valid usernames
      const hash = user ? user.passwordHash : "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinv";
      const ok = await bcrypt.compare(password, hash);
      if (!user || !ok) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const accessToken = signAccessToken(user);
      const { token: refreshToken } = signRefreshToken(user);
      setAuthCookies(res, accessToken, refreshToken);

      return res.json({ user: publicUser(user), accessToken });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/refresh — Step 9: token refresh with rotation + revocation check
router.post(
  "/refresh",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }),
  async (req, res, next) => {
    try {
      const token = req.cookies[REFRESH_COOKIE];
      if (!token) return res.status(401).json({ error: "No refresh token." });

      let payload;
      try {
        payload = verifyRefreshToken(token);
      } catch {
        return res.status(401).json({ error: "Refresh token is invalid or expired. Log in again." });
      }
      if (payload.type !== "refresh") {
        return res.status(401).json({ error: "Wrong token type." });
      }
      if (db.isRefreshTokenRevoked(payload.jti)) {
        return res.status(401).json({ error: "Refresh token was revoked. Log in again." });
      }

      const user = await db.findUserById(payload.sub);
      if (!user) return res.status(401).json({ error: "User no longer exists." });

      // Rotation: revoke the used refresh token, issue a fresh pair
      db.revokeRefreshToken(payload.jti);
      const accessToken = signAccessToken(user);
      const { token: newRefreshToken } = signRefreshToken(user);
      setAuthCookies(res, accessToken, newRefreshToken);

      return res.json({ accessToken });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/logout — Step 8 + exercise #3/#4: invalidate refresh token, clear cookies
router.post("/logout", (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      db.revokeRefreshToken(payload.jti); // exercise #4: server-side revocation list
    } catch {
      /* already invalid — nothing to revoke */
    }
  }
  res.clearCookie(ACCESS_COOKIE, { httpOnly: true, sameSite: "lax" });
  res.clearCookie(REFRESH_COOKIE, { httpOnly: true, sameSite: "lax" });
  return res.status(204).send();
});

module.exports = router;
