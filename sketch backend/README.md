# Sketch Backend

Express and Knex API for Sketch Code community accounts, discussions, replies, and likes. PostgreSQL uses the `dvdrental` database and adds four isolated `community_*` tables.

## Local setup

1. Create `.env` in this folder using `.env.example` as a template.
2. Set the connection fields to the values in your VS Code PostgreSQL profile. Keep the password in `.env`; it is git-ignored.
3. For production, set `JWT_SECRET` to a long random value. Local development generates a temporary secret each time the backend starts, so restarting it signs users out.
4. Install dependencies, migrate, and start the API:

```powershell
npm install
npm run migrate
npm run dev
```

The API listens on port `4000`. Start the frontend separately from `WEEK7/DAY 6` with `npm start`. The local frontend calls `http://localhost:4000` by default. For deployment, set `REACT_APP_API_URL` on the frontend and `FRONTEND_ORIGIN` on the backend.