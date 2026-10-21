// The users "table". It lives in memory and is saved to data/users.json after every change,
// so users survive restarts. To use a real database, keep these function names and
// replace the bodies (see the README).
const crypto = require('crypto')
const path = require('path')
const config = require('../config')
const { readJson, writeJson } = require('../utils/jsonFile')

const FILE = path.join(config.dataDir, 'users.json')
let users = readJson(FILE, [])

function save() {
  writeJson(FILE, users)
}

/** A copy of the user that is safe to send to clients (no password hash). */
function toPublic(user) {
  const { passwordHash, ...safe } = user
  return safe
}

function findById(id) {
  return users.find((user) => user.id === id) || null
}

function findByUsername(username) {
  const wanted = String(username).trim().toLowerCase()
  return users.find((user) => user.username.toLowerCase() === wanted) || null
}

function findByEmail(email) {
  const wanted = String(email).trim().toLowerCase()
  return users.find((user) => user.email === wanted) || null
}

function create({ username, email, passwordHash }) {
  const user = {
    id: crypto.randomUUID(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    displayName: username.trim(),
    bio: '',
    emailVerified: false,
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  save()
  return user
}

function update(id, changes) {
  const user = findById(id)
  if (!user) return null
  Object.assign(user, changes)
  save()
  return user
}

module.exports = { toPublic, findById, findByUsername, findByEmail, create, update }
