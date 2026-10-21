import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { getDb } from './db';

// Fail fast instead of deriving the origin from request headers or using a default secret.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set (see .env.example)`);
  return value;
}

const baseURL = requireEnv('BETTER_AUTH_URL');

export const auth = betterAuth({
  baseURL,
  secret: requireEnv('BETTER_AUTH_SECRET'),
  trustedOrigins: [baseURL],
  database: getDb(),
  emailAndPassword: { enabled: true },
  plugins: [nextCookies()], // must be last
});
