import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

const prisma = new PrismaClient();

// PUT /api/bookings/extensions/[id]/approve - Host approves extension
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
    const { message } = body;

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
        { success: false, message: 'Only the host can approve extensions' },
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

    // Double-check vehicle availability (in case another booking was made)
    const conflictingBookings = await prisma.booking.findFirst({
      where: {
        vehicleId: extension.booking.vehicleId,
        id: { not: extension.bookingId },
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        OR: [
          {
            startDate: {
              lte: extension.newEndDate,
            },
            endDate: {
              gte: extension.originalEndDate,
            },
          },
        ],
      },
    });

    if (conflictingBookings) {
      // Auto-decline if conflict found
      await prisma.tripExtension.update({
        where: { id: extensionId },
        data: {
          status: 'DECLINED',
          respondedBy: hostId,
          respondedAt: new Date(),
          declineReason: 'Vehicle is no longer available for the extended period',
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Vehicle is no longer available for the requested extension period',
        },
        { status: 400 }
      );
    }

    // Create payment intent for extension (in real implementation)
    // For now, we'll just mark it as approved and expect payment
    const updatedExtension = await prisma.tripExtension.update({
      where: { id: extensionId },
      data: {
        status: 'APPROVED',
        respondedBy: hostId,
        responseMessage: message,
        respondedAt: new Date(),
        approvedAt: new Date(),
      },
    });

    // Update booking end date (will be finalized after payment)
    await prisma.booking.update({
      where: { id: extension.bookingId },
      data: {
        endDate: extension.newEndDate,
        totalDays: extension.booking.totalDays + extension.additionalDays,
        totalAmount: extension.booking.totalAmount + extension.totalExtensionCost,
      },
    });

    // Send notification to renter
    await prisma.notification.create({
      data: {
        userId: extension.requestedBy,
        type: 'BOOKING_MODIFIED',
        title: 'Extension Approved',
        message: `Your extension request has been approved! Your trip now ends on ${extension.newEndDate.toLocaleDateString()}.`,
        actionUrl: `/bookings/${extension.bookingId}/pay-extension/${extensionId}`,
        bookingId: extension.bookingId,
      },
    });

    // Send confirmation to host
    await prisma.notification.create({
      data: {
        userId: hostId,
        type: 'BOOKING_MODIFIED',
        title: 'Extension Approved',
        message: `You approved the extension for ${extension.booking.user.profile?.firstName || 'the renter'}. Payment will be processed automatically.`,
        actionUrl: `/bookings/${extension.bookingId}`,
        bookingId: extension.bookingId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Extension approved successfully',
      data: {
        extension: updatedExtension,
      },
    });
  } catch (error) {
    console.error('Approve extension error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to approve extension' },
      { status: 500 }
    );
  }
}
