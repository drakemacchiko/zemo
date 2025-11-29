import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Returns system health status for monitoring tools (Uptime Robot, Pingdom, etc.)
 * Checks:
 * - API responsiveness
 * - Database connectivity
 * - System timestamp
 */
export async function GET() {
  const startTime = Date.now();

  const checks = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: 'unknown' as 'connected' | 'disconnected' | 'unknown',
    responseTime: 0,
  };

  try {
    // Check database connection with timeout
    const dbCheck = await Promise.race([
      prisma.$queryRaw`SELECT 1 as result`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000)),
    ]);

    if (dbCheck) {
      checks.database = 'connected';
    }
  } catch (error) {
    console.error('Health check database error:', error);
    checks.database = 'disconnected';
  }

  checks.responseTime = Date.now() - startTime;

  // Return 503 if critical services are down
  if (checks.database === 'disconnected') {
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: 'Database connection failed',
        checks,
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      status: 'healthy',
      message: 'All systems operational',
      checks,
    },
    { status: 200 }
  );
}
