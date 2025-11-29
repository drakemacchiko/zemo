import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    // Fetch all pending bookings for host's vehicles
    const bookings = await prisma.booking.findMany({
      where: {
        vehicle: {
          hostId,
        },
        status: 'PENDING',
      },
      include: {
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
            photos: {
              where: { isPrimary: true },
              take: 1,
            },
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
            emailVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate expiration time (24 hours from creation)
    const requests = bookings.map(booking => {
      const createdAt = new Date(booking.createdAt);
      const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

      // Get renter's stats (placeholder - implement when Review model is ready)
      const renterRating = 4.5; // TODO: Calculate from reviews
      const tripCount = 0; // TODO: Count from completed bookings

      return {
        id: booking.id,
        vehicle: {
          make: booking.vehicle.make,
          model: booking.vehicle.model,
          year: booking.vehicle.year,
          photo: booking.vehicle.photos?.[0]?.photoUrl || null,
        },
        renter: {
          name: `${booking.user.profile?.firstName || 'User'} ${booking.user.profile?.lastName || ''}`,
          profilePicture: booking.user.profile?.profilePictureUrl || null,
          rating: renterRating,
          tripCount: tripCount,
          verified: booking.user.emailVerified || false,
        },
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalAmount: booking.totalAmount,
        specialRequests: booking.specialRequests,
        expiresAt: expiresAt.toISOString(),
      };
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    return NextResponse.json({ error: 'Failed to fetch booking requests' }, { status: 500 });
  }
}
