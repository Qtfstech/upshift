# Upshift India

Two separate apps, each with its own `package.json`, run on their own:

| Folder | What | Runs on |
|--------|------|---------|
| [`frontend/`](frontend/) | The website (React + Vite): the main site, `/courses`, and the CEO dashboard at `/dashboard` | http://localhost:3000 |
| [`backend/`](backend/) | The dashboard API (Node + Express + Prisma + MySQL): admin sign-in, reads the Google Sheets every 5 minutes and stores them in MySQL tables | http://localhost:4100 |
| [`apps-script/`](apps-script/) | The small Google Apps Script that hands the private Google Sheets to the backend | Google |

## Run locally

Backend (first time: see [backend/README.md](backend/README.md) for `.env` and `npm run db:setup`):

```bash
cd backend
npm install
npm run dev
```

Frontend, in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000/dashboard and sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `backend/.env`.

The frontend calls the backend at `http://localhost:4100` by default. For a deployed site, set
`VITE_BACKEND_URL` (e.g. in `frontend/.env.local` or the hosting settings) to the backend's address, and add the
site's address to `CORS_ORIGIN` in `backend/.env`.
