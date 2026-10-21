// Refresh-token records, keyed by the token's unique id (the JWT "jti" claim).
// A token is only accepted if it is listed here and not revoked, which is what
// makes logout and revocation possible. Persisted to data/tokens.json.
const path = require('path')
const config = require('../config')
const { readJson, writeJson } = require('../utils/jsonFile')

const FILE = path.join(config.dataDir, 'tokens.json')
let tokens = readJson(FILE, {}) // jti -> { userId, expiresAt (ms), revoked }

function save() {
  // Expired tokens fail verification anyway, so their records can be dropped.
  const now = Date.now()
  for (const [jti, record] of Object.entries(tokens)) {
    if (record.expiresAt < now) delete tokens[jti]
  }
  writeJson(FILE, tokens)
}

function add(jti, userId, expiresAt) {
  tokens[jti] = { userId, expiresAt, revoked: false }
  save()
}

function get(jti) {
  return tokens[jti] || null
}

function revoke(jti) {
  if (tokens[jti]) {
    tokens[jti].revoked = true
    save()
  }
}

function revokeAllForUser(userId) {
  for (const record of Object.values(tokens)) {
    if (record.userId === userId) record.revoked = true
  }
  save()
}

module.exports = { add, get, revoke, revokeAllForUser }
