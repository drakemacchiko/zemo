import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { withPrismaRetry } from '@/lib/db'
import { parsePermissions } from '@/lib/auth'

async function handler(request: AuthenticatedRequest) {
  try {
    const user = await withPrismaRetry((p) => p.user.findUnique({
      where: { id: request.user!.id },
      include: {
        profile: true,
        drivingLicense: true
      },
      omit: {
        password: true,
        refreshToken: true,
        otpCode: true,
        mfaSecret: true,
        mfaBackupCodes: true
      }
    }))
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse permissions from JSON string
    const permissions = parsePermissions(user.permissions)
    
    return NextResponse.json({
      user: {
        ...user,
        permissions
      }
    })
    
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handler)