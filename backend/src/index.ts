import dns from 'node:dns';
import {app} from './app.ts';
import {prisma} from './db.ts';
import {env} from './env.ts';
import {syncAdmin} from './auth.ts';
import {startSyncTimer} from './sync.ts';
import {loadStartDate} from './arc/schedule.ts';

// Prefer IPv4: servers without working IPv6 otherwise hang on hosts that also have an IPv6 address
// (Spear UC's SMS API, and "localhost" → ::1 when MySQL listens only on 127.0.0.1).
dns.setDefaultResultOrder('ipv4first');

async function main() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    console.error('Could not connect to MySQL. Check DATABASE_URL in backend/.env and that the database exists (npm run db:setup).');
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
  await syncAdmin();
  await loadStartDate();
  app.listen(env.PORT, () => console.log(`Upshift dashboard API on http://localhost:${env.PORT}`));
  startSyncTimer();
}

main();

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
