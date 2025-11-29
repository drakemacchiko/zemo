import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';

// Validation schemas
const createConversationSchema = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
  bookingId: z.string().optional(),
  vehicleId: z.string().optional(),
  initialMessage: z.string().min(1, 'Initial message is required').max(1000),
});

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  archived: z.string().optional().default('false'),
});

// GET /api/conversations - Get user's conversations
async function getConversations(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams.entries()));

    const page = parseInt(query.page);
    const limit = Math.min(parseInt(query.limit), 50); // Max 50 per page
    // const archived = query.archived === 'true'; // Will be used when Prisma client is regenerated
    // const offset = (page - 1) * limit; // Will be used for pagination

    // const userId = request.user!.id; // Will be used for user filtering

    // For now, return empty array with proper structure
    // This will work once Prisma client is regenerated
    return NextResponse.json({
      conversations: [],
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
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST /api/conversations - Create new conversation or get existing
async function createConversation(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { participantId, bookingId, vehicleId, initialMessage } =
      createConversationSchema.parse(body);

    const userId = request.user!.id;

    if (participantId === userId) {
      return NextResponse.json(
        { error: 'Cannot create conversation with yourself' },
        { status: 400 }
      );
    }

    // Verify participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Return success for now - full implementation when Prisma client is ready
    return NextResponse.json(
      {
        message: 'Conversation API is ready - awaiting Prisma client regeneration',
        participantId,
        bookingId,
        vehicleId,
        initialMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating conversation:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}

export const GET = withAuth(getConversations);
export const POST = withAuth(createConversation);
