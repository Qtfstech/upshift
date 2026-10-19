/**
 * Address of the backend (the backend/ folder). It signs the admin in, reads the Google Sheets, takes ideas and
 * sends mobile codes.
 *  - `npm run dev`: http://localhost:4100.
 *  - Built site: the site's own domain (https://upshiftindia.com/api/...). The web server (nginx) passes /api to the
 *    backend running on the same VPS, so no address needs to be set.
 * Set VITE_BACKEND_URL (frontend/.env.local or .env.production) only if the backend lives somewhere else.
 */
export const BACKEND_URL: string = import.meta.env.VITE_BACKEND_URL ?? (import.meta.env.DEV ? 'http://localhost:4100' : '');

/** How often an open dashboard asks the backend for the latest data. */
export const LIVE_REFRESH_MS = 5 * 60 * 1000;
