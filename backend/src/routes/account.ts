import {Router} from 'express';
import {z} from 'zod';
import {accountFromRequest, clientInfo, logLogin, pageOf, requireAccount, signSession, type AccountRequest} from '../account/session.ts';
import {computePoints} from '../arc/points.ts';
import {categoryOf, loadDays} from '../arc/schedule.ts';
import {HttpError, requireAuth} from '../auth.ts';
import {prisma} from '../db.ts';
import {phoneFromToken} from '../otp.ts';

/**
 * The website login (main page, Idea Challenge, Hackathon): sign in with a verified mobile number, the signed-in
 * person's summary for the "My Upshift" section, and product-interest tracking.
 */
export const accountRouter = Router();

const firstName = (name: string) => name.trim().split(/\s+/)[0];

// ---- Simple per-key limits (in memory) ----
const HOUR = 60 * 60 * 1000;
const hits = new Map<string, number[]>();
function limit(key: string, max: number, message: string) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < HOUR);
  if (list.length >= max) throw new HttpError(429, message);
  list.push(now);
  hits.set(key, list);
}

/**
 * After OTP (POST /api/otp/verify): sign in. A new mobile number needs a name: the first call answers
 * {needsName: true}, and the second call with `name` creates the account.
 */
accountRouter.post('/login', async (req, res) => {
  const body = z
    .object({
      phoneToken: z.string(),
      name: z.string().trim().min(2, 'Name needs at least 2 characters.').max(60, 'Name can be at most 60 characters.').optional(),
      page: z.string().optional(),
    })
    .parse(req.body);
  const phone = phoneFromToken(body.phoneToken);
  let user = await prisma.arcUser.findUnique({where: {phone}, select: {id: true, name: true}});
  if (!user) {
    if (!body.name) return res.json({needsName: true});
    limit(`acct:${req.ip}`, 20, 'Too many sign-ups from this network. Please try again in an hour.');
    user = await prisma.arcUser.create({data: {phone, name: body.name}, select: {id: true, name: true}});
  }
  await logLogin(user.id, 'login', pageOf(body.page), req);
  res.json({token: signSession(user.id), name: user.name, firstName: firstName(user.name)});
});

accountRouter.post('/logout', requireAccount, async (req: AccountRequest, res) => {
  await logLogin(req.accountId!, 'logout', pageOf(req.body?.page), req);
  res.json({ok: true});
});

/** Everything the signed-in person has done on the site: ideas, evening Zoom calls, hackathon team, workshops clicked. */
accountRouter.get('/me', requireAccount, async (req: AccountRequest, res) => {
  const userId = req.accountId!;
  const user = await prisma.arcUser.findUniqueOrThrow({where: {id: userId}, select: {name: true, phone: true, createdAt: true}});
  const [entries, points, days, teamsByAccount, teamsByPhone, clicks] = await Promise.all([
    prisma.arcEntry.findMany({
      where: {userId},
      orderBy: {day: 'asc'},
      select: {day: true, code: true, title: true, shortlisted: true, zoomInvited: true, zoomAttended: true, result: {select: {rank: true, visibleFrom: true}}},
    }),
    computePoints(new Date(), userId),
    loadDays(),
    prisma.hackathonTeam.findMany({where: {accountId: userId}, select: {id: true}}),
    prisma.hackathonMember.findMany({where: {phone: user.phone}, select: {teamId: true}}),
    prisma.productClick.findMany({where: {userId}, orderBy: {createdAt: 'desc'}, take: 200}),
  ]);
  const now = new Date();

  // Hackathon: teams this account registered, or that list this mobile number as a member
  const teamIds = [...new Set([...teamsByAccount.map((t) => t.id), ...teamsByPhone.map((m) => m.teamId)])];
  const teams = await prisma.hackathonTeam.findMany({
    where: {id: {in: teamIds}},
    select: {id: true, teamName: true, category: true, paid: true, createdAt: true, _count: {select: {members: true}}},
  });

  // Workshops and products: one row per product, latest click first
  const products = new Map<string, {productKey: string; productName: string; price: number | null; actions: string[]; clicks: number; lastAt: Date}>();
  for (const c of clicks) {
    const p = products.get(c.productKey);
    if (p) {
      p.clicks++;
      if (!p.actions.includes(c.action)) p.actions.push(c.action);
    } else products.set(c.productKey, {productKey: c.productKey, productName: c.productName, price: c.price, actions: [c.action], clicks: 1, lastAt: c.createdAt});
  }

  const mine = points.get(userId);
  res.json({
    user: {name: user.name, firstName: firstName(user.name), phone: user.phone, since: user.createdAt},
    ideaChallenge: {
      points: mine?.points ?? 0,
      entries: entries.map((e) => {
        const published = e.result && e.result.visibleFrom <= now ? e.result.rank : null;
        return {day: e.day, category: categoryOf(e.day).name, code: e.code, title: e.title, rank: published};
      }),
    },
    // Evening Zoom discussions: shortlisted entries. Time and link only once the team has invited the person.
    zoomCalls: entries
      .filter((e) => e.shortlisted || e.zoomInvited)
      .map((e) => {
        const d = days[e.day - 1];
        return {
          day: e.day,
          category: d.category,
          title: e.title,
          invited: e.zoomInvited,
          attended: e.zoomAttended,
          time: e.zoomInvited ? d.zoomTime : null,
          link: e.zoomInvited ? d.zoomLink : null,
        };
      }),
    hackathon: teams.map((t) => ({id: t.id, teamName: t.teamName, category: t.category, paid: t.paid, members: t._count.members, registeredAt: t.createdAt})),
    products: [...products.values()],
  });
});

