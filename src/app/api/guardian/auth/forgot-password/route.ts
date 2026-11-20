import { NextResponse, type NextRequest } from 'next/server';
import { passwordResetEmailConfigured } from '@backend/guardian/mail';
import { passwordAuthEnabled, requestPasswordReset } from '@backend/guardian/session';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  if (!passwordAuthEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!passwordResetEmailConfigured() && process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Password reset is not configured. Contact a Guardian Admin.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  let origin = process.env.GUARDIAN_APP_URL ?? request.headers.get('origin') ?? new URL(request.url).origin;
  try {
    origin = new URL(origin).origin;
  } catch {
    origin = new URL(request.url).origin;
  }

  try {
    const result = await requestPasswordReset(email, origin);
    return NextResponse.json({
      success: true,
      message: passwordResetEmailConfigured()
        ? 'If an account exists, a reset link has been sent to that email address.'
        : 'If an account exists, a reset link is ready below.',
      ...(result.devLink ? { devLink: result.devLink } : {}),
    });
  } catch (error) {
    console.error('[guardian] password reset request failed:', error);
    return NextResponse.json({ error: 'Could not send the reset link. Please try again.' }, { status: 503 });
  }
}
