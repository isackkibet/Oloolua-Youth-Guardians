import { NextResponse, type NextRequest } from 'next/server';
import {
  SESSION_COOKIE,
  createSessionCookieValue,
  passwordAuthEnabled,
  registerPasswordUser,
  sessionCookieOptions,
} from '@backend/guardian/session';

const NAME_RE = /^[\p{L}][\p{L}\p{M} .'-]{1,59}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 128;

/** Create a member account. Sign-in is active immediately with all non-Admin capabilities. */
export async function POST(request: NextRequest) {
  if (!passwordAuthEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : '';
  if (!NAME_RE.test(name)) return NextResponse.json({ error: 'Enter your name (2 to 60 characters).' }, { status: 400 });
  if (email.length > 254 || !EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (password !== confirmPassword) return NextResponse.json({ error: 'The passwords do not match.' }, { status: 400 });
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json({ error: 'Choose a password between 10 and 128 characters.' }, { status: 400 });
  }

  try {
    const userId = await registerPasswordUser(name, email, password);
    if (!userId) return NextResponse.json({ error: 'Could not create the account. Try signing in or contact a Guardian Admin.' }, { status: 409 });
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, createSessionCookieValue(userId), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error('[guardian] member registration failed:', error);
    return NextResponse.json({ error: 'Guardian is temporarily unavailable.' }, { status: 503 });
  }
}
