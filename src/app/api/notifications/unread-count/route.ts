import { NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    })

    return NextResponse.json({ count: unreadCount })
  } catch (error) {
    console.error('Error fetching unread notification count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unread notification count' },
      { status: 500 }
    )
  }
}
