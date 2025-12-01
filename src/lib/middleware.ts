import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, checkRateLimit } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
  };
}

// Rate limiting middleware
export function withRateLimit(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  return (handler: (req: NextRequest) => Promise<Response>) => {
    return async (req: NextRequest): Promise<Response> => {
      const identifier = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

      if (!checkRateLimit(identifier, maxAttempts, windowMs)) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }

      return handler(req);
    };
  };
}

// Authentication middleware
// Extract token from request headers or cookies
function extractTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Fall back to cookie
  const cookieToken = request.cookies.get('accessToken')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  return null;
}

export function withAuth(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<Response>,
  options: { requireAuth?: boolean } = { requireAuth: true }
) {
  return async (req: NextRequest, context?: any): Promise<Response> => {
    const token = extractTokenFromRequest(req);
    const authenticatedReq = req as AuthenticatedRequest;

    if (!token) {
      if (options.requireAuth) {
        return NextResponse.json({ error: 'Access token required' }, { status: 401 });
      }
      // Optional auth - continue without user
      return handler(authenticatedReq, context);
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      if (options.requireAuth) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      // Optional auth - invalid token, continue without user
      return handler(authenticatedReq, context);
    }

    // Verify user exists in database (retry once on common prepared-statement errors)
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true },
      });
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('prepared statement') || msg.includes('prepared statements')) {
        // Attempt to reset the Prisma client and retry once
        try {
          const { resetPrismaClient } = await import('./db');
          await resetPrismaClient();
          user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true },
          });
        } catch (innerErr) {
          console.error('Prisma reconnection attempt failed:', innerErr);
          throw err;
        }
      } else {
        throw err;
      }
    }

    if (!user) {
      if (options.requireAuth) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }
      // Optional auth - user not found, continue without user
      return handler(authenticatedReq, context);
    }

    // Add user to request object
    authenticatedReq.user = user;

    return handler(authenticatedReq, context);
  };
}

// Combined middleware for auth endpoints
export function withAuthAndRateLimit(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return withRateLimit()(withAuth(handler));
}
