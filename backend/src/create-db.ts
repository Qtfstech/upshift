// `npm run db:setup` step 1: create the MySQL database named in DATABASE_URL if it isn't there yet.
import mariadb from 'mariadb';
import {env} from './env.ts';

const url = new URL(env.DATABASE_URL);
const name = url.pathname.replace(/^\//, '');
if (!/^[A-Za-z0-9_]+$/.test(name)) throw new Error(`Unexpected database name "${name}" in DATABASE_URL.`);

const conn = await mariadb.createConnection({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  allowPublicKeyRetrieval: true,
});
try {
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`Database "${name}" is ready.`);
} finally {
  await conn.end();
}
