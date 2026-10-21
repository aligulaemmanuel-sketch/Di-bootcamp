# JWT Authentication in Node.js with Express: a checklist guide

This project implements every step below. Tick the boxes as you read the code, or rebuild it
yourself from scratch following the same order.

**Quick start**

```bash
npm install
cp .env.example .env     # then fill in the three secrets (command is inside the file)
npm start                # http://localhost:3000
npm test                 # runs the automated tests (Node 20+)
```

---

## 1. Introduction to JSON Web Tokens (JWT)

- [ ] **A JWT is a signed string with three dot-separated parts**, each Base64URL-encoded:
  - **Header**: the token type and signing algorithm, e.g. `{"alg":"HS256","typ":"JWT"}`.
  - **Payload**: the claims, e.g. `sub` (user id), `exp` (expiry), `jti` (unique token id).
  - **Signature**: a signature over header and payload made with a secret. If anyone changes the
    payload, the signature no longer matches and verification fails.
- [ ] **The payload is encoded, not encrypted.** Anyone can read it, so never put passwords or
  other secrets in a token.
- [ ] **Typical uses:** *authentication* (proving who the user is without a server-side session
  lookup on every request) and *authorization* (carrying a user id or role for access decisions).

## 2. Set up a Node.js and Express application

- [ ] Install Node.js 20+ and npm (`node --version`).
- [ ] Create a project directory and initialize it:

  ```bash
  mkdir jwt-auth-express && cd jwt-auth-express
  npm init -y
  npm install express --save
  ```

- [ ] Create the basic app. See [`app.js`](app.js): it creates the Express app, adds middleware,
  mounts routes, and listens on `PORT`.

## 3. Install dependencies

- [ ] Install the packages from the guide:

  ```bash
  npm install jsonwebtoken bcrypt body-parser cookie-parser
  ```

- [ ] This project also uses `dotenv` (loads `.env`) and `express-rate-limit` (exercise 7):

  ```bash
  npm install dotenv express-rate-limit
  ```

- [ ] Set up middleware in [`app.js`](app.js): `bodyParser.json()` reads JSON bodies (limited to
  10 KB) and `cookieParser()` reads cookies.

## 4. Create the user authentication endpoints

- [ ] **Router file:** [`routes/auth.js`](routes/auth.js) holds `/register`, `/login`, `/refresh`,
  `/logout` and more. It is mounted at `/auth` in `app.js`.
- [ ] **Users "table":** [`store/userStore.js`](store/userStore.js). Users are kept in memory and
  saved to `data/users.json`.
- [ ] **Registration:**
  - validates input ([`utils/validators.js`](utils/validators.js))
  - rejects duplicate usernames and emails (409)
  - hashes the password with `bcrypt` (never stores it in plain text)
  - issues tokens (step 5)
- [ ] **Login:**
  - validates input
  - compares the password with `bcrypt.compare`
  - gives the same "Invalid username or password" message for an unknown user and a wrong
    password, and does the same amount of hashing work in both cases
  - issues tokens

## 5. Generate JWTs

- [ ] Tokens are created in [`utils/tokens.js`](utils/tokens.js) with `jsonwebtoken` and issued by
  both `/register` and `/login`.
- [ ] **Expiry:** `ACCESS_TOKEN_EXPIRES_IN` (default `1h`) and `REFRESH_TOKEN_EXPIRES_IN`
  (default `7d`). With refresh tokens in place (step 9), a shorter access token such as `15m` is a
  good choice.
- [ ] **Secret keys:** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EMAIL_SECRET` in `.env`.
  [`config.js`](config.js) refuses to start if a secret is missing, shorter than 32 characters, or
  reused. Generate one with:

  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

## 6. Implement middleware for authentication

- [ ] **Middleware file:** [`middleware/auth.js`](middleware/auth.js), exporting `authenticate`.
- [ ] **Verification:** reads the token from the `accessToken` cookie (or an
  `Authorization: Bearer <token>` header) and verifies it, pinning the algorithm to HS256.
- [ ] **Failures return 401** with a `code` the client can act on:

  | Situation | Status | `code` |
  | --- | --- | --- |
  | No token | 401 | `TOKEN_MISSING` |
  | Token expired (call `/auth/refresh`) | 401 | `TOKEN_EXPIRED` |
  | Bad signature, malformed, or user deleted | 401 | `TOKEN_INVALID` |

## 7. Secure routes with JWT authentication

- [ ] **Protected routes:** [`routes/api.js`](routes/api.js) defines `GET /api/dashboard`,
  `GET /api/profile` and `PUT /api/profile`.
- [ ] **Middleware applied:** each route lists `authenticate` before its handler, so only
  authenticated users reach it.
- [ ] **A special authentication route:** `GET /auth/check` returns `200 {"authenticated":true}`
  for a valid token and `401` otherwise. Front ends can call it to find out whether the user is
  logged in.

## 8. Use HTTP cookies for JWT storage

- [ ] **Enable cookie handling:** `cookieParser()` in `app.js`.
- [ ] **Set JWTs as cookies** (`issueSession` in `utils/tokens.js`) with:
  - `httpOnly`: JavaScript cannot read the cookie, which limits what an XSS attack can steal
  - `secure` in production: sent over HTTPS only
  - `sameSite: 'strict'`: not sent on cross-site requests, which blocks most CSRF attacks
- [ ] **Logout:** `POST /auth/logout` revokes the refresh token and clears both cookies.
  `POST /auth/logout-all` ends every session for the user.

## 9. Implement token refresh

- [ ] **Login returns two tokens:** a short-lived access token (cookie path `/`) and a longer-lived
  refresh token (cookie path `/auth`, so it is only sent to the auth routes).
- [ ] **Refresh tokens last longer:** 7 days by default.
- [ ] **`POST /auth/refresh`** verifies the refresh token, checks it in
  [`store/tokenStore.js`](store/tokenStore.js), and issues a new access token.
- [ ] **Rotation:** each refresh token works once. If a revoked token shows up again, it may have
  been stolen, so every session for that user is ended. (A side effect: two browser tabs that
  refresh at the exact same moment can log the user out.)

---

## Try it with curl

`-c` saves cookies to a file and `-b` sends them back.

```bash
# Register (the verification link is printed in the server console)
curl -i -c jar.txt -H 'Content-Type: application/json' \
  -d '{"username":"alice","email":"alice@example.com","password":"Str0ngPassword"}' \
  http://localhost:3000/auth/register

