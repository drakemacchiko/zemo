import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request, 'MANAGE_USERS')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { 
        emailVerified: true,
        phoneVerified: true,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        phoneVerified: true,
      },
    })

    return NextResponse.json({ user, message: 'User verified successfully' })
  } catch (error) {
    console.error('Verify user error:', error)
    return NextResponse.json(
      { error: 'Failed to verify user' },
      { status: 500 }
    )
  }
}
