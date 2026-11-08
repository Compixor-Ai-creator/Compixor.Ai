import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'compixor_admin_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || secret.trim() === '') {
    throw new Error('CRITICAL: ADMIN_PASSWORD environment variable is not set.');
  }
  return secret;
}

export function signAdminToken(): string {
  const secret = getSecret();
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac('sha256', secret).update(timestamp).digest('hex');
  return `${timestamp}.${signature}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [timestampStr, providedSignature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Session expired after 7 days
    if (Date.now() - timestamp > SESSION_MAX_AGE * 1000) return false;

    const secret = getSecret();
    const expectedSignature = crypto.createHmac('sha256', secret).update(timestampStr).digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(providedSignature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );
  } catch (err) {
    console.error('[AdminAuth Verify Exception]', err);
    return false;
  }
}

export function isAuthenticatedAdmin(): boolean {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    return verifyAdminToken(token);
  } catch {
    return false;
  }
}

export { COOKIE_NAME, SESSION_MAX_AGE };
