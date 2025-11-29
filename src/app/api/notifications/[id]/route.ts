import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

/**
 * PATCH /api/notifications/[id]/read
 * Mark a single notification as read
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;
    const { id } = params;

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          error: 'Notification not found',
        },
        { status: 404 }
      );
    }

    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      notification: updatedNotification,
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark notification as read',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;
    const { id } = params;

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          error: 'Notification not found',
        },
        { status: 404 }
      );
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete notification',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
