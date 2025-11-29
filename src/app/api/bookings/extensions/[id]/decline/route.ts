import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

const prisma = new PrismaClient();

// PUT /api/bookings/extensions/[id]/decline - Host declines extension
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const extensionId = params.id;
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const hostId = decoded.userId;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please provide a reason (at least 10 characters)' },
        { status: 400 }
      );
    }

    // Fetch extension with booking details
    const extension = await prisma.tripExtension.findUnique({
      where: { id: extensionId },
      include: {
        booking: {
          include: {
            vehicle: true,
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!extension) {
      return NextResponse.json(
        { success: false, message: 'Extension request not found' },
        { status: 404 }
      );
    }

    // Verify user is the host
    if (extension.booking.hostId !== hostId) {
      return NextResponse.json(
        { success: false, message: 'Only the host can decline extensions' },
        { status: 403 }
      );
    }

    // Verify extension is pending
    if (extension.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: 'Extension is no longer pending' },
        { status: 400 }
      );
    }

    // Update extension to declined
    const updatedExtension = await prisma.tripExtension.update({
      where: { id: extensionId },
      data: {
        status: 'DECLINED',
        respondedBy: hostId,
        declineReason: reason,
        respondedAt: new Date(),
      },
    });

    // Send notification to renter
    await prisma.notification.create({
      data: {
        userId: extension.requestedBy,
        type: 'BOOKING_MODIFIED',
        title: 'Extension Declined',
        message: `Your extension request was declined. Reason: ${reason}`,
        actionUrl: `/bookings/${extension.bookingId}`,
        bookingId: extension.bookingId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Extension declined',
      data: {
        extension: updatedExtension,
      },
    });
  } catch (error) {
    console.error('Decline extension error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to decline extension' },
      { status: 500 }
    );
  }
}
