import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

/**
 * PATCH /api/messages/mark-read
 * Mark messages as read
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
    const { conversationId, messageIds } = body;

    if (!conversationId && !messageIds) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either conversationId or messageIds is required',
        },
        { status: 400 }
      );
    }

    // If conversationId provided, mark all messages in conversation as read
    if (conversationId) {
      // Verify user is part of conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [{ hostId: userId }, { renterId: userId }],
        },
      });

      if (!conversation) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conversation not found or access denied',
          },
          { status: 404 }
        );
      }

      // Mark all unread messages from other party as read
      const result = await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
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

    // If messageIds provided, mark specific messages as read
    if (messageIds && Array.isArray(messageIds)) {
      const result = await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          senderId: { not: userId }, // Can only mark others' messages as read
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
        error: 'Invalid request',
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark messages as read',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
