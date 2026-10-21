const express = require('express')
const { authenticate } = require('../middleware/auth')
const { validateProfileUpdate } = require('../utils/validators')
const userStore = require('../store/userStore')

const router = express.Router()

// Each route lists `authenticate` first, so only logged-in users reach the handler.

router.get('/dashboard', authenticate, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}! This data is only for logged-in users.` })
})

router.get('/profile', authenticate, (req, res) => {
  const user = userStore.findById(req.user.id)
  res.json({ user: userStore.toPublic(user) })
})

router.put('/profile', authenticate, (req, res) => {
  const { displayName, bio } = req.body || {}

  const errors = validateProfileUpdate({ displayName, bio })
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors })
  }

  // Only these fields can be changed here; id, username and password cannot.
  const changes = {}
  if (displayName !== undefined) changes.displayName = displayName.trim()
  if (bio !== undefined) changes.bio = bio.trim()

  const user = userStore.update(req.user.id, changes)
  return res.json({ message: 'Profile updated.', user: userStore.toPublic(user) })
})

module.exports = router
