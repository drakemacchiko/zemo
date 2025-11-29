import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// import { prisma } from '@/lib/db'; // Will be used when Prisma client is regenerated
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';

// Validation schemas
const updateTicketSchema = z.object({
  status: z
    .enum([
      'OPEN',
      'IN_PROGRESS',
      'WAITING_CUSTOMER',
      'WAITING_INTERNAL',
      'RESOLVED',
      'CLOSED',
      'ESCALATED',
    ])
    .optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  assignedToId: z.string().optional(),
  resolutionNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customerRating: z.number().min(1).max(5).optional(),
  customerFeedback: z.string().optional(),
});

const addMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(2000),
  isInternal: z.boolean().optional().default(false),
});

// GET /api/support/tickets/[id] - Get ticket details
async function getTicket(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const userId = request.user!.id;

    // For now, return empty ticket structure
    // This will work once Prisma client is regenerated
    return NextResponse.json({
      ticket: {
        id: ticketId,
        ticketNumber: `TICKET-${Date.now()}-DEMO`,
        subject: 'Demo Ticket',
        description: 'This is a demo ticket for API testing',
        category: 'OTHER',
        priority: 'NORMAL',
        status: 'OPEN',
        userId,
        createdAt: new Date().toISOString(),
        messages: [],
        attachments: [],
      },
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

// PATCH /api/support/tickets/[id] - Update ticket
async function updateTicket(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const body = await request.json();
    const updates = updateTicketSchema.parse(body);

    const userId = request.user!.id;

    // Return success for now - full implementation when Prisma client is ready
    return NextResponse.json({
      message: 'Ticket update API is ready - awaiting Prisma client regeneration',
      ticketId,
      updates,
      userId,
    });
  } catch (error) {
    console.error('Error updating ticket:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

// POST /api/support/tickets/[id] - Add message to ticket
async function addTicketMessage(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id;
    const body = await request.json();
    const { content, isInternal } = addMessageSchema.parse(body);

    const userId = request.user!.id;

    // Return success for now - full implementation when Prisma client is ready
    return NextResponse.json(
      {
        message: 'Ticket message API is ready - awaiting Prisma client regeneration',
        ticketId,
        content,
        isInternal,
        senderId: userId,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding ticket message:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to add ticket message' }, { status: 500 });
  }
}

// Export methods using the withAuth wrapper
export async function GET(request: NextRequest, props: { params: { id: string } }) {
  return withAuth((authReq: AuthenticatedRequest) => getTicket(authReq, props))(request);
}

export async function PATCH(request: NextRequest, props: { params: { id: string } }) {
  return withAuth((authReq: AuthenticatedRequest) => updateTicket(authReq, props))(request);
}

export async function POST(request: NextRequest, props: { params: { id: string } }) {
  return withAuth((authReq: AuthenticatedRequest) => addTicketMessage(authReq, props))(request);
}
