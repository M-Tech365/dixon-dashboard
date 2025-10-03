import { cookies } from 'next/headers';

const SESSION_COOKIE = 'dixon_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-change-in-production';
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'dixon2025';

export async function createSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === SESSION_SECRET;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function verifyPassword(password: string): boolean {
  return password === DASHBOARD_PASSWORD;
}
