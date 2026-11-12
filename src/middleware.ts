import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase();

  // Redirect old Vercel deployment domain to the canonical domain
  // (www <-> apex canonical redirect is handled in Vercel Domains settings to prevent loops)
  if (
    host === 'compixor-ai.vercel.app' ||
    host.endsWith('.compixor-ai.vercel.app')
  ) {
    const url = request.nextUrl.clone();
    url.protocol = 'https';
    url.host = 'compixor-ai.cloud';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const matcher = [
  /*
   * Match all request paths except internal static assets:
   * - _next/static (static files)
   * - _next/image (image optimization)
   * - favicon.ico (favicon file)
   */
  '/((?!_next/static|_next/image|favicon.ico).*)',
];
