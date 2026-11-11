import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Lightweight uptime and health check probe for platform monitoring (BetterStack, Pingdom, UptimeRobot).
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'compixor-ai',
      environment: process.env.NODE_ENV || 'production',
      // Build identity: lets scripts/verify-deploy.sh prove which commit is
      // actually serving traffic, instead of guessing from cache headers.
      commit: process.env.NEXT_PUBLIC_BUILD_SHA || 'dev',
      buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || null,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
