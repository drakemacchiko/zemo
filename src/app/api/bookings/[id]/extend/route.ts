import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

const prisma = new PrismaClient();

// POST /api/bookings/[id]/extend - Request trip extension
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id;
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const body = await request.json();
    const { newEndDate } = body;

    if (!newEndDate) {
      return NextResponse.json(
        { success: false, message: 'New end date is required' },
        { status: 400 }
      );
    }

    // Fetch booking with vehicle details
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
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    // Verify user is the renter
    if (booking.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Only the renter can request extensions' },
        { status: 403 }
      );
    }

    // Verify booking is active
    if (booking.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'Can only extend active bookings' },
        { status: 400 }
      );
    }

    const newEndDateTime = new Date(newEndDate);
    const currentEndDate = new Date(booking.endDate);

    // Validate new end date is after current end date
    if (newEndDateTime <= currentEndDate) {
      return NextResponse.json(
        { success: false, message: 'New end date must be after current end date' },
        { status: 400 }
      );
    }

    // Calculate additional days
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const additionalDays = Math.ceil(
      (newEndDateTime.getTime() - currentEndDate.getTime()) / millisecondsPerDay
    );

    // Check if vehicle is available for the extended period
    const conflictingBookings = await prisma.booking.findFirst({
      where: {
        vehicleId: booking.vehicleId,
        id: { not: bookingId },
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        OR: [
          {
            startDate: {
              lte: newEndDateTime,
            },
            endDate: {
              gte: currentEndDate,
            },
          },
        ],
      },
    });

    if (conflictingBookings) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vehicle is not available for the requested extension period',
        },
        { status: 400 }
      );
    }

    // Calculate extension cost
    const dailyRate = booking.vehicle.dailyRate;
    const extensionSubtotal = dailyRate * additionalDays;
    const serviceFee = extensionSubtotal * 0.1; // 10% service fee
    const taxAmount = extensionSubtotal * 0.16; // 16% tax (adjust as needed)
    const totalExtensionCost = extensionSubtotal + serviceFee + taxAmount;

    // Check for existing pending extension
    const existingExtension = await prisma.tripExtension.findFirst({
      where: {
        bookingId,
        status: 'PENDING',
      },
    });

    if (existingExtension) {
      return NextResponse.json(
        {
          success: false,
          message: 'There is already a pending extension request for this booking',
        },
        { status: 400 }
      );
    }

    // Create extension request
    const extension = await prisma.tripExtension.create({
      data: {
        bookingId,
        requestedBy: userId,
        originalEndDate: currentEndDate,
        newEndDate: newEndDateTime,
        additionalDays,
        dailyRate,
        extensionSubtotal,
        serviceFee,
        taxAmount,
        totalExtensionCost,
        status: 'PENDING',
      },
    });

    // Send notification to host
    await prisma.notification.create({
      data: {
        userId: booking.hostId,
        type: 'EXTENSION_REQUESTED',
        title: 'Trip Extension Requested',
        message: `${booking.user.profile?.firstName || 'A renter'} has requested to extend their trip with your ${booking.vehicle.make} ${booking.vehicle.model} by ${additionalDays} day(s).`,
        actionUrl: `/bookings/${bookingId}`,
        bookingId,
      },
    });

    // Send confirmation to renter
    await prisma.notification.create({
      data: {
        userId,
        type: 'EXTENSION_REQUESTED',
        title: 'Extension Request Sent',
        message: `Your request to extend your trip by ${additionalDays} day(s) has been sent to the host. You'll be notified once they respond.`,
        actionUrl: `/bookings/${bookingId}`,
        bookingId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Extension request sent to host',
      data: {
        extension: {
          id: extension.id,
          additionalDays,
          newEndDate: newEndDateTime,
          totalCost: totalExtensionCost,
          status: extension.status,
        },
      },
    });
  } catch (error) {
    console.error('Extension request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to request extension' },
      { status: 500 }
    );
  }
}

// GET /api/bookings/[id]/extend - Get extension details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id;
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    // Fetch all extensions for this booking
    const extensions = await prisma.tripExtension.findMany({
      where: { bookingId },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: { extensions },
    });
  } catch (error) {
    console.error('Fetch extensions error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch extensions' },
      { status: 500 }
    );
  }
}
