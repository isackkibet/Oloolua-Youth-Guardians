import { NextResponse, type NextRequest } from 'next/server';
import {
  SESSION_COOKIE,
  authenticatePassword,
  createSessionCookieValue,
  passwordAuthEnabled,
  sessionCookieOptions,
  sessionTtlSeconds,
} from '@backend/guardian/session';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Sign in an existing email/password member. */
export async function POST(request: NextRequest) {
  if (!passwordAuthEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const remember = body?.remember === true;
  if (email.length > 254 || !EMAIL_RE.test(email) || password.length === 0 || password.length > 128) {
    return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
  }

  try {
    const userId = await authenticatePassword(email, password);
    if (!userId) return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    const ttl = sessionTtlSeconds(remember);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, createSessionCookieValue(userId, ttl), sessionCookieOptions(ttl));
    return response;
  } catch (error) {
    console.error('[guardian] member sign-in failed:', error);
    return NextResponse.json({ error: 'Guardian is temporarily unavailable.' }, { status: 503 });
  }
}
