import { NextResponse, type NextRequest } from 'next/server';
import { passwordAuthEnabled, resetPassword } from '@backend/guardian/session';

const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 128;

export async function POST(request: NextRequest) {
  if (!passwordAuthEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : '';

  if (token.length < 20 || token.length > 200) {
    return NextResponse.json({ error: 'This reset link is invalid.' }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'The passwords do not match.' }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json({ error: 'Choose a password between 10 and 128 characters.' }, { status: 400 });
  }

  try {
    const ok = await resetPassword(token, password);
    if (!ok) return NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 });
    return NextResponse.json({ success: true, message: 'Password updated. Sign in with your new password.' });
  } catch (error) {
    console.error('[guardian] password reset failed:', error);
    return NextResponse.json({ error: 'Could not update the password. Please try again.' }, { status: 503 });
  }
}
