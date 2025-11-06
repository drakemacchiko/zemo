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

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    const token = extractTokenFromRequest(req)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      )
    }
    
    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }
    
    // Add user to request object
    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = user
    
    return handler(authenticatedReq)
  }
}

// Combined middleware for auth endpoints
export function withAuthAndRateLimit(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return withRateLimit()(withAuth(handler))
}