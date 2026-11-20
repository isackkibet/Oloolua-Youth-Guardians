/**
 * Guardian sessions and identity (PRD B2). Server-only.
 *
 * Authentication is not authorization: a valid session only says who the
 * user is. Their Hub membership and role are read from the database on every
 * request, so a role change or suspension takes effect immediately.
 */

import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { sql } from '@backend/db';
import { passwordResetEmailConfigured, sendPasswordResetEmail } from './mail';
import { ensureGuardianSchema, HUB_ID } from './schema';
import type { Role } from '@shared/guardian/constants';

export const SESSION_COOKIE = 'guardian_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const REMEMBER_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export function sessionTtlSeconds(remember = false): number {
  return remember ? REMEMBER_SESSION_TTL_SECONDS : SESSION_TTL_SECONDS;
}

export interface Viewer {
  user: { id: string; name: string; email: string | null };
  hubId: string;
  role: Role | null;
  membershipStatus: 'active' | 'pending' | 'suspended' | 'none';
}

let ephemeralDevelopmentSecret: Buffer | null = null;

function secret(): Buffer | null {
  const s = process.env.GUARDIAN_SESSION_SECRET ?? '';
  if (s.length >= 32) return createHash('sha256').update(`guardian-session|${s}`).digest();
  if (!s && process.env.NODE_ENV === 'development') {
    ephemeralDevelopmentSecret ??= randomBytes(32);
    return ephemeralDevelopmentSecret;
  }
  return null;
}

/** Email/password sign-in works without Google or Privy. */
export function passwordAuthEnabled(): boolean {
  return process.env.GUARDIAN_PASSWORD_AUTH !== 'false' && !!secret();
}

/** Sign-in is configured when session signing and at least one provider are available. */
export function authConfigured(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!secret()) missing.push('GUARDIAN_SESSION_SECRET (32+ characters)');
  const privy = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID && !!process.env.PRIVY_APP_SECRET;
  if (!privy && process.env.GUARDIAN_PASSWORD_AUTH === 'false') {
    missing.push('GUARDIAN_PASSWORD_AUTH=true or Privy credentials');
  }
  return { ok: missing.length === 0 || devLoginEnabled(), missing };
}

