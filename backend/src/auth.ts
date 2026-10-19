import bcrypt from 'bcryptjs';
import type {NextFunction, Request, Response} from 'express';
import jwt, {type SignOptions} from 'jsonwebtoken';
import {prisma} from './db.ts';
import {env} from './env.ts';
import type {Admin} from './generated/prisma/client.ts';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const checkPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

/**
 * The one admin login lives in the `admins` table, kept in step with ADMIN_USERNAME / ADMIN_PASSWORD in .env:
 * change them there and restart, and the old password stops working (existing sign-ins end too).
 */
export async function syncAdmin() {
  const admin = await prisma.admin.findFirst({orderBy: {id: 'asc'}});
  if (!admin) {
    await prisma.admin.create({data: {username: env.ADMIN_USERNAME, passwordHash: await bcrypt.hash(env.ADMIN_PASSWORD, 12)}});
    console.log(`[admin] Created the dashboard login "${env.ADMIN_USERNAME}".`);
    return;
  }
  const samePassword = await bcrypt.compare(env.ADMIN_PASSWORD, admin.passwordHash);
  if (admin.username !== env.ADMIN_USERNAME || !samePassword) {
    await prisma.admin.update({
      where: {id: admin.id},
      data: {
        username: env.ADMIN_USERNAME,
        ...(samePassword ? {} : {passwordHash: await bcrypt.hash(env.ADMIN_PASSWORD, 12), tokenVersion: {increment: 1}}),
      },
    });
    console.log(`[admin] Updated the dashboard login from .env.`);
  }
  await prisma.admin.deleteMany({where: {id: {not: admin.id}}}); // only ever one login
}

/** `v` is the admin's tokenVersion: changing the password bumps it, which ends older sign-ins. */
export const signToken = (a: Admin) => jwt.sign({sub: String(a.id), v: a.tokenVersion}, env.JWT_SECRET, {expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn']});

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new HttpError(401, 'Please sign in.');
  let payload: {sub?: string; v?: number};
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as typeof payload;
  } catch {
    throw new HttpError(401, 'Your sign-in has expired. Please sign in again.');
  }
  const admin = await prisma.admin.findUnique({where: {id: Number(payload.sub)}});
  if (!admin || admin.tokenVersion !== payload.v) throw new HttpError(401, 'The password has changed. Please sign in again.');
  next();
}

// ---- Sign-in throttling: 10 failed attempts per IP in 15 minutes, then a 15-minute pause ----

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 10;
const fails = new Map<string, {count: number; first: number}>();

export function checkThrottle(key: string) {
  const f = fails.get(key);
  if (!f) return;
  if (Date.now() - f.first > WINDOW_MS) fails.delete(key);
  else if (f.count >= MAX_FAILS) throw new HttpError(429, 'Too many failed sign-ins. Try again in 15 minutes.');
}

export function recordFail(key: string) {
  const f = fails.get(key);
  if (!f || Date.now() - f.first > WINDOW_MS) fails.set(key, {count: 1, first: Date.now()});
  else f.count++;
}

export const clearFails = (key: string) => fails.delete(key);
