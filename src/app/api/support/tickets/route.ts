import { NextResponse } from 'next/server';
import { z } from 'zod';
// import { prisma } from '@/lib/db'; // Will be used when Prisma client is regenerated
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import { generateId } from '@/lib/utils';

// Validation schemas
const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  category: z.enum([
    'BOOKING_ISSUE',
    'PAYMENT_ISSUE',
    'VEHICLE_ISSUE',
    'TECHNICAL_SUPPORT',
    'ACCOUNT_ISSUE',
    'DAMAGE_DISPUTE',
    'REFUND_REQUEST',
    'FEATURE_REQUEST',
    'COMPLAINT',
    'OTHER',
  ]),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).optional().default('NORMAL'),
  bookingId: z.string().optional(),
  vehicleId: z.string().optional(),
  paymentId: z.string().optional(),
});

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
});

// Update ticket schema (will be used in [id]/route.ts)
// const updateTicketSchema = z.object({
//   status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_INTERNAL', 'RESOLVED', 'CLOSED', 'ESCALATED']).optional(),
//   priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
//   assignedToId: z.string().optional(),
//   resolutionNotes: z.string().optional(),
//   internalNotes: z.string().optional(),
//   tags: z.array(z.string()).optional(),
//   customerRating: z.number().min(1).max(5).optional(),
//   customerFeedback: z.string().optional(),
// });

// GET /api/support/tickets - Get user's support tickets
async function getTickets(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams.entries()));

    const page = parseInt(query.page);
    const limit = Math.min(parseInt(query.limit), 50); // Max 50 per page
    // const offset = (page - 1) * limit; // Will be used for pagination

    // const userId = request.user!.id; // Will be used for user filtering

    // For now, return empty array with proper structure
    // This will work once Prisma client is regenerated
    return NextResponse.json({
      tickets: [],
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
    console.error('Error fetching support tickets:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 });
  }
}

// POST /api/support/tickets - Create new support ticket
async function createTicket(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { subject, description, category, priority, bookingId, vehicleId, paymentId } =
      createTicketSchema.parse(body);

    const userId = request.user!.id;

    // Generate ticket number
    const ticketNumber = `TICKET-${Date.now()}-${generateId().substring(0, 6).toUpperCase()}`;

    // Return success for now - full implementation when Prisma client is ready
    return NextResponse.json(
      {
        message: 'Support ticket API is ready - awaiting Prisma client regeneration',
        ticket: {
          ticketNumber,
          subject,
          description,
          category,
          priority,
          status: 'OPEN',
          userId,
          bookingId,
          vehicleId,
          paymentId,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating support ticket:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 });
  }
}

export const GET = withAuth(getTickets);
export const POST = withAuth(createTicket);
