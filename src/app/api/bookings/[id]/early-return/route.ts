import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

const prisma = new PrismaClient();

// POST /api/bookings/[id]/early-return - Request early return
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const body = await request.json();
    const { actualReturnDate, reason } = body;

    if (!actualReturnDate) {
      return NextResponse.json(
        { success: false, message: 'Actual return date is required' },
        { status: 400 }
      );
    }

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify user is the renter
    if (booking.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Only the renter can request early return' },
        { status: 403 }
      );
    }

    // Verify booking is active
    if (booking.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'Can only end active bookings early' },
        { status: 400 }
      );
    }

    const actualReturnDateTime = new Date(actualReturnDate);
    const originalEndDate = new Date(booking.endDate);
    const now = new Date();

    // Validate actual return date is before original end date
    if (actualReturnDateTime >= originalEndDate) {
      return NextResponse.json(
        { success: false, message: 'Return date must be before original end date' },
        { status: 400 }
      );
    }

    // Validate return date is not in the future
    if (actualReturnDateTime > now) {
      return NextResponse.json(
        { success: false, message: 'Cannot return in the future' },
        { status: 400 }
      );
    }

    // Calculate unused days
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daysUnused = Math.ceil(
      (originalEndDate.getTime() - actualReturnDateTime.getTime()) / millisecondsPerDay
    );

    // Calculate refund based on cancellation policy
    // For simplicity, using 50% refund for unused days
    // In production, this should check the actual cancellation policy
    const dailyRate = booking.dailyRate;
    const refundPercentage = 0.5; // 50% refund
    const refundAmount = dailyRate * daysUnused * refundPercentage;
    const policyApplied = 'Early Return Policy: 50% refund for unused days';

    // Check for existing early return
    const existingEarlyReturn = await prisma.earlyReturn.findFirst({
      where: {
        bookingId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingEarlyReturn) {
      return NextResponse.json(
        {
          success: false,
          message: 'There is already an early return request for this booking',
        },
        { status: 400 }
      );
    }

    // Create early return request
    const earlyReturn = await prisma.earlyReturn.create({
      data: {
        bookingId,
        requestedBy: userId,
        originalEndDate,
        actualReturnDate: actualReturnDateTime,
        daysUnused,
        dailyRate,
        refundAmount,
        refundReason: reason,
        policyApplied,
        status: 'PENDING',
      },
    });

    // Update booking status and end date
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        endDate: actualReturnDateTime,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Approve early return automatically (in production, might need host approval)
    await prisma.earlyReturn.update({
      where: { id: earlyReturn.id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    // Send notification to host
    await prisma.notification.create({
      data: {
        userId: booking.hostId,
        type: 'EARLY_RETURN',
        title: 'Early Return',
        message: `${booking.user.profile?.firstName || 'The renter'} has returned your ${booking.vehicle.make} ${booking.vehicle.model} ${daysUnused} day(s) early.`,
        actionUrl: `/bookings/${bookingId}`,
        bookingId,
      },
    });

    // Send confirmation to renter
    await prisma.notification.create({
      data: {
        userId,
        type: 'EARLY_RETURN',
        title: 'Trip Ended Early',
        message: `Your trip has been ended ${daysUnused} day(s) early. A refund of ZMW ${refundAmount.toFixed(2)} will be processed to your original payment method.`,
        actionUrl: `/bookings/${bookingId}`,
        bookingId,
      },
    });

    // Update vehicle availability
    await prisma.vehicle.update({
      where: { id: booking.vehicleId },
      data: {
        availabilityStatus: 'AVAILABLE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Trip ended early. Refund will be processed.',
      data: {
        earlyReturn: {
          id: earlyReturn.id,
          daysUnused,
          refundAmount,
          actualReturnDate: actualReturnDateTime,
          status: 'APPROVED',
        },
      },
    });
  } catch (error) {
    console.error('Early return error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process early return' },
      { status: 500 }
    );
  }
}

// GET /api/bookings/[id]/early-return - Get early return details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Fetch early returns for this booking
    const earlyReturns = await prisma.earlyReturn.findMany({
      where: { bookingId },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: { earlyReturns },
    });
  } catch (error) {
    console.error('Fetch early returns error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch early returns' },
      { status: 500 }
    );
  }
}
