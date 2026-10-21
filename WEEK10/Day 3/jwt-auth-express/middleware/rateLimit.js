const rateLimit = require('express-rate-limit')

function limiter(windowMs, limit, message, extra = {}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: message },
    ...extra,
  })
}

const MINUTE = 60 * 1000

// Counts failed attempts only: a successful login does not use up the allowance.
const loginLimiter = limiter(15 * MINUTE, 5, 'Too many login attempts. Try again in 15 minutes.', {
  skipSuccessfulRequests: true,
})

const refreshLimiter = limiter(15 * MINUTE, 30, 'Too many refresh attempts. Try again later.')

const registerLimiter = limiter(60 * MINUTE, 10, 'Too many registrations from this address. Try again later.')

module.exports = { loginLimiter, refreshLimiter, registerLimiter }
