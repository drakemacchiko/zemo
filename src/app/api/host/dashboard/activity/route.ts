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
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Fetch recent booking activities
    const recentBookings = await prisma.booking.findMany({
      where: {
        hostId: userId,
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
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });

    // Convert bookings to activity feed items
    const activities = recentBookings.map(booking => {
      const vehicleName = `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}`;
      const renterName =
        `${booking.user.profile?.firstName || ''} ${booking.user.profile?.lastName || ''}`.trim();

      let type: 'booking_request' | 'booking_completed' | 'review' | 'message' | 'payout' =
        'booking_request';
      let title = '';
      let description = '';

      switch (booking.status) {
        case 'PENDING':
          type = 'booking_request';
          title = 'New booking request';
          description = `${renterName} wants to book your ${vehicleName}`;
          break;
        case 'CONFIRMED':
          type = 'booking_request';
          title = 'Booking confirmed';
          description = `Booking confirmed for ${vehicleName}`;
          break;
        case 'COMPLETED':
          type = 'booking_completed';
          title = 'Trip completed';
          description = `${renterName} completed their trip with ${vehicleName}`;
          break;
        case 'CANCELLED':
          title = 'Booking cancelled';
          description = `Booking for ${vehicleName} was cancelled`;
          break;
        case 'ACTIVE':
          title = 'Trip in progress';
          description = `${renterName} is currently using ${vehicleName}`;
          break;
        default:
          title = 'Booking update';
          description = `Status updated for ${vehicleName}`;
      }

      return {
        id: booking.id,
        type,
        title,
        description,
        timestamp: booking.updatedAt.toISOString(),
        icon: type,
      };
    });

    return NextResponse.json({
      activities,
    });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json({ error: 'Failed to fetch activity feed' }, { status: 500 });
  }
}
