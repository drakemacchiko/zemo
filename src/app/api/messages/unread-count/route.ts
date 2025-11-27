import { NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId

    // Count unread messages in conversations where user is a participant
    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { hostId: userId },
            { renterId: userId }
          ]
        },
        senderId: {
          not: userId
        },
        isRead: false
      }
    })

    return NextResponse.json({ count: unreadCount })
  } catch (error) {
    console.error('Error fetching unread message count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unread message count' },
      { status: 500 }
    )
  }
}
