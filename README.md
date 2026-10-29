# Wealth Sketch

Wealth Sketch is a server-backed group finance application built with a Next.js and TypeScript web client, a NestJS API, and PostgreSQL. There are no seeded accounts or sample financial records: each group is created by its owner and its records are stored in PostgreSQL.

## Current capabilities

- Personal-only accounts and multiple group memberships, with an explicit workspace switcher
- Group-scoped Owner, Admin, Treasurer, and Member roles and authorization checks
- One-time, expiring email password-reset links with session revocation
- Group-scoped member roster and email invitations that can add existing accounts to another group
- Manual contribution records persisted with balanced double-entry ledger entries and an audit record
- Group and individual savings goals with progress based on recorded contribution entries
- Private personal savings, investment, income, and expense tracking, separate from all group ledgers
- Loan requests, approval/decline decisions, and audit history
- One-time personal or group reminders with in-app alerts and optional email/SMS delivery
- Group summaries and contribution CSV export
- Sandbox M-Pesa Daraja STK Push contributions, reconciled against authenticated provider status before ledger posting
- Request validation, password hashing, rate limits, database transactions, and tenant-scoped queries

Daraja support is **sandbox-only** and does not process live payments. A contribution entered manually is still an administrator-entered record of a payment received outside Wealth Sketch; verify it against the actual bank or mobile-money statement. Loan approval is a recorded decision, not a disbursement. Do not use this release to custody funds.

Savings-goal progress includes only contribution records explicitly assigned to that goal and within its date range. Each contribution can be assigned to at most one goal. The discipline score compares recorded savings with the amount expected by the current date; the suggested weekly pace and projected completion date are estimates based on the remaining target and observed pace. These are planning aids, not live or independently verified cash balances.

Personal finance entries are private tracking records, not bank balances, investment valuations, or executed transactions. Reminders are one-time and user-scheduled; group-wide reminders are restricted to group managers. In-app alerts need no external provider. Email reminders use the SMTP settings; SMS reminders require `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`. Delivery errors remain visible in the alert panel and API logs.

## Requirements

- Node.js 20.9 or later and npm
- Docker with Compose, or an existing PostgreSQL 16 database

## Local setup

1. Start a local PostgreSQL database (the Compose password below is for local development only):

   ```powershell
   docker compose up -d postgres
   ```

   If using an existing database, set its connection URL in `api/.env` instead.

2. Create the API environment file:

   ```powershell
   Copy-Item api\.env.example api\.env
   ```

   Replace `JWT_SECRET` with a new secret of at least 32 characters. Generate one with:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
   ```

   For sandbox STK Push, configure `DARAJA_CALLBACK_URL` as a publicly reachable HTTPS URL ending in `/api/payments/daraja/callback` (use a secure tunnel during local development). Generate `DARAJA_ENCRYPTION_KEY` with:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
   ```

   Store that key in the API secret manager and keep it stable: group Daraja credentials are encrypted with it and cannot be decrypted if it is lost. Each group administrator enters that group’s sandbox shortcode, shortcode type (Paybill or Till), consumer key, consumer secret, and Lipa na M-Pesa passkey under **Settings**. Use only credentials from the Safaricom Daraja sandbox.

   To send member invitations, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in `api/.env` with credentials from your mail provider. Set `APP_URL` to the browser-accessible web URL and `WEB_ORIGIN` to that exact origin, including its port (for example, `http://localhost:3000`, or `http://localhost:3001` if Next.js selected port 3001). `WEB_ORIGIN` is checked on signed-in write requests, so it must match the URL you use to open the app. Invitation delivery fails explicitly when SMTP is not configured.

   Password recovery uses the same SMTP settings and `APP_URL`. Reset links expire after one hour, are stored as hashes, and can be used once; changing the password revokes existing sessions. For privacy, the request screen always confirms generically whether or not an account exists for the email.

3. Install dependencies and prepare the database:

   ```powershell
   npm install
   npm run db:generate
   npm run db:migrate
   ```

   The migrations include the initial schema, savings goals, member invitations, Daraja STK Push payments, and password reset. For a **new, empty database**, run the commands above as shown. For a database that already has Wealth Sketch tables but no Prisma migration history, do not run migrations blindly: take a verified backup and compare the live schema with `20261026090000_initial_schema` first. Only if it exactly matches that baseline, mark it as applied from the `api` directory with `npx prisma migrate resolve --applied 20261026090000_initial_schema`, then run `npx prisma migrate deploy` to apply later migrations. If the schema differs, stop and reconcile it before deploying; do not mark the baseline applied based on assumption.

4. Start the web application and API:

   ```powershell
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), create the first group administrator account, and use your own group records.

Run the API unit tests with `npm --prefix api run test`.

## Production configuration

- Provision managed PostgreSQL and set `DATABASE_URL` and a unique high-entropy `JWT_SECRET` in the API's secret manager. Never deploy the development password from `api/.env.example`.
- Preserve the generated `DARAJA_ENCRYPTION_KEY` in the API secret manager and use a publicly reachable HTTPS `DARAJA_CALLBACK_URL`. The integration remains sandbox-only.
- Configure authenticated SMTP credentials and `APP_URL` for member invitations; keep mail credentials in the API secret manager.
- Build and deploy the API and Next.js web application as separate services. Set `API_URL` for the Next.js service to its private API origin. Terminate HTTPS at the trusted ingress and configure `TRUST_PROXY_HOPS` to match the real proxy chain.
- Apply schema changes with `npm run db:deploy`; use `npm run db:migrate` only for local development.
- Configure TLS, database encryption and backups, restore tests, alerting, access review, and incident response before production use.
- Review Kenyan data protection and financial-service obligations with qualified advisers before handling real member data or connecting regulated services.

## Payment integration boundary

The Daraja implementation sends sandbox STK Push requests only. A callback is not treated as proof of payment: Wealth Sketch queries Daraja and checks the callback amount and phone against the initiated request before creating a contribution and balanced ledger entries; the provider receipt is retained for reconciliation. Repeated callbacks and status checks do not post a second contribution. Live transactions, C2B, loan disbursement, and Safaricom Daraja production credentials are not supported. Do not add production credentials or enable live money movement without a separately reviewed production integration, secure callback/reconciliation operations, and any required approvals and partner arrangements.

## Project layout

- `src/app` — Next.js web application
- `tailwind.config.ts` and `postcss.config.mjs` — Tailwind CSS utilities and animation configuration
- `api/src` — NestJS authentication and group API
- `api/prisma/schema.prisma` — PostgreSQL schema for users, groups, contributions and goal allocations, savings goals, loan decisions, double-entry ledger entries, and audit events
- `compose.yaml` — local PostgreSQL development service
- `MaliWise-Technology-Stack.md` — product technology recommendation
