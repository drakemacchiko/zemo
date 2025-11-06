import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, checkRateLimit } from '@/lib/auth'
import { prisma } from '@/lib/db'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
  }
}

// Rate limiting middleware
export function withRateLimit(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  return (handler: (req: NextRequest) => Promise<Response>) => {
    return async (req: NextRequest): Promise<Response> => {
      const identifier = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
      
      if (!checkRateLimit(identifier, maxAttempts, windowMs)) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
      
      return handler(req)
    }
  }
}

// Authentication middleware
// Extract token from request headers
function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>,
  options: { requireAuth?: boolean } = { requireAuth: true }
) {
  return async (req: NextRequest): Promise<Response> => {
    const token = extractTokenFromRequest(req)
    const authenticatedReq = req as AuthenticatedRequest
    
    if (!token) {
      if (options.requireAuth) {
        return NextResponse.json(
          { error: 'Access token required' },
          { status: 401 }
        )
      }
      // Optional auth - continue without user
      return handler(authenticatedReq)
    }
    
    const payload = verifyAccessToken(token)
    if (!payload) {
      if (options.requireAuth) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
      // Optional auth - invalid token, continue without user
      return handler(authenticatedReq)
    }
    
    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true }
    })
    
    if (!user) {
      if (options.requireAuth) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        )
      }
      // Optional auth - user not found, continue without user
      return handler(authenticatedReq)
    }
    
    // Add user to request object
    authenticatedReq.user = user
    
    return handler(authenticatedReq)
  }
}

// Combined middleware for auth endpoints
export function withAuthAndRateLimit(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return withRateLimit()(withAuth(handler))
}