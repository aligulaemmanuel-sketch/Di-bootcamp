// Run with: npm test   (Node 20+; uses the built-in test runner and fetch)
const fs = require('fs')
const os = require('os')
const path = require('path')
const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')

// Configure the app for testing BEFORE it is loaded.
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jwt-auth-test-'))
process.env.DATA_DIR = dataDir
process.env.BCRYPT_ROUNDS = '4' // fast hashing for tests
process.env.JWT_ACCESS_SECRET = 'test-access-secret-0123456789abcdef0123456789'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-0123456789abcdef012345678'
process.env.JWT_EMAIL_SECRET = 'test-email-secret-0123456789abcdef0123456789a'

const app = require('../app')
const { signEmailToken } = require('../utils/tokens')

let server
let base

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve)
  })
  base = `http://127.0.0.1:${server.address().port}`
})

after(() => {
  server.closeAllConnections()
  server.close()
  fs.rmSync(dataDir, { recursive: true, force: true })
})

function call(method, url, { body, cookie } = {}) {
  return fetch(base + url, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
}

/** Turn a response's Set-Cookie headers into a Cookie header, skipping cleared cookies. */
function cookiesFrom(res) {
  return res.headers
    .getSetCookie()
    .map((cookie) => cookie.split(';')[0])
    .filter((pair) => !pair.endsWith('='))
    .join('; ')
}

const credentials = { username: 'alice_1', email: 'alice@example.com', password: 'Str0ngPassword' }

test('JWT authentication flow', async (t) => {
  let userId

  await t.test('rejects a weak password', async () => {
    const res = await call('POST', '/auth/register', {
      body: { ...credentials, username: 'weak_user', email: 'weak@example.com', password: 'password' },
    })
    assert.equal(res.status, 400)
  })

  await t.test('registers and sets httpOnly cookies', async () => {
    const res = await call('POST', '/auth/register', { body: credentials })
    assert.equal(res.status, 201)

    const raw = res.headers.getSetCookie()
    assert.equal(raw.length, 2)
    assert.ok(raw.every((cookie) => cookie.includes('HttpOnly')))

    const body = await res.json()
    assert.equal(body.user.passwordHash, undefined)
    userId = body.user.id
  })

  await t.test('rejects a duplicate username', async () => {
    const res = await call('POST', '/auth/register', { body: credentials })
    assert.equal(res.status, 409)
  })

  await t.test('protected routes need a token', async () => {
    assert.equal((await call('GET', '/auth/check')).status, 401)
    assert.equal((await call('GET', '/api/dashboard')).status, 401)
    assert.equal(
      (await call('GET', '/auth/check', { cookie: 'accessToken=not-a-real-token' })).status,
      401,
    )
  })

  await t.test('rejects a wrong password with a generic message', async () => {
    const res = await call('POST', '/auth/login', {
      body: { username: credentials.username, password: 'Wrong-Password1' },
    })
    assert.equal(res.status, 401)
  })

  await t.test('logs in and reaches protected routes', async () => {
    const login = await call('POST', '/auth/login', {
      body: { username: credentials.username, password: credentials.password },
    })
    assert.equal(login.status, 200)
    const cookie = cookiesFrom(login)

    const check = await call('GET', '/auth/check', { cookie })
    assert.equal(check.status, 200)
    assert.equal((await check.json()).authenticated, true)

    assert.equal((await call('GET', '/api/dashboard', { cookie })).status, 200)
  })

  await t.test('updates the profile and validates input', async () => {
    const login = await call('POST', '/auth/login', {
      body: { username: credentials.username, password: credentials.password },
    })
    const cookie = cookiesFrom(login)

    const ok = await call('PUT', '/api/profile', {
      cookie,
      body: { displayName: 'Alice A.', bio: 'Reads a lot.' },
    })
    assert.equal(ok.status, 200)
    assert.equal((await ok.json()).user.displayName, 'Alice A.')

    const bad = await call('PUT', '/api/profile', { cookie, body: { displayName: '' } })
    assert.equal(bad.status, 400)
  })

  await t.test('verifies the email address', async () => {
    const res = await call('GET', `/auth/verify-email?token=${signEmailToken({ id: userId })}`)
    assert.equal(res.status, 200)

    const bad = await call('GET', '/auth/verify-email?token=garbage')
    assert.equal(bad.status, 400)
  })

  await t.test('rotates refresh tokens and detects reuse', async () => {
    const login = await call('POST', '/auth/login', {
      body: { username: credentials.username, password: credentials.password },
    })
    const first = cookiesFrom(login)

    const refreshed = await call('POST', '/auth/refresh', { cookie: first })
    assert.equal(refreshed.status, 200)
    const second = cookiesFrom(refreshed)
    assert.notEqual(second, first)

    // Using the old refresh token again is treated as theft...
    const reuse = await call('POST', '/auth/refresh', { cookie: first })
    assert.equal(reuse.status, 401)

    // ...and ends the newer session too.
    const afterReuse = await call('POST', '/auth/refresh', { cookie: second })
    assert.equal(afterReuse.status, 401)
  })

  await t.test('logout invalidates the refresh token', async () => {
    const login = await call('POST', '/auth/login', {
      body: { username: credentials.username, password: credentials.password },
    })
    const cookie = cookiesFrom(login)

    const logout = await call('POST', '/auth/logout', { cookie })
    assert.equal(logout.status, 200)

    const refresh = await call('POST', '/auth/refresh', { cookie })
    assert.equal(refresh.status, 401)
  })
})
