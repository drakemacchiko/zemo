import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

/**
 * GET /api/notifications
 * Fetch all notifications for current user
 */
export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filter = searchParams.get('filter'); // 'all', 'unread', 'bookings', 'messages', 'reviews', 'account'
    const type = searchParams.get('type'); // Specific notification type

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { userId };

    if (filter === 'unread') {
      whereClause.isRead = false;
    } else if (filter === 'bookings') {
      whereClause.type = {
        in: ['BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED'],
      };
    } else if (filter === 'messages') {
      whereClause.type = 'MESSAGE_RECEIVED';
    } else if (filter === 'account') {
      whereClause.type = {
        in: ['DOCUMENT_REQUIRED', 'VEHICLE_APPROVED', 'SYSTEM_ANNOUNCEMENT'],
      };
    }

    if (type) {
      whereClause.type = type;
    }

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        booking: {
          select: {
            id: true,
            confirmationNumber: true,
            status: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
          },
        },
      },
    });

    // Get total count
    const totalCount = await prisma.notification.count({
      where: whereClause,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notifications',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;
    const body = await request.json();
    const { notificationIds, markAllRead } = body;

    if (markAllRead) {
      // Mark all notifications as read
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        markedCount: result.count,
      });
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      const result = await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId, // Ensure user owns these notifications
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        markedCount: result.count,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Either notificationIds or markAllRead must be provided',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark notifications as read',
        message: error.message,
      },
      { status: 500 }
    );
  }
}