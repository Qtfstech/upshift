import {randomUUID} from 'node:crypto';
import {mkdirSync} from 'node:fs';
import {unlink} from 'node:fs/promises';
import path from 'node:path';
import {Router} from 'express';
import multer from 'multer';
import {z} from 'zod';
import {HttpError, requireAuth} from '../auth.ts';
import {prisma} from '../db.ts';
import {env} from '../env.ts';
import {checkPhoneToken, normalizePhone} from '../otp.ts';

/** Idea Challenge page: anyone can send an idea; the dashboard lists them. */
export const ideasRouter = Router();

export const IDEA_CATEGORIES = ['Education', 'Health', 'Agriculture', 'Finance', 'Career & Jobs', 'Productivity', 'Social Good', 'Other'] as const;

// ---- Optional attachment: a pitch deck, document or image, up to 10 MB, kept in backend/uploads/ideas ----
export const UPLOAD_DIR = path.resolve(import.meta.dirname, '../../uploads/ideas');
mkdirSync(UPLOAD_DIR, {recursive: true});
const MAX_FILE_MB = 10;
const FILE_TYPES = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.webp', '.zip'];

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    // A random name on disk; the original name is kept in the table for downloads
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: {fileSize: MAX_FILE_MB * 1024 * 1024, files: 1},
  fileFilter: (_req, file, cb) => {
    if (FILE_TYPES.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new HttpError(400, `That file type isn't allowed. Use PDF, PPT, Word, TXT, an image or ZIP.`));
  },
});

const text = (min: number, max: number, what: string) =>
  z.string().trim().min(min, `${what} needs at least ${min} characters.`).max(max, `${what} can be at most ${max} characters.`);

const ideaBody = z.object({
  name: text(2, 120, 'Name'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(191),
  phone: z
    .string()
    .transform((s) => normalizePhone(s))
    .pipe(z.string({message: 'Enter a valid 10-digit mobile number.'})),
  /** From POST /api/otp/verify: proves the mobile number was confirmed with a code (needed when OTP_REQUIRED=true) */
  phoneToken: z.string().optional(),
  college: z.string().trim().max(191).optional().transform((s) => s || null),
  stage: z.string().trim().max(60).optional().transform((s) => s || null),
  title: text(4, 120, 'Idea title'),
  category: z.enum(IDEA_CATEGORIES, {message: 'Pick a category.'}),
  /** Optional: the short form asks only for the idea */
  problem: z.union([z.literal('').transform(() => null), text(20, 2000, 'The problem')]).nullish(),
  idea: text(20, 4000, 'Your idea'),
  /** Sent as a form field, so "true" / "false" text as well as a boolean */
  showOnWall: z.preprocess((v) => (typeof v === 'string' ? v !== 'false' : v), z.boolean()).default(true),
  /** Hidden field real people never fill in; bots usually do */
  website: z.string().optional(),
});

// ---- Spam limits: 5 ideas per IP per hour, and the same email can't send the same title twice ----
const HOUR = 60 * 60 * 1000;
const recent = new Map<string, number[]>();
function throttle(ip: string) {
  const now = Date.now();
  const times = (recent.get(ip) ?? []).filter((t) => now - t < HOUR);
  if (times.length >= 5) throw new HttpError(429, "You've sent several ideas already. Please try again in an hour.");
  times.push(now);
  recent.set(ip, times);
}

const firstName = (name: string) => name.trim().split(/\s+/)[0];

/** Sent as multipart/form-data (the form fields plus an optional `file`), or as JSON without a file. */
ideasRouter.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  try {
    const body = ideaBody.parse(req.body);
    if (body.website) {
      if (file) await unlink(file.path).catch(() => {});
      return res.status(201).json({ok: true}); // bot: pretend it worked
    }
    if (env.OTP_REQUIRED) checkPhoneToken(body.phoneToken, body.phone);
    throttle(req.ip ?? 'unknown');
    const dupe = await prisma.ideaSubmission.findFirst({where: {email: body.email, title: body.title}, select: {id: true}});
    if (dupe) throw new HttpError(409, "You've already sent this idea. We have it!");
    const {website: _, phoneToken: __, ...data} = body;
    const idea = await prisma.ideaSubmission.create({
      data: {
        ...data,
        phoneVerified: env.OTP_REQUIRED,
        ...(file && {fileName: file.originalname.slice(0, 191), fileStored: file.filename, fileType: file.mimetype.slice(0, 120), fileSize: file.size}),
      },
    });
    res.status(201).json({ok: true, id: idea.id, firstName: firstName(idea.name)});
  } catch (e) {
    if (file) await unlink(file.path).catch(() => {}); // don't keep files of ideas that weren't saved
    throw e;
  }
});

/** Public wall: latest ideas, without contact details. */
ideasRouter.get('/wall', async (_req, res) => {
  const [total, latest] = await Promise.all([
    prisma.ideaSubmission.count(),
    prisma.ideaSubmission.findMany({
      where: {showOnWall: true},
      orderBy: {id: 'desc'},
      take: 12,
      select: {id: true, name: true, college: true, title: true, category: true, createdAt: true},
    }),
  ]);
  res.json({total, ideas: latest.map(({name, ...i}) => ({...i, firstName: firstName(name)}))});
});

/** Dashboard: every submission with contact details. */
ideasRouter.get('/', requireAuth, async (_req, res) => {
  res.json({ideas: await prisma.ideaSubmission.findMany({orderBy: {id: 'desc'}})});
});

/** Dashboard: download an idea's attachment. */
ideasRouter.get('/:id/file', requireAuth, async (req, res) => {
  const idea = await prisma.ideaSubmission.findUnique({where: {id: Number(req.params.id) || 0}, select: {fileName: true, fileStored: true}});
  if (!idea?.fileStored || !idea.fileName) throw new HttpError(404, 'This idea has no file.');
  res.download(path.join(UPLOAD_DIR, path.basename(idea.fileStored)), idea.fileName, (err) => {
    if (err && !res.headersSent) res.status(404).json({error: 'The file is missing on the server.'});
  });
});
