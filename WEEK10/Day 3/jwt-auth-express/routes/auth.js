const express = require('express')
const bcrypt = require('bcrypt')
const config = require('../config')
const asyncHandler = require('../utils/asyncHandler')
const { validateRegistration } = require('../utils/validators')
const {
  REFRESH_COOKIE,
  signEmailToken,
  verifyRefreshToken,
  verifyEmailToken,
  issueSession,
  clearSession,
} = require('../utils/tokens')
const userStore = require('../store/userStore')
const tokenStore = require('../store/tokenStore')
const { authenticate } = require('../middleware/auth')
const { loginLimiter, refreshLimiter, registerLimiter } = require('../middleware/rateLimit')

const router = express.Router()

// Compared against when the username does not exist, so a login attempt takes about
// the same time either way and cannot be used to discover which usernames exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', config.bcryptRounds)

// POST /auth/register
router.post(
  '/register',
  registerLimiter,
  asyncHandler(async (req, res) => {
    const { username, email, password } = req.body || {}

    const errors = validateRegistration({ username, email, password })
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors })
    }

    if (userStore.findByUsername(username)) {
      return res.status(409).json({ error: 'That username is already taken.' })
    }
    if (userStore.findByEmail(email)) {
      return res.status(409).json({ error: 'That email is already registered.' })
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds)
    const user = userStore.create({ username, email, passwordHash })

    // There is no mail server in this demo, so the "email" is printed to the console.
    const link = `${config.baseUrl}/auth/verify-email?token=${signEmailToken(user)}`
    console.log(`[email] Verification link for ${user.email}: ${link}`)

    issueSession(res, user)
    return res.status(201).json({
      message: 'Registered. Check the server console for your verification link.',
      user: userStore.toPublic(user),
    })
  }),
)

// POST /auth/login
router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { username, password } = req.body || {}

    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' })
    }

    const user = userStore.findByUsername(username)
    const passwordMatches = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH)

    // The same message for "no such user" and "wrong password".
    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid username or password.' })
    }

    if (config.requireEmailVerification && !user.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email address before logging in.' })
    }

    issueSession(res, user)
    return res.json({ message: 'Logged in.', user: userStore.toPublic(user) })
  }),
)

// POST /auth/refresh
// Swaps a valid refresh token for a new access token AND a new refresh token (rotation).
router.post(
  '/refresh',
  refreshLimiter,
  asyncHandler(async (req, res) => {
    const token = req.cookies && req.cookies[REFRESH_COOKIE]
    if (!token) {
      return res.status(401).json({ error: 'Refresh token missing.' })
    }

    let payload
    try {
      payload = verifyRefreshToken(token)
    } catch {
      clearSession(res)
      return res.status(401).json({ error: 'Invalid or expired refresh token.' })
    }

    const record = tokenStore.get(payload.jti)
    if (!record || record.userId !== payload.sub) {
      clearSession(res)
      return res.status(401).json({ error: 'Refresh token not recognised.' })
    }

    // A revoked token being used again means it may have been stolen:
    // end every session for that user.
    if (record.revoked) {
      tokenStore.revokeAllForUser(payload.sub)
      clearSession(res)
      return res.status(401).json({ error: 'Refresh token already used. Please log in again.' })
    }

    const user = userStore.findById(payload.sub)
    if (!user) {
      clearSession(res)
      return res.status(401).json({ error: 'Account not found.' })
    }

    tokenStore.revoke(payload.jti) // each refresh token works once
    issueSession(res, user)
    return res.json({ message: 'Token refreshed.' })
  }),
)

// POST /auth/logout: revoke this session's refresh token and clear the cookies.
router.post('/logout', (req, res) => {
  const token = req.cookies && req.cookies[REFRESH_COOKIE]
  if (token) {
    try {
      tokenStore.revoke(verifyRefreshToken(token).jti)
    } catch {
      // An invalid or expired token cannot be used anyway; just clear the cookies.
    }
  }
  clearSession(res)
  return res.json({ message: 'Logged out.' })
})

// POST /auth/logout-all: revoke every refresh token the user has (all devices).
router.post('/logout-all', authenticate, (req, res) => {
  tokenStore.revokeAllForUser(req.user.id)
  clearSession(res)
  return res.json({ message: 'Logged out of all sessions.' })
})

// GET /auth/check: 200 if the access token is valid, 401 otherwise (see middleware/auth.js).
router.get('/check', authenticate, (req, res) => {
  return res.json({ authenticated: true, user: req.user })
})

// GET /auth/verify-email?token=...
router.get('/verify-email', (req, res) => {
  const { token } = req.query
  if (typeof token !== 'string') {
    return res.status(400).json({ error: 'Verification token is required.' })
  }

  try {
    const payload = verifyEmailToken(token)
    const user = userStore.update(payload.sub, { emailVerified: true })
    if (!user) return res.status(404).json({ error: 'Account not found.' })
    return res.json({ message: 'Email verified. Thank you!' })
  } catch {
    return res.status(400).json({ error: 'Invalid or expired verification link.' })
  }
})

module.exports = router
