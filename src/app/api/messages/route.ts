import { NextResponse } from 'next/server';
import { z } from 'zod';
// import { prisma } from '@/lib/db'; // Will be used when Prisma client is regenerated
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';

// Validation schemas
const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  content: z.string().min(1, 'Message content is required').max(1000),
  messageType: z
    .enum(['TEXT', 'SYSTEM', 'BOOKING_UPDATE', 'PAYMENT_UPDATE', 'IMAGE', 'DOCUMENT'])
    .optional()
    .default('TEXT'),
  attachmentUrl: z.string().url().optional(),
  attachmentType: z.enum(['IMAGE', 'DOCUMENT', 'VIDEO', 'OTHER']).optional(),
});

const getMessagesSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('50'),
  markAsRead: z.string().optional().default('true'),
});

const markReadSchema = z.object({
  messageIds: z.array(z.string()).min(1, 'At least one message ID is required'),
});

// GET /api/messages - Get messages for a conversation
async function getMessages(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = getMessagesSchema.parse(Object.fromEntries(searchParams.entries()));

    const page = parseInt(query.page);
    const limit = Math.min(parseInt(query.limit), 100); // Max 100 per page
    // const offset = (page - 1) * limit; // Will be used for pagination
    // const markAsRead = query.markAsRead === 'true'; // Will be used for marking messages

    // const userId = request.user!.id; // Will be used for user filtering

    // For now, return empty array with proper structure
    // This will work once Prisma client is regenerated
    return NextResponse.json({
      messages: [],
      pagination: {
        page,
        limit,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages - Send a new message
async function sendMessage(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { conversationId, content, messageType, attachmentUrl, attachmentType } =
      sendMessageSchema.parse(body);

    const userId = request.user!.id;

    // Return success for now - full implementation when Prisma client is ready
    return NextResponse.json(
      {
        message: 'Message API is ready - awaiting Prisma client regeneration',
        conversationId,
        content,
        messageType,
        attachmentUrl,
        attachmentType,
        senderId: userId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending message:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// PATCH /api/messages - Mark messages as read
async function markMessagesAsRead(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { messageIds } = markReadSchema.parse(body);

    const userId = request.user!.id;

    // Return success for now - full implementation when Prisma client is ready
    return NextResponse.json({
      message: 'Mark as read API is ready - awaiting Prisma client regeneration',
      messageIds,
      userId,
      updatedCount: messageIds.length,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}

export const GET = withAuth(getMessages);
export const POST = withAuth(sendMessage);
export const PATCH = withAuth(markMessagesAsRead);
