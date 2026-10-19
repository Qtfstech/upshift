import cors from 'cors';
import express, {type NextFunction, type Request, type Response} from 'express';
import multer from 'multer';
import {ZodError} from 'zod';
import {HttpError} from './auth.ts';
import {corsOrigins} from './env.ts';
import {accountAdminRouter, accountRouter} from './routes/account.ts';
import {authRouter} from './routes/auth.ts';
import {dataRouter} from './routes/data.ts';
import {ideasRouter} from './routes/ideas.ts';
import {arcRouter} from './routes/arc.ts';
import {arcAdminRouter} from './routes/arcAdmin.ts';
import {hackathonRouter} from './routes/hackathon.ts';
import {otpRouter} from './routes/otp.ts';

export const app = express();

app.set('trust proxy', 1); // correct client IPs (for sign-in throttling) behind a proxy / load balancer
app.disable('x-powered-by');
// Allowed sites: CORS_ORIGIN (or * for any), plus any http://localhost / 127.0.0.1 port so `npm run dev` always works.
// The live site calls /api on its own domain through nginx, which needs no CORS at all.
const isLocal = (origin: string) => /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || corsOrigins.includes('*') || corsOrigins.includes(origin) || isLocal(origin)),
  }),
);
app.use(express.json({limit: '100kb'}));

app.get('/api/health', (_req, res) => res.json({ok: true, service: 'upshift-dashboard-backend'}));
app.use('/api/auth', authRouter);
app.use('/api/ideas', ideasRouter); // before dataRouter: posting an idea needs no sign-in
app.use('/api/otp', otpRouter); // mobile number check for the idea form, no sign-in
app.use('/api/hackathon', hackathonRouter); // team registration, no sign-in (listing needs it)
app.use('/api/arc', arcRouter); // Winter Arc: public + participant (own token)
app.use('/api/arc-admin', arcAdminRouter); // Winter Arc admin (dashboard sign-in)
app.use('/api/account', accountRouter); // website login (OTP), "My Upshift" summary, product tracking
app.use('/api/account-admin', accountAdminRouter); // sign-in log and product interest (dashboard sign-in)
app.use('/api', dataRouter);

app.use((_req, res) => res.status(404).json({error: 'Not found.'}));

// Express 5 passes errors thrown in async handlers here.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) return res.status(err.status).json({error: err.message});
  if (err instanceof multer.MulterError)
    return res.status(400).json({error: err.code === 'LIMIT_FILE_SIZE' ? 'The file is too big. The limit is 10 MB.' : 'Only one file can be attached.'});
  if (err instanceof ZodError) return res.status(400).json({error: err.issues.map((i) => i.message).join(' ')});
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({error: 'Invalid JSON.'});
  console.error(err);
  res.status(500).json({error: 'Something went wrong on the server.'});
});
