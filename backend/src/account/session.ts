import type {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {HttpError} from '../auth.ts';
import {prisma} from '../db.ts';
import {env} from '../env.ts';

/**
 * The website login: a mobile number verified by OTP, kept as a 30-day token. The account is an arc_users row (it began
 * as the Winter Arc participant), so one login works on the main page, the Idea Challenge and the Hackathon.
 */

/** Kept as "arc" so tokens issued before the site-wide login keep working */
const AUDIENCE = 'arc';
export const signSession = (userId: number) => jwt.sign({sub: String(userId)}, env.JWT_SECRET, {audience: AUDIENCE, expiresIn: '30d'});

export interface AccountRequest extends Request {
  accountId?: number;
}

/** The signed-in account id from the Authorization header, or null (missing, expired, or the account was deleted). */
export async function accountFromRequest(req: Request): Promise<number | null> {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return null;
  try {
    const {sub} = jwt.verify(token, env.JWT_SECRET, {audience: AUDIENCE}) as {sub?: string};
    const user = sub ? await prisma.arcUser.findUnique({where: {id: Number(sub)}, select: {id: true}}) : null;
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/** Route guard: needs a signed-in account (sets req.accountId). */
export async function requireAccount(req: AccountRequest, _res: Response, next: NextFunction) {
  const id = await accountFromRequest(req);
  if (!id) throw new HttpError(401, 'Please sign in with your mobile number.');
  req.accountId = id;
  next();
}

export const PAGES = ['main', 'idea-challenge', 'hackathon'] as const;
export type Page = (typeof PAGES)[number];
export const pageOf = (v: unknown): Page => (PAGES.includes(v as Page) ? (v as Page) : 'main');

export const clientInfo = (req: Request) => ({ip: req.ip?.slice(0, 64) ?? null, userAgent: req.get('user-agent')?.slice(0, 255) ?? null});

/** Record a sign-in or sign-out in account_logins (and the last sign-in time on the account). */
export async function logLogin(userId: number, event: 'login' | 'logout', page: Page, req: Request) {
  await prisma.$transaction([
    prisma.accountLogin.create({data: {userId, event, page, ...clientInfo(req)}}),
    ...(event === 'login' ? [prisma.arcUser.update({where: {id: userId}, data: {lastLoginAt: new Date()}})] : []),
  ]);
}
