import {Router} from 'express';
import {z} from 'zod';
import {accountFromRequest} from '../account/session.ts';
import {HttpError, requireAuth} from '../auth.ts';
import {prisma} from '../db.ts';
import {normalizePhone} from '../otp.ts';

/** Sober October Hackathon page: teams of 1, 2 or 4 register (₹199 per member); the dashboard lists them. */
export const hackathonRouter = Router();

/** 'experienced' is kept for teams registered before the brief changed to students and recent graduates */
export const HACKATHON_CATEGORIES = ['students', 'graduates', 'mixed', 'experienced'] as const;
export const TEAM_SIZES = [1, 2, 4];

const text = (min: number, max: number, what: string) =>
  z.string().trim().min(min, `${what} needs at least ${min} characters.`).max(max, `${what} can be at most ${max} characters.`);
const optional = (max: number) =>
  z.string().trim().max(max).optional().transform((s) => s || null);

const member = (n: number) =>
  z.object({
    name: text(2, 120, `Member ${n}'s name`),
    phone: z
      .string()
      .transform((s) => normalizePhone(s))
      .pipe(z.string({message: `Enter a valid 10-digit mobile number for member ${n}.`})),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(191)
      .optional()
      .transform((s) => s || null)
      .pipe(z.string().email(`Enter a valid email for member ${n}.`).nullable()),
    organisation: optional(191),
  });

const teamBody = z.object({
  teamName: text(2, 120, 'Team name'),
  category: z.enum(HACKATHON_CATEGORIES, {message: 'Pick who the team is (students, recent graduates or mixed).'}),
  idea: optional(2000),
  members: z
    .array(z.unknown())
    .refine((list) => TEAM_SIZES.includes(list.length), 'A team can have 1, 2 or 4 members.')
    .transform((list, ctx) =>
      list.map((m, i) => {
        const r = member(i + 1).safeParse(m);
        if (!r.success) {
          for (const issue of r.error.issues) ctx.addIssue({code: 'custom', message: issue.message});
          return z.NEVER;
        }
        return r.data;
      }),
    ),
  /** Everyone in the team confirms they are 18 or older (eligibility rule) */
  adult: z.literal(true, {message: 'All team members must be 18 or older.'}),
  marketingConsent: z.boolean().default(false),
  /** Hidden field real people never fill in; bots usually do */
  website: z.string().optional(),
});

// ---- Spam limit: 5 registrations per IP per hour ----
const HOUR = 60 * 60 * 1000;
const recent = new Map<string, number[]>();
function throttle(ip: string) {
  const now = Date.now();
  const times = (recent.get(ip) ?? []).filter((t) => now - t < HOUR);
  if (times.length >= 5) throw new HttpError(429, "You've registered several teams already. Please try again in an hour.");
  times.push(now);
  recent.set(ip, times);
}

hackathonRouter.post('/', async (req, res) => {
  const body = teamBody.parse(req.body);
  if (body.website) return res.status(201).json({ok: true}); // bot: pretend it worked

  const lead = body.members[0];
  if (!lead.email) throw new HttpError(400, "Enter the team lead's email.");
  const phones = body.members.map((m) => m.phone);
  if (new Set(phones).size !== phones.length) throw new HttpError(400, 'Each team member needs a different mobile number.');

  throttle(req.ip ?? 'unknown');
  const taken = await prisma.hackathonMember.findFirst({where: {phone: {in: phones}}, select: {phone: true, team: {select: {teamName: true}}}});
  if (taken) throw new HttpError(409, `${taken.phone} is already registered in team "${taken.team.teamName}".`);

  const team = await prisma.hackathonTeam.create({
    data: {
      // Linked to the site account when the person registering is logged in
      accountId: await accountFromRequest(req),
      teamName: body.teamName,
      category: body.category,
      idea: body.idea,
      marketingConsent: body.marketingConsent,
      members: {create: body.members.map((m, i) => ({...m, position: i + 1}))},
    },
  });
  res.status(201).json({ok: true, id: team.id, teamName: team.teamName, members: body.members.length});
});

/** Dashboard: every team with its members. */
hackathonRouter.get('/', requireAuth, async (_req, res) => {
  res.json({
    teams: await prisma.hackathonTeam.findMany({orderBy: {id: 'desc'}, include: {members: {orderBy: {position: 'asc'}}}}),
  });
});

/** Dashboard: mark a team as paid / not paid. */
hackathonRouter.patch('/:id', requireAuth, async (req, res) => {
  const {paid} = z.object({paid: z.boolean()}).parse(req.body);
  const id = Number(req.params.id) || 0;
  const team = await prisma.hackathonTeam.update({where: {id}, data: {paid}}).catch(() => null);
  if (!team) throw new HttpError(404, 'Team not found.');
  res.json({ok: true});
});
