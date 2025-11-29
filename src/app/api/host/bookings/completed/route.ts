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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      vehicle: { hostId },
      status: 'COMPLETED',
      endDate: { lt: new Date() },
    };

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }

    // Fetch completed bookings with pagination
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
        orderBy: { endDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // Format the response with earnings and ratings
    const formattedBookings = bookings.map((booking: any) => {
      const hoursUntilIssueDeadline = Math.floor(
        (48 * 60 * 60 * 1000 - (new Date().getTime() - new Date(booking.endDate).getTime())) /
          (1000 * 60 * 60)
      );

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
        hostEarnings: booking.totalAmount - booking.serviceFee,
        platformFee: booking.serviceFee,
        status: booking.status,
        rating: null, // TODO: Implement review system
        review: null,
        reviewDate: null,
        canReportIssue: hoursUntilIssueDeadline > 0,
        issueDeadlineHours: Math.max(0, hoursUntilIssueDeadline),
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
    console.error('Error fetching completed bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch completed bookings' }, { status: 500 });
  }
}
