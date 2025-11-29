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
    const now = new Date();

    // Fetch active bookings (started but not yet ended)
    const bookings = await prisma.booking.findMany({
      where: {
        vehicle: {
          hostId,
        },
        status: 'ACTIVE',
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      include: {
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
            plateNumber: true,
            photos: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        user: {
          select: {
            phoneNumber: true,
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
        endDate: 'asc',
      },
    });

    const formattedBookings = bookings.map((booking: any) => {
      const daysRemaining = Math.ceil(
        (new Date(booking.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: booking.id,
        vehicle: {
          make: booking.vehicle.make,
          model: booking.vehicle.model,
          year: booking.vehicle.year,
          photo: booking.vehicle.photos?.[0]?.photoUrl || null,
          licensePlate: booking.vehicle.plateNumber || 'N/A',
        },
        renter: {
          name: `${booking.user.profile?.firstName || 'User'} ${booking.user.profile?.lastName || ''}`,
          profilePicture: booking.user.profile?.profilePictureUrl || null,
          phone: booking.user.phoneNumber || '',
        },
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        currentLocation: booking.pickupLocation || null,
        daysRemaining,
        hasIssues: false, // TODO: Check for reported issues
      };
    });

    return NextResponse.json({ bookings: formattedBookings });
  } catch (error) {
    console.error('Error fetching active bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch active bookings' }, { status: 500 });
  }
}
