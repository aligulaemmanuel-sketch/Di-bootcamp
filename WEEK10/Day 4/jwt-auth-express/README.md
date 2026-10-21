# JWT Authentication in Node.js with Express — Complete Guide Project

A working implementation of every step in the guide: JWT structure, registration,
login, protected routes, httpOnly cookies, refresh-token rotation, revocation,
and rate limiting. In-memory storage keeps it self-contained — swap `src/db.js`
for a real database as your first exercise.

## 1. Introduction to JSON Web Tokens

A JWT is three Base64URL-encoded parts joined by dots:

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidHlwZSI6ImFjY2VzcyJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJVadQssw5c
└── header ──┘ └──────────── payload ───────────┘ └──── signature ────┘
```

- **Header** — algorithm and token type (`{ "alg": "HS256", "typ": "JWT" }`)
- **Payload** — claims: registered (`sub`, `iat`, `exp`), public, and private
- **Signature** — `HMACSHA256(header + "." + payload, secret)`; tampering breaks it

Key property: the payload is **readable by anyone** (it's just encoded, not
encrypted) — never put secrets in it. JWTs are used for *authentication*
(proving who you are) and *authorization* (what you're allowed to do), and
they're stateless: the server doesn't need a session store to verify them.

This project uses **two token types with two different secrets**:

| Token   | Lifetime | Stored in                | Purpose                        |
| ------- | -------- | ------------------------ | ------------------------------ |
| Access  | 15 min   | httpOnly cookie + body   | Authorize API requests         |
| Refresh | 7 days   | httpOnly cookie **only** | Mint new access tokens         |

## 2. Setting Up the Application

Already done in this project, but these were the steps:

```bash
mkdir jwt-auth-express && cd jwt-auth-express
npm init -y
npm install express --save
```

The entry point `server.js` creates the Express app, attaches global
middleware, mounts the routers, and starts listening.

## 3. Installing Dependencies

```bash
npm install jsonwebtoken bcryptjs cookie-parser dotenv
```

> **Note:** older guides install `body-parser`. Since Express 4.16, built-in
> `express.json()` replaces it — see `server.js`.

## 4–5. Auth Endpoints & Generating JWTs

`src/routes/auth.js` implements:

- **`POST /api/auth/register`** — validates input (Step 10, ex. #1), rejects
  duplicate username/email (`409`), hashes the password with **bcrypt** (cost 10),
  creates the user, then signs both tokens.
- **`POST /api/auth/login`** — compares the password with bcrypt, then signs
  both tokens. Always performs a dummy bcrypt compare on unknown usernames so
  response timing can't reveal which usernames exist.

Token signing lives in `src/utils/tokens.js`:

```js
jwt.sign({ sub: user.id, username: user.username, type: "access" },
         config.accessSecret, { expiresIn: "15m" });
```

Secrets come from `.env` (see `.env.example`) — never commit real secrets.

## 6. Authentication Middleware

`src/middleware/auth.js` extracts the token from the `access_token` **httpOnly
cookie** or the `Authorization: Bearer <token>` header, verifies it, checks the
`type` claim, and attaches the payload to `req.user`. Failures return:

| Situation           | Status | Body                                            |
| ------------------- | ------ | ----------------------------------------------- |
| No token            | 401    | `Authentication required. No token provided.`   |
| Expired token       | 401    | `Access token expired. Use /api/auth/refresh.`  |
| Invalid/signature   | 401    | `Invalid access token.`                         |
| Wrong token type    | 401    | `Wrong token type. Use an access token.`        |

## 7. Securing Routes

`src/routes/users.js` calls `router.use(authenticate)` — every route below it
requires a valid access token:

- **`GET /api/users/me`** — returns the authenticated user's profile.
- **`PATCH /api/users/me`** — updates email/password (Step 10, ex. #2) with
  validation and uniqueness checks.

Try it without a token and you'll get the `401` responses above.

## 8. HTTP Cookies for JWT Storage

Cookies are set with:

```js
res.cookie("refresh_token", token, {
  httpOnly: true,   // not readable from JavaScript -> defeats XSS theft
  sameSite: "lax",  // not sent on cross-site requests -> helps vs CSRF
  secure: true,     // HTTPS only (enabled automatically in production)
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

- **`POST /api/auth/logout`** verifies the incoming refresh token, adds its `jti`
  to the server-side **revocation list** (exercises #3 and #4), and clears both
  cookies (`204 No Content`).

## 9. Token Refresh (with Rotation)

`POST /api/auth/refresh` flow:

1. Read the `refresh_token` cookie.
2. Verify signature + expiry.
3. Check the `jti` against the revocation list.
4. Confirm the user still exists.
5. **Rotate**: revoke the used refresh token, issue a brand-new access+refresh pair.

Rotation means a stolen refresh token only works until the legitimate user
refreshes — after that it's revoked and reuse is rejected.

## Running the Project

```bash
cp .env.example .env
# generate real secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm install
npm run dev
```

Then walk through `test/api.http` (VS Code REST Client) or use curl:

```bash
# Register (cookies saved to jar)
curl -c jar.txt -X POST localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"sara","email":"sara@example.com","password":"passw0rd1"}'

# Access a protected route
curl -b jar.txt localhost:3000/api/users/me

# Simulate expiry: use the JSON accessToken with a bad/expired cookie
# Refresh
curl -b jar.txt -c jar.txt -X POST localhost:3000/api/auth/refresh

# Logout (revokes refresh token + clears cookies)
curl -b jar.txt -c jar.txt -X POST localhost:3000/api/auth/logout
```

## 10. Exercises — Status in This Project

| # | Exercise                                   | Status |
| - | ------------------------------------------ | ------ |
| 1 | Registration validation rules              | ✅ Implemented (`src/utils/validate.js`) |
| 2 | Authenticated profile update               | ✅ Implemented (`PATCH /api/users/me`) |
| 3 | Logout invalidates refresh token           | ✅ Implemented (revocation on logout) |
| 4 | Server-side revoked-token list             | ✅ Implemented (`src/db.js`, `jti`-based) |
| 5 | Persistent database instead of in-memory   | ⬜ Swap `src/db.js` for Prisma/SQLite — all functions are already `async` |
| 6 | Email confirmation with unique tokens      | ⬜ Add a `email_confirmations` table + token endpoint |
| 7 | Rate limiting on login/refresh             | ✅ Implemented (`src/middleware/rateLimit.js`) — use Redis in production |

## 11. Conclusion & Security Best Practices

- **Short-lived access tokens + long-lived refresh tokens** limits the blast
  radius of a leak; rotation detects refresh-token theft.
- **httpOnly + sameSite + secure cookies** protect tokens from XSS and CSRF.
- **bcrypt** (adaptive hashing) makes password leaks expensive to exploit.
- **Rate limiting** blunts brute-force attacks on credential endpoints.
- **Never trust the client**: every protected route re-derives identity from
  the verified token, and the webhook-style checks (type claim, revocation,
  amount/claims sanity) are all server-side.

Next steps: persistent storage (exercise #5), email confirmation (#6), Redis
rate limiter, and rotating secrets.
