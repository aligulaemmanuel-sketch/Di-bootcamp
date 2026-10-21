const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Returns a list of problems (an empty list means the input is valid). */
function validateRegistration({ username, email, password }) {
  const errors = []

  if (typeof username !== 'string' || !USERNAME_PATTERN.test(username.trim())) {
    errors.push('Username must be 3-20 characters: letters, numbers and underscores only.')
  }

  if (typeof email !== 'string' || email.length > 254 || !EMAIL_PATTERN.test(email.trim())) {
    errors.push('A valid email address is required.')
  }

  if (typeof password !== 'string') {
    errors.push('Password is required.')
  } else {
    // bcrypt only uses the first 72 bytes, so longer passwords are rejected.
    if (password.length < 8 || password.length > 72) {
      errors.push('Password must be between 8 and 72 characters.')
    }
    if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter.')
    if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter.')
    if (!/\d/.test(password)) errors.push('Password must contain a number.')
    if (
      typeof username === 'string' &&
      username.trim().length >= 3 &&
      password.toLowerCase().includes(username.trim().toLowerCase())
    ) {
      errors.push('Password must not contain your username.')
    }
  }

  return errors
}

function validateProfileUpdate({ displayName, bio }) {
  const errors = []

  if (displayName === undefined && bio === undefined) {
    errors.push('Provide at least one field to update: displayName or bio.')
  }

  if (displayName !== undefined) {
    if (typeof displayName !== 'string' || displayName.trim().length < 1 || displayName.trim().length > 50) {
      errors.push('displayName must be 1-50 characters.')
    }
  }

  if (bio !== undefined) {
    if (typeof bio !== 'string' || bio.length > 280) {
      errors.push('bio must be a string of at most 280 characters.')
    }
  }

  return errors
}

module.exports = { validateRegistration, validateProfileUpdate }
