require('dotenv').config()
const path = require('path')

function requireSecret(name) {
  const value = process.env[name]
  if (!value || value.length < 32) {
    throw new Error(
      `${name} is missing or too short (minimum 32 characters). ` +
        'Copy .env.example to .env and generate secrets as described there.',
    )
  }
  return value
}

const port = Number(process.env.PORT) || 3000

const config = {
  port,
  baseUrl: process.env.BASE_URL || `http://localhost:${port}`,
  isProduction: process.env.NODE_ENV === 'production',

  accessSecret: requireSecret('JWT_ACCESS_SECRET'),
  refreshSecret: requireSecret('JWT_REFRESH_SECRET'),
  emailSecret: requireSecret('JWT_EMAIL_SECRET'),

  accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
  requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',

  dataDir: process.env.DATA_DIR || path.join(__dirname, 'data'),
}

if (
  new Set([config.accessSecret, config.refreshSecret, config.emailSecret]).size !== 3
) {
  throw new Error('JWT_ACCESS_SECRET, JWT_REFRESH_SECRET and JWT_EMAIL_SECRET must all be different.')
}

module.exports = config
