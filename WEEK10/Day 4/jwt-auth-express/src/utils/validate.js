/** Step 10 exercise #1: registration validation rules. */
const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

function validateRegistration({ username, email, password }) {
  const errors = [];
  if (!USERNAME_RE.test(username || "")) {
    errors.push("Username must be 3-30 characters: letters, numbers, underscores only.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) {
    errors.push("Email address is invalid.");
  }
  if (typeof password !== "string" || password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one letter and one number.");
  }
  return errors;
}

function validateProfilePatch({ email, password }) {
  const errors = [];
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email address is invalid.");
  }
  if (password !== undefined) {
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      errors.push("Password must be 8+ characters with at least one letter and one number.");
    }
  }
  return errors;
}

module.exports = { validateRegistration, validateProfilePatch };
