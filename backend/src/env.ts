import 'dotenv/config';
import {z} from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().startsWith('mysql://', 'DATABASE_URL must look like mysql://user:password@host:3306/database'),
  PORT: z.coerce.number().int().default(4100),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('12h'),
  APPS_SCRIPT_URL: z.string().url(),
  APPS_SCRIPT_PASSWORD: z.string().min(1),
  SYNC_INTERVAL_MINUTES: z.coerce.number().min(1).default(5),
  ADMIN_USERNAME: z.string().trim().min(1, 'Set ADMIN_USERNAME (the dashboard login name)'),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD needs at least 8 characters'),
  /** "spear" = real SMS through Spear UC with our DLT template (we make and check the code); "console" = testing, no SMS */
  OTP_PROVIDER: z.enum(['console', 'spear']).default('console'),
  /** Spear UC API key (authKey, from the Spear UC dashboard). Needed when OTP_PROVIDER=spear. */
  SMS_API_KEY: z.string().trim().optional().transform((s) => s || undefined),
  /** DLT sender id (header) the OTP template is approved under */
  SMS_SENDER: z.string().trim().min(1).default('UPSHFT'),
  /** DLT template id of the OTP text (t_id in the Spear UC API) */
  SMS_TEMPLATE_ID: z.string().trim().regex(/^\d+$/, 'SMS_TEMPLATE_ID must be the numeric DLT template id').default('1777179189995473839'),
  /** Testing only: use this same 6-digit code for every number instead of a random one. Remove it once real SMS is set up. */
  OTP_FIXED_CODE: z
    .string()
    .regex(/^\d{6}$/, 'OTP_FIXED_CODE must be 6 digits')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  /** "true" makes the idea form confirm the mobile number with a code first */
  OTP_REQUIRED: z.enum(['true', 'false']).default('true').transform((v) => v === 'true'),
  /** Winter Arc: most entries the team can shortlist for the live Zoom discussion each day */
  ARC_SHORTLIST_PER_DAY: z.coerce.number().int().min(1).max(50).default(5),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid settings in backend/.env:');
  for (const issue of parsed.error.issues) console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  process.exit(1);
}
if (parsed.data.OTP_PROVIDER === 'spear' && !parsed.data.SMS_API_KEY) {
  console.error('OTP_PROVIDER=spear needs SMS_API_KEY in backend/.env (the Spear UC authKey).');
  process.exit(1);
}
if (parsed.data.DATABASE_URL.includes('YOUR_PASSWORD')) {
  console.error('Put your MySQL password in DATABASE_URL in backend/.env (it still says YOUR_PASSWORD).');
  process.exit(1);
}

export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
