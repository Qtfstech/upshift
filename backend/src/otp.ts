import {createHmac, randomInt, timingSafeEqual} from 'node:crypto';
import jwt from 'jsonwebtoken';
import {HttpError} from './auth.ts';
import {prisma} from './db.ts';
import {env} from './env.ts';

/**
 * Mobile number check with a one-time code. OTP_PROVIDER decides who makes and checks the code:
 *  - "spear": we make the code and Spear UC (login4.spearuc.com) delivers it by SMS from sender SMS_SENDER
 *    (UPSHFT) with our DLT-approved template (OTP_SMS_TEXT below). Needs SMS_API_KEY.
 *  - "console": nothing is sent (free, for testing). The code is printed in the backend terminal and returned to the
 *    browser as `devCode`, which the page logs in the browser console. Never use it with real users.
 * Either way we keep only a hash of the code and check it ourselves.
 * Our own limits (resend wait, codes per hour, 5 wrong tries, 5-minute expiry) apply to both.
 */

const OTP_TTL_MIN = 5;
const MAX_ATTEMPTS = 5;
const RESEND_AFTER_S = 30;
const PER_PHONE_PER_HOUR = 5;
const PER_IP_PER_HOUR = 15;
const HOUR = 60 * 60 * 1000;
/** How long a confirmed number stays confirmed for sending the form */
const VERIFIED_FOR = '6h';
const AUDIENCE = 'phone-verified';

/** "+91 98765-43210" → "9876543210"; null when it isn't an Indian mobile number. */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/[\s\-()]/g, '').replace(/^\+?91(?=\d{10}$)/, '');
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

const hashCode = (phone: string, code: string) => createHmac('sha256', env.JWT_SECRET).update(`${phone}:${code}`).digest('hex');

// ---------------------------------------------------------------- Spear UC (https://login4.spearuc.com)

const SPEAR = 'https://login4.spearuc.com/MOBILE_APPS_API/sms_api.php';

/**
 * The DLT-approved template (SMS_TEMPLATE_ID, sender UPSHFT) with {#var#} filled in.
 * Spear UC rejects any text that doesn't match it word for word, so change it only together with the template.
 */
const OTP_SMS_TEXT = (code: string) => `Welcome to Upshift India! Thanks for registering with us. Your verification code is ${code}.`;

/** Sends our code by SMS through Spear UC. Returns its campaign id. */
async function spearSend(phone: string, code: string) {
  if (!env.SMS_API_KEY) throw new HttpError(500, 'SMS service is not set up (SMS_API_KEY).');
  const url = new URL(SPEAR);
  url.search = new URLSearchParams({
    type: 'smsquicksend',
    authKey: env.SMS_API_KEY,
    sender: env.SMS_SENDER,
    to_mobileno: phone,
    sms_text: OTP_SMS_TEXT(code),
    t_id: env.SMS_TEMPLATE_ID,
  }).toString();
  let body: {status?: string; Message?: string; campaign_id?: string} | null = null;
  try {
    const res = await fetch(url, {signal: AbortSignal.timeout(10_000)});
    body = await res.json().catch(() => null);
  } catch (e) {
    console.error('[otp] Spear UC request failed:', e instanceof Error ? e.message : e); // never log the URL: it has the key
    throw new HttpError(502, "Couldn't reach the SMS service. Please try again in a minute.");
  }
  // The live API says "success"; its documentation spells it "sucess"
  if (body?.status === 'success' || body?.status === 'sucess') return String(body.campaign_id ?? '');
  console.error('[otp] Spear UC could not send:', body?.Message ?? 'Unknown error');
  throw new HttpError(502, "We couldn't send the SMS. Check the number and try again.");
}

// ---------------------------------------------------------------- send and verify

