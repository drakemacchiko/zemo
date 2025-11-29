import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const hostId = decoded.userId;

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const vehicleId = searchParams.get('vehicleId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      vehicle: { hostId },
      status: 'CANCELLED',
    };

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    // Fetch cancelled bookings with pagination
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              plateNumber: true,
              photos: {
                where: { isPrimary: true },
                select: { photoUrl: true },
              },
            },
          },
          user: {
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
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // Format the response with cancellation details
    const formattedBookings = bookings.map((booking: any) => {
      // TODO: Create CancellationRecord model to store cancellation details
      // For now, we'll show basic info
      const cancelledBy = booking.hostCancelled ? 'host' : 'renter';
      const refundAmount = booking.refundAmount || 0;
      const penalty = booking.cancellationPenalty || 0;

      return {
        id: booking.id,
        vehicle: {
          id: booking.vehicle.id,
          name: `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}`,
          plateNumber: booking.vehicle.plateNumber,
          photo: booking.vehicle.photos?.[0]?.photoUrl,
        },
        renter: {
          id: booking.user.id,
          name: `${booking.user.profile?.firstName || ''} ${booking.user.profile?.lastName || ''}`.trim(),
          email: booking.user.email,
          profilePicture: booking.user.profile?.profilePictureUrl,
        },
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalAmount: booking.totalAmount,
        cancelledBy,
        cancelledAt: booking.updatedAt,
        // TODO: Add these fields to Booking model or create CancellationRecord
        cancellationReason: 'Not available', // TODO: Store in separate model
        refundAmount,
        penalty,
        status: booking.status,
        createdAt: booking.createdAt,
      };
    });

    return NextResponse.json({
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching cancelled bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch cancelled bookings' }, { status: 500 });
  }
}
