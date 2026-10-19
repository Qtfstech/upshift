import {Router} from 'express';
import {z} from 'zod';
import {normalizePhone, sendOtp, verifyOtp} from '../otp.ts';

/** Confirm a mobile number with a one-time code (used by the Idea Challenge form). No sign-in needed. */
export const otpRouter = Router();

const phone = z
  .string()
  .transform((s) => normalizePhone(s))
  .pipe(z.string({message: 'Enter a valid 10-digit mobile number.'}));

otpRouter.post('/send', async (req, res) => {
  const body = z.object({phone}).parse(req.body);
  res.json({ok: true, ...(await sendOtp(body.phone, req.ip ?? 'unknown'))});
});

otpRouter.post('/verify', async (req, res) => {
  const body = z.object({phone, code: z.string().trim().regex(/^\d{4,6}$/, 'Enter the code from the SMS.')}).parse(req.body);
  res.json({ok: true, phoneToken: await verifyOtp(body.phone, body.code)});
});
