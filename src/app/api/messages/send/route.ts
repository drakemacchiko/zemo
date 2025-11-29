import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';
import { z } from 'zod';

const sendMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(2000),
  messageType: z.enum(['TEXT', 'IMAGE', 'DOCUMENT']).optional(),
  attachmentUrl: z.string().url().optional(),
  attachmentType: z.enum(['IMAGE', 'DOCUMENT', 'VIDEO', 'OTHER']).optional(),
  attachmentSize: z.number().optional(),
});

/**
 * POST /api/messages/send
 * Send a new message in a conversation
 */
export async function POST(request: NextRequest) {
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

    // Validate input
    const validationResult = sendMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      conversationId,
      content,
      messageType = 'TEXT',
      attachmentUrl,
      attachmentType,
      attachmentSize,
    } = validationResult.data;

    // Verify user is part of this conversation
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

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        messageType,
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentType || null,
        attachmentSize: attachmentSize || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Determine recipient (the other party in conversation)
    const recipientId =
      conversation.hostId === userId
        ? conversation.renterId
        : conversation.hostId;

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        message: content.substring(0, 100),
        actionUrl: `/messages/${conversationId}`,
        conversationId,
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send message',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
