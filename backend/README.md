# Upshift dashboard backend

Node + Express 5 + Prisma 7 + MySQL. Runs on its own, separate from `frontend/`.

- **One admin login** (username + password) for the dashboard at `/dashboard`. It's set in `.env`.
- **Reads the Google Sheets** (Babu, Vasudha, sales sheet) through the Apps Script feed every 5 minutes. It parses
  them here and stores everything in MySQL tables. The dashboard is served from those tables only.

## Tables

| Table | What's in it |
|-------|--------------|
| `admins` | The one dashboard login (password stored as a bcrypt hash) |
| `sheet_sources` | One row per sheet (babu, vasudha, sales): file name, last read, error, what was found, warnings |
| `ad_spend_rows` | Daily spend, leads and cost per lead per campaign / workshop |
| `awareness_rows` | Daily awareness campaigns (reach instead of leads) |
| `campaign_summaries` | Vasudha's summary table: per-campaign totals and funnel counts (Interested, Registered…) |
| `awareness_summaries` | Awareness lines of that summary table |
| `sales_workshops` | One row per tab of the sales sheet: students, and which columns held the amount / payment date |
| `sales_payments` | One row per student payment: workshop, payment date, amount, student |
| `sales_skipped_tabs` | Sales tabs that were left out, and why |
| `sync_runs` | Log of every read of the sheets (kept 30 days) |
| `hackathon_teams` / `hackathon_members` | AI Hackathon teams (1–4 members each, with every member's phone) |
| `arc_users` / `arc_consents` | Winter Arc participants (one per mobile) and every consent box shown, with its exact text and page version |
| `arc_entries` / `arc_results` | Winter Arc daily entries (five boxes, random code, auto-flags) and each day's published Top 10 with the winner claim steps |
| `arc_access_logs` | Every admin "resolve code" lookup |
| `otp_codes` | One-time codes for the mobile check on the idea form (hashed; kept 1 day) |

When a sheet changes, its rows are replaced with the new contents. When a sheet can't be read, its last good rows
stay and the error is noted in `sheet_sources`.

## First-time setup

Needs Node 20+ and MySQL 8.

```bash
cd backend
npm install
```

In `backend/.env` set:

- `DATABASE_URL`: your MySQL user, password and database name. Write special characters in the password
  URL-encoded (e.g. `@` → `%40`).
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`: the dashboard login.
- `APPS_SCRIPT_URL` / `APPS_SCRIPT_PASSWORD`: the Apps Script web app and its `PASSWORD`.

Then:

```bash
npm run db:setup   # creates the database and its tables
npm run dev        # starts the API on http://localhost:4100
```

Check it: <http://localhost:4100/api/health> shows `{"ok":true,...}`.

**Changing the login:** edit `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `.env` and restart. The old password stops
working at once.

## Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start with auto-restart on code changes (restart by hand after editing `.env`) |
| `npm start` | Start (for a server) |
| `npm run db:setup` | Create the database and tables (safe to run again) |
| `npm run db:migrate` | After editing `prisma/schema.prisma`: create and apply a migration |
| `npm run db:studio` | Browse the tables in the browser |
| `npm run typecheck` | Type-check |

## API

Everything except `/api/health` and `/api/auth/login` needs `Authorization: Bearer <token>`.

| Method | Path | |
|--------|------|---|
| GET | `/api/health` | Is it up |
| POST | `/api/auth/login` | `{username, password}` → `{token}` |
| GET | `/api/auth/me` | Is the sign-in still valid |
| GET | `/api/feed` | Everything the dashboard shows, from the tables. `?fresh=1` reads the sheets first |
| GET | `/api/ads` | Daily ad spend. `?owner=babu&from=2026-09-01&to=2026-09-30` |
| GET | `/api/sales/payments` | Payments. `?workshop=Cyber Security&from=…&to=…` |
| GET | `/api/sales/summary` | Revenue / payments per workshop for `?from=…&to=…` |
| GET | `/api/sync/runs` | The last 50 sheet reads, with errors |
| POST | `/api/ideas` | No sign-in. The idea form, as multipart/form-data with an optional `file` (PDF, PPT, Word, TXT, image or ZIP, up to 10 MB, saved in `uploads/ideas/`). Needs `phoneToken` only when `OTP_REQUIRED=true` |
| GET | `/api/ideas/:id/file` | Download an idea's file |
| POST | `/api/hackathon` | No sign-in. AI Hackathon team: `{teamName, category: students / experienced / mixed, idea?, members: [{name, phone, email?, organisation?}] (1–4, first = lead, lead email required)}` |
| GET | `/api/hackathon` | Every team with its members |
| PATCH | `/api/hackathon/:id` | `{paid: true / false}` |
| GET | `/api/arc/state` | No sign-in. Winter Arc day, today's theme and prompt (prompts unlock at 9:00 AM IST), winner announcement |
| POST | `/api/arc/session`, `/api/arc/register` | After OTP: sign in, or register with the consent boxes → 30-day participant token |
| GET / PATCH / DELETE | `/api/arc/me`, `/api/arc/me/consents` | Participant's own data, switch optional boxes, delete account |
| POST | `/api/arc/submit` | The page form (multipart): `name`, `idea`, `phoneToken` and an optional `file` (PDF, PPT, Word, TXT, image or ZIP, up to 10 MB, in `uploads/arc/`) (or a participant token) → creates the participant on first use and saves today's idea; same call edits it until 11:59 PM IST |
| PUT | `/api/arc/entry` | Save today's five-box entry (editable until 11:59 PM IST by server time) |
| GET | `/api/arc/board` | Winner Board: latest Top 10 and Arc Points top 20 (names only with consent) |
| GET / POST / PATCH | `/api/arc-admin/...` | Day counts, flags include/exclude, judging pack export (batch txt, all.csv, key.csv), Top 10 publish, claim tracker, logged code lookup |
| POST | `/api/otp/send` | No sign-in. `{phone}` → sends a code. `OTP_PROVIDER=spear`: we make a 6-digit code and Spear UC texts it from sender `SMS_SENDER` (UPSHFT) with the DLT-approved template `SMS_TEMPLATE_ID`; we check it ourselves. Key in `SMS_API_KEY`. `OTP_PROVIDER=console`: no SMS, the code is printed in the terminal and returned as `devCode` (testing only). 30 s between codes, 5 per number per hour |
| POST | `/api/otp/verify` | No sign-in. `{phone, code}` → `{phoneToken}` (valid 6 h). `POST /api/ideas` needs it with the same phone |

Sign-ins last `JWT_EXPIRES_IN` (12 hours). Changing `JWT_SECRET` signs everyone out.
