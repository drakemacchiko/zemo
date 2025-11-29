import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

/**
 * GET /api/messages/conversations
 * List all conversations for current user
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
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filter = searchParams.get('filter'); // 'all', 'unread', 'hosts', 'renters'

    const skip = (page - 1) * limit;

    // Build where clause based on filter
    const whereClause: any = {
      OR: [
        { hostId: userId, hostDeleted: false },
        { renterId: userId, renterDeleted: false },
      ],
    };

    // Get conversations with message count and last message
    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        host: {
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
        renter: {
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
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            photos: {
              where: { isPrimary: true },
              select: { photoUrl: true },
              take: 1,
            },
          },
        },
        booking: {
          select: {
            id: true,
            confirmationNumber: true,
            status: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            messageType: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async conversation => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            isRead: false,
            isDeleted: false,
          },
        });

        // Determine the other party
        const otherParty = conversation.hostId === userId ? conversation.renter : conversation.host;

        return {
          id: conversation.id,
          otherParty: {
            id: otherParty.id,
            name: otherParty.profile
              ? `${otherParty.profile.firstName} ${otherParty.profile.lastName}`
              : otherParty.email,
            avatar: otherParty.profile?.profilePictureUrl || null,
          },
          vehicle: conversation.vehicle
            ? {
                id: conversation.vehicle.id,
                name: `${conversation.vehicle.year} ${conversation.vehicle.make} ${conversation.vehicle.model}`,
                photo: conversation.vehicle.photos[0]?.photoUrl || null,
              }
            : null,
          booking: conversation.booking,
          lastMessage: conversation.messages[0] || null,
          unreadCount,
          lastMessageAt: conversation.lastMessageAt,
          createdAt: conversation.createdAt,
        };
      })
    );

    // Apply filters after fetching
    let filteredConversations = conversationsWithUnread;

    if (filter === 'unread') {
      filteredConversations = conversationsWithUnread.filter(c => c.unreadCount > 0);
    }

    // Get total count for pagination
    const totalCount = await prisma.conversation.count({
      where: whereClause,
    });

    return NextResponse.json({
      success: true,
      conversations: filteredConversations,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conversations',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages/conversations
 * Create a new conversation (pre-booking inquiry)
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
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;

    const body = await request.json();
    const { hostId, vehicleId, initialMessage } = body;

    // Validate input
    if (!hostId || !vehicleId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Host ID and vehicle ID are required',
        },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        hostId,
        renterId: userId,
        vehicleId,
        bookingId: null, // Pre-booking conversations
      },
    });

    if (existingConversation) {
      // If initial message provided, send it
      if (initialMessage) {
        await prisma.message.create({
          data: {
            conversationId: existingConversation.id,
            senderId: userId,
            content: initialMessage,
            messageType: 'TEXT',
          },
        });

        // Update lastMessageAt
        await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { lastMessageAt: new Date() },
        });

        // Create notification for host
        await prisma.notification.create({
          data: {
            userId: hostId,
            type: 'MESSAGE_RECEIVED',
            title: 'New Message',
            message: 'You have a new inquiry about your vehicle',
            actionUrl: `/messages/${existingConversation.id}`,
            vehicleId,
          },
        });
      }

      return NextResponse.json({
        success: true,
        conversation: existingConversation,
      });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        hostId,
        renterId: userId,
        vehicleId,
        lastMessageAt: new Date(),
      },
      include: {
        host: {
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
        renter: {
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
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            photos: {
              where: { isPrimary: true },
              select: { photoUrl: true },
              take: 1,
            },
          },
        },
      },
    });

    // Send initial message if provided
    if (initialMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          content: initialMessage,
          messageType: 'TEXT',
        },
      });

      // Create notification for host
      await prisma.notification.create({
        data: {
          userId: hostId,
          type: 'MESSAGE_RECEIVED',
          title: 'New Inquiry',
          message: 'Someone is interested in your vehicle',
          actionUrl: `/messages/${conversation.id}`,
          vehicleId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create conversation',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
