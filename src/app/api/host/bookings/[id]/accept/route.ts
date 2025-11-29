import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const hostId = payload.userId;
    const bookingId = params.id;

    // Verify booking exists and belongs to host's vehicle
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        vehicle: {
          hostId,
        },
        status: 'PENDING',
      },
      include: {
        vehicle: true,
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or already processed' },
        { status: 404 }
      );
    }

    // Check for date conflicts
    const conflicts = await prisma.booking.findMany({
      where: {
        vehicleId: booking.vehicleId,
        status: {
          in: ['CONFIRMED', 'ACTIVE'],
        },
        OR: [
          {
            AND: [
              { startDate: { lte: booking.startDate } },
              { endDate: { gte: booking.startDate } },
            ],
          },
          {
            AND: [{ startDate: { lte: booking.endDate } }, { endDate: { gte: booking.endDate } }],
          },
          {
            AND: [{ startDate: { gte: booking.startDate } }, { endDate: { lte: booking.endDate } }],
          },
        ],
      },
    });

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Date conflict detected with another booking' },
        { status: 400 }
      );
    }

    // Update booking status to confirmed
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
      },
    });

    // TODO: Send notification email/SMS to renter
    // Notify renter at booking.user.email

    return NextResponse.json({
      message: 'Booking accepted successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error accepting booking:', error);
    return NextResponse.json({ error: 'Failed to accept booking' }, { status: 500 });
  }
}