# Authenticated and unauthenticated
curl -i -b jar.txt http://localhost:3000/auth/check          # 200
curl -i http://localhost:3000/auth/check                     # 401

# Protected data and profile update
curl -b jar.txt http://localhost:3000/api/dashboard
curl -b jar.txt -X PUT -H 'Content-Type: application/json' \
  -d '{"displayName":"Alice A.","bio":"Reads a lot."}' http://localhost:3000/api/profile

# Refresh, then logout
curl -b jar.txt -c jar.txt -X POST http://localhost:3000/auth/refresh
curl -b jar.txt -c jar.txt -X POST http://localhost:3000/auth/logout
```

---

## 10. Exercises to reinforce your knowledge

All seven are implemented, so you can read, extend or rewrite them.

| Exercise | Where |
| --- | --- |
| Registration validation for usernames and passwords | `validateRegistration` in `utils/validators.js` |
| Authenticated users update their profile | `PUT /api/profile` in `routes/api.js` |
| Logout invalidates refresh tokens | `POST /auth/logout` and `/auth/logout-all` in `routes/auth.js` |
| Token revocation list | `store/tokenStore.js` (each token has a `revoked` flag) |
| Persistent storage instead of in-memory data | JSON files in `data/`, via `store/` |
| Email confirmation with unique tokens | `GET /auth/verify-email`; set `REQUIRE_EMAIL_VERIFICATION=true` to enforce it |
| Rate limiting on login and refresh | `middleware/rateLimit.js` |

Two of these are simplified on purpose:

- **Persistence:** JSON files are enough for learning but are not a real database (no concurrent
  writers, no queries). To move to SQLite, PostgreSQL or MongoDB, keep the function names in
  `store/userStore.js` and `store/tokenStore.js` and replace their bodies. Nothing else needs to change,
  except that the functions become `async`.
- **Email:** there is no mail server. The verification link is printed to the console. Replace the
  `console.log` in `routes/auth.js` with a call to a mail service such as Nodemailer.

Ideas for going further: roles and permissions in the token payload, password reset by email,
account lockout after repeated failures, two-factor authentication.

---

## 11. Conclusion

**Key takeaways**

- A JWT is a signed, readable token. The signature proves it was not altered, but it hides nothing.
- Hash passwords with bcrypt, validate all input, and give generic login errors.
- Keep access tokens short-lived and use refresh tokens, stored server-side so they can be revoked,
  to keep users signed in.
- Store tokens in `httpOnly`, `sameSite` (and in production `secure`) cookies rather than in
  `localStorage`.
- Protect routes with middleware that returns clear 401 responses.
- Rate-limit login and refresh endpoints.

**Why it matters:** authentication guards every user's data. Small mistakes, such as a weak secret,
a long-lived token with no way to revoke it, or a token in `localStorage`, are how accounts get
taken over.

**Keep learning**

- Read the [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
  and the [JWT RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519).
- Add the [`helmet`](https://www.npmjs.com/package/helmet) package for security headers, always
  serve over HTTPS, and rotate secrets on a schedule.
- Learn when to use an established identity provider (Auth0, Clerk, Keycloak, a framework's built-in
  auth) instead of building your own.

## Project layout

```
app.js                   Express app and server start
config.js                Environment settings and secret checks
routes/auth.js           register, login, refresh, logout, logout-all, check, verify-email
routes/api.js            Protected routes: dashboard, profile
middleware/auth.js       JWT authentication middleware
middleware/rateLimit.js  Login, refresh and registration limiters
store/userStore.js       Users "table" (JSON-file backed)
store/tokenStore.js      Refresh-token records and revocation
utils/tokens.js          Sign and verify tokens, set and clear cookies
utils/validators.js      Input validation
test/auth.test.js        End-to-end tests (node:test)
```
