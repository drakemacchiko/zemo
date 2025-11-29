import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

/**
 * GET /api/messages/conversations/[conversationId]
 * Get all messages in a conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
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

    const { conversationId } = params;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const skip = (page - 1) * limit;

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ hostId: userId }, { renterId: userId }],
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
        booking: {
          select: {
            id: true,
            confirmationNumber: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
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

    // Get messages (newest first for infinite scroll)
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
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
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
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

    // Get total count
    const totalCount = await prisma.message.count({
      where: {
        conversationId,
        isDeleted: false,
      },
    });

    // Determine other party
    const otherParty =
      conversation.hostId === userId ? conversation.renter : conversation.host;

    return NextResponse.json({
      success: true,
      conversation: {
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
      },
      messages: messages.reverse(), // Return oldest first for chat display
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch messages',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
