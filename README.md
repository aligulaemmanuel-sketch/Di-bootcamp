# Wealth Sketch

Wealth Sketch is a server-backed group finance application built with a Next.js and TypeScript web client, a NestJS API, and PostgreSQL. There are no seeded accounts or sample financial records: each group is created by its owner and its records are stored in PostgreSQL.

## Current capabilities

- Personal-only accounts and multiple group memberships, with an explicit workspace switcher
- Secure HTTP-only session cookie and access token expire after seven days
- Group-scoped Chama roles and SACCO Chairperson, Secretary, Treasurer, Credit Officer, and Member permissions
- Separate SACCO workspaces with manually tracked BOSA/FOSA share-capital, deposit, and withdrawal entries
- Group-level bank, MMF, and investment provider details with masked references; these are setup records only, not live integrations or balances
- Configurable SACCO loan products and member loan applications with recorded approval decisions
- One-time, expiring email password-reset links with session revocation
- Group-scoped member roster with email verification, invitations, and manager approval for new membership
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

New accounts must verify their email before signing in. Members accepting a group invitation request membership; an authorized group manager must approve it before group records become accessible. This verifies email control and records an administrator decision only; it does not validate membership against official SACCO records. Personal finance entries are private tracking records, not bank balances, investment valuations, or executed transactions. Reminders are one-time and user-scheduled; group-wide reminders are restricted to group managers. In-app alerts need no external provider. Email reminders use the SMTP settings; SMS reminders require `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`. Delivery errors remain visible in the alert panel and API logs.

SACCO workspaces are isolated from Chama contribution and payment flows. BOSA/FOSA values are manual records, not verified account balances; share capital is accepted only under BOSA, but withdrawals and account eligibility rules are not enforced. Loan products retain a stated method, annual interest rate, and term for reference only. The MVP does not calculate amortization or interest, manage guarantors or payroll check-off, post SACCO double-entry journals, reconcile transactions, or generate SASRA/regulatory returns. KYC documents and sensitive identity data are not collected. Production payment collection and disbursements are not available for SACCOs.

Bank, MMF, and investment provider details are group-level setup metadata, visible to approved members and authorized managers. Only provider names, masked references, and product/holding labels are stored. Balances, provider credentials, and automated syncing are not supported; integrate a provider only after obtaining its official API documentation and authorization requirements.

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

   To send account verification links, member invitations, and reminders, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in `api/.env` with credentials from your mail provider. Set `APP_URL` to the browser-accessible web URL and `WEB_ORIGIN` to that exact origin, including its port (for example, `http://localhost:3000`, or `http://localhost:3001` if Next.js selected port 3001). `WEB_ORIGIN` is checked on signed-in write requests, so it must match the URL you use to open the app. Email delivery fails explicitly when SMTP is not configured.

   Password recovery and email verification use the same SMTP settings and `APP_URL`. Reset and verification links expire after one hour, are stored as hashes, and can be used once; changing the password revokes existing sessions. For privacy, email resend screens always confirm generically whether or not an account needs verification.

   To enable social sign-in, register OAuth applications with Google, Apple, Microsoft Entra ID, Facebook, and GitHub, then set each provider's client ID and secret in `api/.env` (Apple uses a signed client secret instead). Add `http://localhost:4000/api/auth/oauth/<provider>/callback` to each provider app during local development; in deployment, use the API service's HTTPS origin with the same path. Apple also requires `APPLE_TEAM_ID`, `APPLE_KEY_ID`, and `APPLE_PRIVATE_KEY` (store the private key securely; newlines may be represented as `\n`). Microsoft can be restricted to a tenant with `MICROSOFT_TENANT_ID`; its default is `common`. Social sign-in requires the provider to return a verified email address. OAuth identities are stored separately and verified-email matches are connected to the existing account.

