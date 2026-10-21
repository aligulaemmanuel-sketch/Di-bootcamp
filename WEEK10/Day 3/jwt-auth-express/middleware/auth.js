const jwt = require('jsonwebtoken')
const { ACCESS_COOKIE, verifyAccessToken } = require('../utils/tokens')
const userStore = require('../store/userStore')

/** The token comes from the httpOnly cookie, or from "Authorization: Bearer <token>" for API clients. */
function extractToken(req) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) return header.slice(7)
  return (req.cookies && req.cookies[ACCESS_COOKIE]) || null
}

/**
 * Protects a route. On success it sets req.user = { id, username }.
 * On failure it responds with 401 and a machine-readable `code`, so a client can
 * tell "expired, call /auth/refresh" apart from "invalid, log in again".
 */
function authenticate(req, res, next) {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Authentication required', code: 'TOKEN_MISSING' })
  }

  try {
    const payload = verifyAccessToken(token)

    // Reject tokens for accounts that no longer exist.
    if (!userStore.findById(payload.sub)) {
      return res.status(401).json({ error: 'Account not found', code: 'TOKEN_INVALID' })
    }

    req.user = { id: payload.sub, username: payload.username }
    return next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Access token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'Invalid access token', code: 'TOKEN_INVALID' })
  }
}

module.exports = { authenticate }
