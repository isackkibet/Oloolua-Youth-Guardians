import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, authConfigured, devLoginEnabled, getViewer, passwordAuthEnabled, sessionCookieOptions } from '@backend/guardian/session';
import { getQuota } from '@backend/guardian/quota';
import { aiConfigured } from '@backend/guardian/llm';
import { privyConfigured } from '@backend/guardian/privy';

/** Who is signed in, their role and prompt allowance. */
export async function GET(request: NextRequest) {
  const config = authConfigured();
  const base = {
    authConfigured: config.ok,
    authConfigMissing: config.missing,
    devLogin: devLoginEnabled(),
    aiEnabled: aiConfigured(),
    privy: privyConfigured(),
    passwordAuth: passwordAuthEnabled(),
  };
  try {
    const viewer = await getViewer(request);
    if (!viewer) return NextResponse.json({ ...base, signedIn: false });
    const quota = viewer.role ? await getQuota(viewer.user.id, viewer.role) : null;
    return NextResponse.json({ ...base, signedIn: true, user: viewer.user, role: viewer.role, membershipStatus: viewer.membershipStatus, quota });
  } catch (error) {
    console.error('[guardian] session lookup failed:', error);
    return NextResponse.json({ ...base, signedIn: false, error: 'Guardian is temporarily unavailable.' }, { status: 503 });
  }
}

/** Sign out. */
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0));
  return res;
}
