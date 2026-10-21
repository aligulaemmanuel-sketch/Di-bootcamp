# StoryWeave — Collaborative Storytelling App

Full-stack app where users register, write stories **together in real time**,
track **version history**, comment and react, customize profiles with avatar
uploads, and share stories via public links.

## Feature checklist

| Requirement | Where |
| --- | --- |
| 🔐 Auth: Node.js + JWT, bcrypt passwords | `server/src/routes/auth.ts`, `middleware/auth.ts` |
| 🗄️ CRUD with PostgreSQL | Prisma schema + `routes/stories.ts`, `routes/comments.ts`, `routes/versions.ts` |
| ⚛️ React + TypeScript frontend | `client/src` (Vite) |
| 🛠️ Redux Toolkit state | `client/src/store` (auth + stories slices, typed hooks) |
| 🎨 Tailwind CSS + daisyUI | `client/tailwind.config.js`, components |
| 💬 Comments (add/edit/delete/react, owner can disable) | `CommentSection.tsx` + `routes/comments.ts` |
| 🤝 Real-time collaboration over WebSockets | `server/src/ws/collab.ts` (Socket.IO) + `client/src/pages/EditorPage.tsx`; presence avatars + live cursor indicators (bonus ✅) |
| 📜 Version control (save/view/restore) | `routes/versions.ts` + `VersionHistory.tsx`; every restore snapshots the current state first so nothing is ever lost |
| 👤 User profiles + Cloudinary avatar uploads | `ProfilePage.tsx` + `routes/upload.ts` (signed direct-to-Cloudinary uploads) |
| 🔗 Social sharing | `ShareButtons.tsx` (copy link, X, Facebook) + public `/share/:token` page |
| ✅ Testing | Vitest: server unit tests (validation, JWT round-trip), client component test (Testing Library); run `npm test` in either package |
| 🌐 Deployable on Render | `render.yaml` + guide below |

## Project structure

```
storyweave/
├── docker-compose.yml          # PostgreSQL for local dev
├── server/                     # Express + Prisma + Socket.IO
│   ├── prisma/schema.prisma    # Users, Stories, Collaborators, Versions, Comments, Reactions
│   └── src/
│       ├── index.ts            # App + HTTP server + Socket.IO wiring
│       ├── routes/             # auth, users, stories, comments, versions, upload, share
│       ├── middleware/auth.ts  # JWT verification
│       ├── lib/access.ts       # Role checks: OWNER / EDITOR / VIEWER
│       └── ws/collab.ts        # Realtime rooms, presence, cursors, live edits
└── client/                     # React + TypeScript + Redux Toolkit + Tailwind/daisyUI
    └── src/
        ├── store/              # authSlice + storiesSlice (createAsyncThunk)
        ├── pages/              # Login, Register, Feed, NewStory, Story, Editor, Profile, Share
        ├── components/         # Navbar, StoryCard, CommentSection, VersionHistory, ShareButtons, AvatarUpload
        ├── socket.ts           # Authenticated Socket.IO client
        └── api.ts              # Axios instance with JWT interceptor
```

## Quick start

```bash
# 1. Database
docker compose up -d

# 2. Server
cd server
cp .env.example .env        # set DATABASE_URL + JWT_SECRET + Cloudinary keys
npm install
npm run db:push
npm run db:seed             # demo users: sara@example.com / leo@example.com (passw0rd!)
npm run dev                 # http://localhost:4000

# 3. Client (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Try the demo: sign in as `leo@example.com`, open "The Lighthouse at the Edge of
Time", click **Open editor**. Open a second browser (or incognito window) as
`sara@example.com` in the same editor — you'll see presence avatars, live
content sync, and cursor indicators.

### Run the tests

```bash
cd server && npm test     # zod validation rules + JWT sign/verify
cd client && npm test     # LoginPage render smoke test (Testing Library + jsdom)
```

## How the real-time collaboration works

```
Client A (editor)                Server (Socket.IO)               Client B (editor)
    |  story:update (debounced)      |                                |
    |-----------------------------> |  persist to Postgres           |
    |                                |  socket.to(room).emit(         |  story:updated
    |                                |    "story:updated")           |-------------> update textarea
    |  cursor {position}             |  broadcast "cursor"            |
    |-----------------------------> | -----------------------------> | show "alice ⌁"
```

- Every socket authenticates with the **same JWT** as the REST API (`io.use`).
- Clients join a room per story after a role check (`story:join`).
- Edits are debounced (400 ms) server-side-persisted and broadcast with
  **last-write-wins** semantics — fine for an MVP; an OT/CRDT library
  (Yjs, Automerge) is the documented upgrade path.
- Comments created via REST emit `comment:refresh` to the story room, so all
  viewers see new comments instantly without polling.

## Version control design

- `POST /api/stories/:id/versions` snapshots `{title, content, label}` with an
  incrementing `versionNumber` (computed in a transaction-safe aggregate).
- **Restore never destroys data**: it overwrites the story, then immediately
  saves a new version recording "Restored from vX" — full audit trail.
- REST-layer restores also emit `story:updated` so open editors reload.

## Security notes

- Passwords hashed with **bcrypt** (cost 10); login runs a dummy compare for
  unknown emails to prevent user enumeration via timing.
- All mutations validated with **zod**; errors return safe messages.
- Role checks (`lib/access.ts`) run on **every** story mutation, comment
  moderation action, and socket event — client-side role badges are cosmetic.
- Share links use an unguessable `shareToken` (cuid) and expose a read-only view.
- JWT secret from env; in production serve the client over HTTPS and the
  token-in-localStorage trade-off is documented (httpOnly cookie or refresh
  rotation would be the upgrade, as in a dedicated auth guide).

## Deploying to Render

1. Push this repo to GitHub.
2. **PostgreSQL**: create a Render Postgres instance; copy the internal URL.
3. **Web service (server)**: root `server`, build `npm install && npm run db:push && npm run build`,
   start `npm start`. Env vars: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (your client URL),
   Cloudinary keys. Note: Socket.IO works on Render's single-instance websockets; for
   multi-instance scale, add the Redis adapter.
4. **Static site (client)**: root `client`, build `npm install && npm run build`,
   publish `dist`. Env vars: `VITE_API_URL=https://<server>.onrender.com`,
   `VITE_SOCKET_URL=https://<server>.onrender.com`.
5. Add the client's URL to the server's `CLIENT_URL` (comma-separated for multiple).

A starter `render.yaml` is included.

## Known trade-offs (good interview talking points)

- **In-memory presence** — fine single-instance; move to Redis adapter later.
- **Last-write-wins editing** — Yjs/Automerge suggested for character-level merges.
- **No refresh tokens** — access tokens live 12h; add rotation for production.
- **Email confirmation not included** — mailer left as an exercise.
