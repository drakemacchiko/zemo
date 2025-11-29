import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = payload.userId;

    // Get limit from query params
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const now = new Date();

    // Fetch upcoming bookings
    const bookings = await prisma.booking.findMany({
      where: {
        hostId: userId,
        status: {
          in: ['CONFIRMED', 'PENDING'],
        },
        startDate: {
          gte: now,
        },
      },
      include: {
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
          },
        },
        user: {
          select: {
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
        startDate: 'asc',
      },
      take: limit,
    });

    // Format the bookings for response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      vehicle: {
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        year: booking.vehicle.year,
      },
      renter: {
        name:
          `${booking.user.profile?.firstName || ''} ${booking.user.profile?.lastName || ''}`.trim() ||
          'Unknown',
        profilePicture: booking.user.profile?.profilePictureUrl || undefined,
      },
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      status: booking.status,
    }));

    return NextResponse.json({
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch upcoming bookings' }, { status: 500 });
  }
}