/** Local testing only: never available in a production build. */
export function devLoginEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.GUARDIAN_DEV_LOGIN === 'true' && !!secret();
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Signs any small JSON payload: base64url(json).hmac */
export function signPayload(payload: object): string {
  const key = secret();
  if (!key) throw new Error('GUARDIAN_SESSION_SECRET is not configured');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${createHmac('sha256', key).update(body).digest('base64url')}`;
}

export function verifyPayload<T extends { exp: number }>(token: string | undefined): T | null {
  const key = secret();
  if (!key || !token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  if (!safeEqual(sig, createHmac('sha256', key).update(body).digest('base64url'))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T;
    return typeof data.exp === 'number' && data.exp > Math.floor(Date.now() / 1000) ? data : null;
  } catch {
    return null;
  }
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function createSessionCookieValue(userId: string, ttlSeconds = SESSION_TTL_SECONDS): string {
  return signPayload({ uid: userId, exp: Math.floor(Date.now() / 1000) + ttlSeconds });
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export async function getViewer(request: NextRequest): Promise<Viewer | null> {
  const session = verifyPayload<{ uid: string; exp: number }>(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  await ensureGuardianSchema();
  const rows = (await sql`
    SELECT u.id, u.name, u.email, u.auth_sub, u.status AS user_status, m.role, m.status AS membership_status
    FROM guardian_users u
    LEFT JOIN guardian_memberships m ON m.user_id = u.id AND m.hub_id = ${HUB_ID}
    WHERE u.id = ${session.uid}
  `) as { id: string; name: string; email: string | null; auth_sub: string | null; user_status: string; role: Role | null; membership_status: string | null }[];
  const row = rows[0];
  if (!row || row.user_status === 'suspended') return null;
  // Legacy visitor sessions are no longer accepted.
  if (row.auth_sub?.startsWith('guest:')) return null;
  const membershipStatus = (row.membership_status ?? 'none') as Viewer['membershipStatus'];
  return {
    user: { id: row.id, name: row.name, email: row.email },
    hubId: HUB_ID,
    role: membershipStatus === 'active' ? row.role : null,
    membershipStatus,
  };
}

function adminEmails(): Set<string> {
  return new Set(
    (process.env.GUARDIAN_ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Only the owner listed in GUARDIAN_ADMIN_EMAILS may grant the Admin role. */
export function isOwnerEmail(email: string | null | undefined): boolean {
  return !!email && adminEmails().has(email.toLowerCase());
}

/**
 * Finds or creates the user for a verified identity, links a seeded team
 * member when an Admin has set their email, and applies the access policy:
 * listed admin emails become Admin; everyone else becomes an active Keeper
 * immediately, with every non-Admin capability. No approval queue.
 */
export async function upsertSignedInUser(identity: { sub: string; email: string; name: string }): Promise<string> {
  await ensureGuardianSchema();
  const email = identity.email.toLowerCase();
  const name = identity.name.slice(0, 120) || email;

  let rows = (await sql`
    UPDATE guardian_users SET email = ${email}, last_login_at = now()
    WHERE auth_sub = ${identity.sub} RETURNING id
  `) as { id: string }[];

  if (rows.length === 0) {
    // A team member seeded by name (B4) whose email an Admin has added.
    rows = (await sql`
      UPDATE guardian_users SET auth_sub = ${identity.sub}, status = 'active', last_login_at = now()
      WHERE auth_sub IS NULL AND lower(email) = ${email} RETURNING id
    `) as { id: string }[];
  }
  if (rows.length === 0) {
    rows = (await sql`
      INSERT INTO guardian_users (auth_sub, email, name, last_login_at)
      VALUES (${identity.sub}, ${email}, ${name}, now()) RETURNING id
    `) as { id: string }[];
  }
  const userId = rows[0].id;

  if (adminEmails().has(email)) {
    await sql`INSERT INTO guardian_memberships (user_id, hub_id, role, status) VALUES (${userId}, ${HUB_ID}, 'admin', 'active')
      ON CONFLICT (user_id, hub_id) DO UPDATE SET role = 'admin', status = 'active', updated_at = now()`;
  } else {
    await sql`INSERT INTO guardian_memberships (user_id, hub_id, role, status)
      VALUES (${userId}, ${HUB_ID}, 'keeper', 'active')
      ON CONFLICT (user_id, hub_id) DO UPDATE SET role = 'keeper', status = 'active', updated_at = now()
      WHERE guardian_memberships.status = 'pending'`;
  }
  return userId;
}

const PASSWORD_KEY_BYTES = 64;
const DUMMY_PASSWORD_SALT = Buffer.from('guardian-password-login-dummy-v1');

function derivePassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, PASSWORD_KEY_BYTES, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derivePassword(password, salt);
  return `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  const [scheme, saltText, keyText] = stored?.split('$') ?? [];
  if (scheme !== 'scrypt' || !saltText || !keyText) {
    await derivePassword(password, DUMMY_PASSWORD_SALT);
    return false;
  }
  const salt = Buffer.from(saltText, 'base64url');
  const expected = Buffer.from(keyText, 'base64url');
  if (salt.length !== 16 || expected.length !== PASSWORD_KEY_BYTES) {
    await derivePassword(password, DUMMY_PASSWORD_SALT);
    return false;
  }
  const actual = await derivePassword(password, salt);
  return timingSafeEqual(actual, expected);
}

