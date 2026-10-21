/**
 * In-memory "database" for the guide.
 *
 * EXERCISE (see README): replace this with persistent storage
 * (SQLite + Prisma, PostgreSQL, etc.) — every function here is
 * already async so the swap is mechanical.
 */

const users = []; // { id, username, email, passwordHash, createdAt }
const revokedRefreshTokens = new Set(); // jti of revoked refresh tokens
let nextId = 1;

async function createUser({ username, email, passwordHash }) {
  const user = { id: String(nextId++), username, email, passwordHash, createdAt: new Date() };
  users.push(user);
  return user;
}

async function findUserByUsername(username) {
  return users.find((u) => u.username === username) || null;
}

async function findUserByEmail(email) {
  return users.find((u) => u.email === email) || null;
}

async function findUserById(id) {
  return users.find((u) => u.id === id) || null;
}

async function updateUser(id, patch) {
  const user = await findUserById(id);
  if (!user) return null;
  Object.assign(user, patch);
  return user;
}

function revokeRefreshToken(jti) {
  revokedRefreshTokens.add(jti);
}

function isRefreshTokenRevoked(jti) {
  return revokedRefreshTokens.has(jti);
}

module.exports = {
  users,
  createUser,
  findUserByUsername,
  findUserByEmail,
  findUserById,
  updateUser,
  revokeRefreshToken,
  isRefreshTokenRevoked,
};
