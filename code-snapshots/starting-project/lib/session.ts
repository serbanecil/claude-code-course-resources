import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** For server components: redirects to / when unauthenticated. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect('/');
  return session;
}

/** For route handlers: returns the user id or null (caller responds 401). */
export async function getCurrentUserId(): Promise<string | null> {
  return (await getSession())?.user.id ?? null;
}