const PRODUCT_KEY = /^[a-z0-9:_-]{2,60}$/;

/** Product interest: a workshop "Reserve Seat", class, enquiry or payment click. Works logged out too (no user then). */
accountRouter.post('/track', async (req, res) => {
  const body = z
    .object({
      productKey: z.string().trim().toLowerCase().regex(PRODUCT_KEY),
      productName: z.string().trim().min(1).max(120),
      price: z.number().int().min(0).max(1_000_000).nullable().optional(),
      action: z.string().trim().min(1).max(30),
      page: z.string().optional(),
    })
    .parse(req.body);
  limit(`track:${req.ip}`, 300, 'Too many clicks. Please try again later.');
  await prisma.productClick.create({
    data: {
      userId: await accountFromRequest(req),
      productKey: body.productKey,
      productName: body.productName,
      price: body.price ?? null,
      action: body.action,
      page: pageOf(body.page),
      ...clientInfo(req),
    },
  });
  res.status(201).json({ok: true});
});

// ---------------------------------------------------------------- dashboard

/** Dashboard: accounts, the sign-in log and product interest. */
export const accountAdminRouter = Router();
accountAdminRouter.use(requireAuth);

accountAdminRouter.get('/', async (_req, res) => {
  const since = new Date(Date.now() - 7 * 24 * HOUR);
  const [accounts, active7d, logins, clicks, products, recentAccounts] = await Promise.all([
    prisma.arcUser.count(),
    prisma.arcUser.count({where: {lastLoginAt: {gte: since}}}),
    prisma.accountLogin.findMany({
      orderBy: {createdAt: 'desc'},
      take: 200,
      select: {id: true, event: true, page: true, ip: true, userAgent: true, createdAt: true, user: {select: {id: true, name: true, phone: true}}},
    }),
    prisma.productClick.findMany({
      orderBy: {createdAt: 'desc'},
      take: 200,
      select: {id: true, productKey: true, productName: true, price: true, action: true, page: true, createdAt: true, user: {select: {id: true, name: true, phone: true}}},
    }),
    prisma.productClick.groupBy({by: ['productKey', 'productName'], _count: {_all: true}, orderBy: {_count: {productKey: 'desc'}}}),
    prisma.arcUser.findMany({
      orderBy: {createdAt: 'desc'},
      take: 100,
      select: {id: true, name: true, phone: true, createdAt: true, lastLoginAt: true, _count: {select: {entries: true, productClicks: true, hackathonTeams: true}}},
    }),
  ]);
  // Logged-in people per product
  const signedIn = await prisma.productClick.groupBy({by: ['productKey'], where: {userId: {not: null}}, _count: {_all: true}});
  res.json({
    accounts,
    active7d,
    products: products.map((p) => ({
      productKey: p.productKey,
      productName: p.productName,
      clicks: p._count._all,
      signedInClicks: signedIn.find((s) => s.productKey === p.productKey)?._count._all ?? 0,
    })),
    logins,
    clicks,
    recentAccounts,
  });
});
