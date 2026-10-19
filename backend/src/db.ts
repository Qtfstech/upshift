import {PrismaMariaDb} from '@prisma/adapter-mariadb';
import {env} from './env.ts';
import {PrismaClient} from './generated/prisma/client.ts';

// Prisma 7 talks to MySQL through the mariadb driver (it works with MySQL 8).
const url = new URL(env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
  // MySQL 8's default sign-in method needs this over a plain local connection.
  allowPublicKeyRetrieval: true,
  connectionLimit: 5,
});

export const prisma = new PrismaClient({adapter});
