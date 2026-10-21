/**
 * Step 5: generating and verifying JWTs.
 *
 * Two token types, two secrets — if a refresh token leaks, access tokens
 * stay safe, and vice versa.
 */
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config");

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, type: "access" },
    config.accessSecret,
    { expiresIn: config.accessTokenTtl }
  );
}

function signRefreshToken(user) {
  const jti = crypto.randomUUID(); // unique token id — lets us revoke individual tokens
  const token = jwt.sign(
    { sub: user.id, type: "refresh", jti },
    config.refreshSecret,
    { expiresIn: config.refreshTokenTtl }
  );
  return { token, jti };
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.accessSecret); // throws on invalid/expired
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.refreshSecret); // throws on invalid/expired
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
