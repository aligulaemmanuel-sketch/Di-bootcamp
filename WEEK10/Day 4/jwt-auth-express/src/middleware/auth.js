/**
 * Step 6: JWT authentication middleware.
 *
 * Reads the token from:
 *   1. the httpOnly cookie (browser clients), or
 *   2. the Authorization: Bearer <token> header (API/mobile clients)
 */
const { verifyAccessToken } = require("../utils/tokens");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
  const token = req.cookies.access_token || bearer;

  if (!token) {
    return res.status(401).json({ error: "Authentication required. No token provided." });
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== "access") {
      return res.status(401).json({ error: "Wrong token type. Use an access token." });
    }
    req.user = payload; // { sub, username, type, iat, exp }
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError" ? "Access token expired. Use /api/auth/refresh." : "Invalid access token.";
    return res.status(401).json({ error: message });
  }
}

module.exports = { authenticate };
