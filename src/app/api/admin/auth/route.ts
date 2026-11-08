import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { signAdminToken, verifyAdminToken, COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory IP-based rate limiter (5 failed attempts per 15 min per IP)
const loginAttempts = new Map<string, RateLimitRecord>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (record.count >= 5) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
  } else {
    record.count += 1;
  }
}

function clearRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  const token = match ? decodeURIComponent(match[1]) : null;

  const authenticated = verifyAdminToken(token);
  return NextResponse.json({ authenticated });
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const { allowed, retryAfterSeconds } = checkRateLimit(clientIp);

  if (!allowed) {
    return NextResponse.json(
      { error: `Too many failed login attempts. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.` },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const { password } = body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD environment variable is not configured on the server.' },
      { status: 500 }
    );
  }

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
  }

  // Timing-safe comparison using SHA-256 buffers of identical byte length
  const inputHash = crypto.createHash('sha256').update(password).digest();
  const targetHash = crypto.createHash('sha256').update(adminPassword).digest();

  if (!crypto.timingSafeEqual(inputHash, targetHash)) {
    recordFailedAttempt(clientIp);
    return NextResponse.json({ error: 'Incorrect administrative password.' }, { status: 401 });
  }

  // Clear failed attempts upon successful login
  clearRateLimit(clientIp);

  const token = signAdminToken();
  const response = NextResponse.json({ success: true, message: 'Authentication successful.' });

  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
