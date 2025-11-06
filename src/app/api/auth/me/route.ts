import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/db'

async function handler(request: AuthenticatedRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.id },
      include: {
        profile: true,
        drivingLicense: true
      },
      omit: {
        password: true,
        refreshToken: true,
        otpCode: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      user
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