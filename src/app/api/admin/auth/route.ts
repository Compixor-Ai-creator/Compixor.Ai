import { NextResponse } from 'next/server';
import { signAdminToken, verifyAdminToken, COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  const token = match ? decodeURIComponent(match[1]) : null;

  const authenticated = verifyAdminToken(token);
  return NextResponse.json({ authenticated });
}

export async function POST(request: Request) {
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

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Incorrect administrative password.' }, { status: 401 });
  }

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