export async function sendOtp(phone: string, ip: string) {
  const since = new Date(Date.now() - HOUR);
  const [last, phoneCount, ipCount] = await Promise.all([
    prisma.otpCode.findFirst({where: {phone}, orderBy: {id: 'desc'}, select: {createdAt: true}}),
    prisma.otpCode.count({where: {phone, createdAt: {gte: since}}}),
    prisma.otpCode.count({where: {ip, createdAt: {gte: since}}}),
  ]);
  const wait = last ? Math.ceil(RESEND_AFTER_S - (Date.now() - last.createdAt.getTime()) / 1000) : 0;
  if (wait > 0) throw new HttpError(429, `Please wait ${wait} seconds before asking for a new code.`);
  if (phoneCount >= PER_PHONE_PER_HOUR || ipCount >= PER_IP_PER_HOUR) throw new HttpError(429, 'Too many codes requested. Please try again in an hour.');

  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
  let devCode: string | undefined;
  let data: {codeHash: string; providerRef?: string};
  if (env.OTP_PROVIDER === 'spear') {
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    data = {codeHash: hashCode(phone, code), providerRef: await spearSend(phone, code)};
  } else {
    // OTP_FIXED_CODE (testing): every number gets the same code
    const code = env.OTP_FIXED_CODE ?? String(randomInt(0, 1_000_000)).padStart(6, '0');
    console.log(`\n[otp] Code for +91 ${phone}: ${code}  (valid ${OTP_TTL_MIN} min; console mode, no SMS sent)\n`);
    data = {codeHash: hashCode(phone, code)};
    devCode = code;
  }
  // A new code replaces any older one still waiting
  await prisma.otpCode.updateMany({where: {phone, usedAt: null}, data: {usedAt: new Date()}});
  await prisma.otpCode.create({data: {phone, ip, expiresAt, ...data}});
  // Old codes aren't needed after a day
  prisma.otpCode.deleteMany({where: {createdAt: {lt: new Date(Date.now() - 24 * HOUR)}}}).catch(() => {});
  return {expiresInSeconds: OTP_TTL_MIN * 60, resendInSeconds: RESEND_AFTER_S, ...(devCode && {devCode})};
}

/** Checks the code; on success returns a short-lived token that proves the number was confirmed. */
export async function verifyOtp(phone: string, code: string) {
  const otp = await prisma.otpCode.findFirst({where: {phone, usedAt: null}, orderBy: {id: 'desc'}});
  if (!otp || otp.expiresAt < new Date()) throw new HttpError(400, 'This code has expired or was already used. Please ask for a new one.');
  if (otp.attempts >= MAX_ATTEMPTS) throw new HttpError(429, 'Too many wrong tries. Please ask for a new code.');

  // Codes sent by the old AUTOGEN setup have no hash: ask for a new one
  const result: 'ok' | 'wrong' | 'expired' = !otp.codeHash
    ? 'expired'
    : timingSafeEqual(Buffer.from(otp.codeHash, 'hex'), Buffer.from(hashCode(phone, code), 'hex'))
      ? 'ok'
      : 'wrong';

  if (result === 'expired') {
    await prisma.otpCode.update({where: {id: otp.id}, data: {usedAt: new Date()}});
    throw new HttpError(400, 'This code has expired. Please ask for a new one.');
  }
  if (result === 'wrong') {
    await prisma.otpCode.update({where: {id: otp.id}, data: {attempts: {increment: 1}}});
    const left = MAX_ATTEMPTS - otp.attempts - 1;
    throw new HttpError(400, left > 0 ? `That code isn't right. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong tries. Please ask for a new code.');
  }
  await prisma.otpCode.update({where: {id: otp.id}, data: {usedAt: new Date()}});
  return jwt.sign({phone}, env.JWT_SECRET, {audience: AUDIENCE, expiresIn: VERIFIED_FOR});
}

/** The phone number inside a token from verifyOtp, or an error if it's missing, expired or for another number. */
export function checkPhoneToken(token: string | undefined, phone: string) {
  if (!token) throw new HttpError(400, 'Please verify your mobile number first.');
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {audience: AUDIENCE}) as {phone?: string};
    if (payload.phone === phone) return;
  } catch {
    throw new HttpError(400, 'Your mobile verification has expired. Please verify the number again.');
  }
  throw new HttpError(400, 'Please verify this mobile number (it changed after verification).');
}

/** The phone number inside a token from verifyOtp, or an error if it's missing or expired. */
export function phoneFromToken(token: string | undefined) {
  if (!token) throw new HttpError(401, 'Please verify your mobile number first.');
  try {
    const {phone} = jwt.verify(token, env.JWT_SECRET, {audience: AUDIENCE}) as {phone?: string};
    if (phone) return phone;
  } catch {
    /* fall through */
  }
  throw new HttpError(401, 'Your mobile verification has expired. Please verify the number again.');
}
