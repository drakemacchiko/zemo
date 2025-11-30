import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for posting a message
const createMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  attachments: z.array(z.string()).optional(),
});

// POST /api/support/tickets/[id]/messages - Add a message to a ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Uncomment when auth is set up
    // const session = await getServerSession(authOptions);
    const session = { user: { id: 'test-user', role: 'USER' } };
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createMessageSchema.parse(body);

    // TODO: Uncomment when Prisma is set up
    // Check ticket exists and user has access
    // const ticket = await prisma.supportTicket.findUnique({
    //   where: { id: params.id },
    //   select: {
    //     id: true,
    //     userId: true,
    //     ticketNumber: true,
    //     subject: true,
    //     status: true,
    //     user: { select: { email: true, name: true } },
    //   },
    // });
    const ticket = {
      id: params.id,
      userId: session.user.id,
      ticketNumber: 'ZEMO-T-12345',
      subject: 'Test Ticket',
      status: 'OPEN' as const,
      user: {
        email: 'test@example.com',
        name: 'Test User',
      },
    };

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check access - user must own the ticket or be admin
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = ticket.userId === session.user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Don't allow messages on closed tickets (unless admin)
    // Note: Mock data uses 'OPEN', real data will use proper enums
    if (ticket.status === 'CLOSED' as string && !isAdmin) {
      return NextResponse.json(
        { error: 'Cannot add messages to closed tickets' },
        { status: 400 }
      );
    }

    // TODO: Uncomment when Prisma is set up
    // Create the message
    // const message = await prisma.ticketMessage.create({
    const message = {
      id: 'msg-123',
      ticketId: params.id,
      senderId: session.user.id,
      message: validatedData.message,
      attachments: validatedData.attachments || [],
      isStaff: isAdmin,
      createdAt: new Date(),
      sender: {
        id: session.user.id,
        name: 'Test User',
        email: 'test@example.com',
      },
    };

    // TODO: Uncomment when Prisma is set up
    // Update ticket's updatedAt timestamp and status
    // await prisma.supportTicket.update({
    //   where: { id: params.id },
    //   data: {
    //     updatedAt: new Date(),
    //     status: isAdmin && ticket.status === 'WAITING_FOR_USER' 
    //       ? 'IN_PROGRESS' 
    //       : !isAdmin && ticket.status === 'IN_PROGRESS'
    //       ? 'WAITING_FOR_USER'
    //       : ticket.status,
    //   },
    // });

    // TODO: Send email notification
    // If admin replied, notify the user
    // If user replied, notify assigned admin or support team
    // await sendEmail({
    //   to: isAdmin ? ticket.user.email : 'support@zemo.zm',
    //   template: isAdmin ? 'ticketReply' : 'ticketUpdate',
    //   data: {
    //     ticketNumber: ticket.ticketNumber,
    //     subject: ticket.subject,
    //     message: validatedData.message,
    //     senderName: session.user.name,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        message: message.message,
        attachments: message.attachments,
        createdAt: message.createdAt,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          isStaff: message.isStaff,
        },
      },
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating ticket message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// GET /api/support/tickets/[id]/messages - Get all messages for a ticket
export async function GET(
  _request: NextRequest,
  { params: _params }: { params: { id: string } }
) {
  try {
    // TODO: Uncomment when auth is set up
    // const session = await getServerSession(authOptions);
    const session = { user: { id: 'test-user', role: 'USER' } };
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Uncomment when Prisma is set up
    // const ticket = await prisma.supportTicket.findUnique({
    //   where: { id: params.id },
    //   select: { userId: true },
    // });
    const ticket = { userId: session.user.id };

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (ticket.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // TODO: Uncomment when Prisma is set up
    // Get all messages
    // const messages = await prisma.ticketMessage.findMany({
    //   where: { ticketId: params.id },
    //   include: { sender: { select: { id: true, name: true, email: true } } },
    //   orderBy: { createdAt: 'asc' },
    // });
    const messages: Array<{
      id: string;
      message: string;
      attachments: string[];
      createdAt: Date;
      isStaff: boolean;
      sender: { id: string; name: string; email: string };
    }> = [];

    return NextResponse.json({
      messages: messages.map((msg) => ({
        id: msg.id,
        message: msg.message,
        attachments: msg.attachments,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender.id,
          name: msg.sender.name,
          isStaff: msg.isStaff,
        },
      })),
    });

  } catch (error) {
    console.error('Error fetching ticket messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