/** Creates an email/password member with the same access policy as verified sign-ins. */
export async function registerPasswordUser(name: string, email: string, password: string): Promise<string | null> {
  const [, passwordHash] = await Promise.all([ensureGuardianSchema(), hashPassword(password)]);
  const cleanEmail = email.toLowerCase();
  const rows = (await sql`
    INSERT INTO guardian_users (email, name, password_hash, last_login_at)
    VALUES (${cleanEmail}, ${name.slice(0, 120)}, ${passwordHash}, now())
    ON CONFLICT DO NOTHING RETURNING id
  `) as { id: string }[];
  if (!rows[0]) return null;
  const isAdmin = adminEmails().has(cleanEmail);
  const role: Role = isAdmin ? 'admin' : 'keeper';
  await sql`INSERT INTO guardian_memberships (user_id, hub_id, role, status)
    VALUES (${rows[0].id}, ${HUB_ID}, ${role}, 'active')`;
  return rows[0].id;
}

/** Verifies a password and records a successful login without revealing whether an email exists. */
export async function authenticatePassword(email: string, password: string): Promise<string | null> {
  await ensureGuardianSchema();
  const rows = (await sql`
    SELECT id, email, password_hash FROM guardian_users WHERE lower(email) = ${email.toLowerCase()} LIMIT 1
  `) as { id: string; email: string | null; password_hash: string | null }[];
  const row = rows[0];
  if (!await verifyPassword(password, row?.password_hash ?? null)) return null;
  await sql`UPDATE guardian_users SET last_login_at = now() WHERE id = ${row!.id}`;
  if (adminEmails().has((row.email ?? '').toLowerCase())) {
    await sql`INSERT INTO guardian_memberships (user_id, hub_id, role, status)
      VALUES (${row.id}, ${HUB_ID}, 'admin', 'active')
      ON CONFLICT (user_id, hub_id) DO UPDATE SET role = 'admin', status = 'active', updated_at = now()`;
  } else {
    await sql`UPDATE guardian_memberships SET role = 'keeper', status = 'active', updated_at = now()
      WHERE user_id = ${row.id} AND hub_id = ${HUB_ID} AND status = 'pending'`;
  }
  return row!.id;
}

function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}

/** Creates a single-use reset link. The response never reveals whether the email exists. */
export async function requestPasswordReset(email: string, origin: string): Promise<{ sent: boolean; devLink?: string }> {
  await ensureGuardianSchema();
  const rows = await sql`
    SELECT id, email FROM guardian_users
    WHERE lower(email) = ${email.toLowerCase()} AND password_hash IS NOT NULL LIMIT 1
  ` as { id: string; email: string | null }[];
  const row = rows[0];
  if (!row?.email) return { sent: false };

  const token = randomBytes(32).toString('base64url');
  await sql`UPDATE guardian_password_resets SET used_at = now() WHERE user_id = ${row.id} AND used_at IS NULL`;
  await sql`
    INSERT INTO guardian_password_resets (user_id, token_hash, expires_at)
    VALUES (${row.id}, ${hashResetToken(token)}, now() + interval '30 minutes')
  `;
  const link = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
  if (passwordResetEmailConfigured()) {
    await sendPasswordResetEmail(row.email, link);
    return { sent: true };
  }
  if (process.env.NODE_ENV === 'development') return { sent: false, devLink: link };
  return { sent: false };
}

/** Consumes a valid reset token and replaces the member's password hash. */
export async function resetPassword(token: string, password: string): Promise<boolean> {
  await ensureGuardianSchema();
  const passwordHash = await hashPassword(password);
  const rows = await sql`
    UPDATE guardian_password_resets SET used_at = now()
    WHERE token_hash = ${hashResetToken(token)} AND used_at IS NULL AND expires_at > now()
    RETURNING user_id
  ` as { user_id: string }[];
  const userId = rows[0]?.user_id;
  if (!userId) return false;
  await sql`UPDATE guardian_users SET password_hash = ${passwordHash} WHERE id = ${userId}`;
  await sql`UPDATE guardian_password_resets SET used_at = now() WHERE user_id = ${userId} AND used_at IS NULL`;
  return true;
}
