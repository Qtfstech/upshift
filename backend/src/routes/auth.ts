import {Router} from 'express';
import {z} from 'zod';
import {checkPassword, checkThrottle, clearFails, HttpError, recordFail, requireAuth, signToken} from '../auth.ts';
import {prisma} from '../db.ts';

export const authRouter = Router();

const loginBody = z.object({username: z.string().trim().min(1, 'Enter the username.'), password: z.string().min(1, 'Enter the password.')});

authRouter.post('/login', async (req, res) => {
  const {username, password} = loginBody.parse(req.body);
  const key = req.ip ?? 'unknown';
  checkThrottle(key);
  const admin = await prisma.admin.findUnique({where: {username}});
  if (!admin || !(await checkPassword(password, admin.passwordHash))) {
    recordFail(key);
    throw new HttpError(401, 'Incorrect username or password.');
  }
  clearFails(key);
  const updated = await prisma.admin.update({where: {id: admin.id}, data: {lastLoginAt: new Date()}});
  res.json({token: signToken(updated), username: updated.username});
});

/** Is this sign-in still good? */
authRouter.get('/me', requireAuth, async (_req, res) => {
  const admin = await prisma.admin.findFirstOrThrow();
  res.json({username: admin.username});
});
