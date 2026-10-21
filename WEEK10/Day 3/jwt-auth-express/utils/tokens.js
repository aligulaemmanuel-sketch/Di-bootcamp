const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const config = require('../config')
const tokenStore = require('../store/tokenStore')

const ALGORITHM = 'HS256'
const ACCESS_COOKIE = 'accessToken'
const REFRESH_COOKIE = 'refreshToken'

// ---------- Signing ----------

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, config.accessSecret, {
    algorithm: ALGORITHM,
    expiresIn: config.accessExpiresIn,
  })
}

/** Refresh tokens carry a unique id (jti) so each one can be tracked and revoked. */
function signRefreshToken(user) {
  const jti = crypto.randomUUID()
  const token = jwt.sign({ sub: user.id }, config.refreshSecret, {
    algorithm: ALGORITHM,
    expiresIn: config.refreshExpiresIn,
    jwtid: jti,
  })
  const { exp } = jwt.decode(token)
  return { token, jti, expiresAt: exp * 1000 }
}

function signEmailToken(user) {
  return jwt.sign({ sub: user.id, purpose: 'email-verify' }, config.emailSecret, {
    algorithm: ALGORITHM,
    expiresIn: '24h',
  })
}

// ---------- Verifying ----------
// Always pass `algorithms` so a token cannot choose its own (for example "none").

function verifyAccessToken(token) {
  return jwt.verify(token, config.accessSecret, { algorithms: [ALGORITHM] })
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.refreshSecret, { algorithms: [ALGORITHM] })
}

function verifyEmailToken(token) {
  const payload = jwt.verify(token, config.emailSecret, { algorithms: [ALGORITHM] })
  if (payload.purpose !== 'email-verify') throw new Error('Wrong token type')
  return payload
}

// ---------- Cookies ----------

function cookieOptions(path) {
  return {
    httpOnly: true, // not readable from JavaScript, which limits what XSS can steal
    secure: config.isProduction, // HTTPS only in production
    sameSite: 'strict', // not sent on cross-site requests
    path,
  }
}

/** Create a new access + refresh token pair for the user and set both cookies. */
function issueSession(res, user) {
  const accessToken = signAccessToken(user)
  const refresh = signRefreshToken(user)
  tokenStore.add(refresh.jti, user.id, refresh.expiresAt)

  const accessExpiresAt = jwt.decode(accessToken).exp * 1000

  res.cookie(ACCESS_COOKIE, accessToken, {
    ...cookieOptions('/'),
    maxAge: accessExpiresAt - Date.now(),
  })
  // The refresh token is only sent to /auth/* routes, never to the rest of the API.
  res.cookie(REFRESH_COOKIE, refresh.token, {
    ...cookieOptions('/auth'),
    maxAge: refresh.expiresAt - Date.now(),
  })
}

function clearSession(res) {
  res.clearCookie(ACCESS_COOKIE, cookieOptions('/'))
  res.clearCookie(REFRESH_COOKIE, cookieOptions('/auth'))
}

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  signEmailToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyEmailToken,
  issueSession,
  clearSession,
}