3. Install dependencies and prepare the database:

   ```powershell
   npm install
   npm run db:generate
   npm run db:migrate
   ```

   The migrations include the initial schema, savings goals, member invitations, Daraja STK Push payments, password reset, SACCO workspaces, email verification, and membership approval. For a **new, empty database**, run the commands above as shown. For a database that already has Wealth Sketch tables but no Prisma migration history, do not run migrations blindly: take a verified backup and compare the live schema with `20261026090000_initial_schema` first. Only if it exactly matches that baseline, mark it as applied from the `api` directory with `npx prisma migrate resolve --applied 20261026090000_initial_schema`, then run `npx prisma migrate deploy` to apply later migrations. If the schema differs, stop and reconcile it before deploying; do not mark the baseline applied based on assumption.

4. Start the web application and API:

   ```powershell
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), create the first group administrator account, and use your own group records.

Run the API unit tests with `npm --prefix api run test`.

## Render deployment

The root `render.yaml` defines two independent services: `maliwise-web` is the exported Next.js static site, and `maliwise-api` is the NestJS API. The web service calls the API directly from the browser, so `NEXT_PUBLIC_API_URL` must be the API's **public HTTPS URL**, not its private network address. The blueprint connects these service URLs and runs `npm run db:deploy` before starting the API.

1. Create a managed PostgreSQL database on Render, then create a Blueprint from this repository and select `render.yaml`. The blueprint prompts for the API's `DATABASE_URL`; use the database's **internal** connection URL when it is in the same Render region. Keep the database and application in the same region.
2. Deploy, and confirm the API health check at `/health` succeeds. The API start command applies pending Prisma migrations before serving requests.
3. If enabling social sign-in, add `https://<maliwise-api-host>/api/auth/oauth/<provider>/callback` to each provider application. OAuth callbacks terminate at the API, while `APP_URL` and `WEB_ORIGIN` refer to the frontend. Add provider credentials as API environment variables in Render.
4. For email, add the SMTP settings to the API service and set `APP_URL` to the frontend origin. For sandbox Daraja, preserve `DARAJA_ENCRYPTION_KEY` as an API secret and set `DARAJA_CALLBACK_URL` to a publicly reachable API URL ending in `/api/payments/daraja/callback`. The integration remains sandbox-only.

The blueprint sets `COOKIE_SAME_SITE=lax`, which is suitable for the Render `*.onrender.com` service URLs. If using custom domains, put the frontend and API on the same site (for example, `app.example.com` and `api.example.com`). For unrelated frontend and API domains, cookies require `COOKIE_SAME_SITE=none` and HTTPS, and browser third-party-cookie restrictions may still prevent sessions from working. `NEXT_PUBLIC_API_URL` is embedded during the static build; redeploy the frontend after changing the API URL.

Keep database credentials, SMTP/provider credentials, and other secrets in Render's environment settings, not in source control. Configure database backups and restore tests, alerting, access review, and incident response before production use. Review Kenyan data protection and financial-service obligations with qualified advisers before handling real member data or connecting regulated services.

## Payment integration boundary

The Daraja implementation sends sandbox STK Push requests only. A callback is not treated as proof of payment: Wealth Sketch queries Daraja and checks the callback amount and phone against the initiated request before creating a contribution and balanced ledger entries; the provider receipt is retained for reconciliation. Repeated callbacks and status checks do not post a second contribution. Live transactions, C2B, loan disbursement, and Safaricom Daraja production credentials are not supported. Do not add production credentials or enable live money movement without a separately reviewed production integration, secure callback/reconciliation operations, and any required approvals and partner arrangements.

## Project layout

- `src/app` — Next.js web application
- `tailwind.config.ts` and `postcss.config.mjs` — Tailwind CSS utilities and animation configuration
- `api/src` — NestJS authentication and group API
- `api/prisma/schema.prisma` — PostgreSQL schema for users, groups, contributions and goal allocations, savings goals, loan decisions, double-entry ledger entries, and audit events
- `compose.yaml` — local PostgreSQL development service
- `MaliWise-Technology-Stack.md` — product technology recommendation
