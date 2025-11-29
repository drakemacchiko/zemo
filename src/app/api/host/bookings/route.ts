import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { withPrismaRetry } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.userId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const vehicleId = searchParams.get('vehicleId');

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Build where clause
    const whereClause: any = {
      vehicle: {
        hostId: userId
      },
      OR: [
        {
          startDate: {
            gte: startDate,
            lte: endDate
          }
        },
        {
          endDate: {
            gte: startDate,
            lte: endDate
          }
        },
        {
          AND: [
            {
              startDate: {
                lte: startDate
              }
            },
            {
              endDate: {
                gte: endDate
              }
            }
          ]
        }
      ],
      status: {
        in: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED']
      }
    };

    // Filter by vehicle if specified
    if (vehicleId) {
      whereClause.vehicleId = vehicleId;
    }

    // Fetch bookings
    const bookings = await withPrismaRetry(async (prisma) =>
      prisma.booking.findMany({
        where: whereClause,
        include: {
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              plateNumber: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  profilePictureUrl: true
                }
              }
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      })
    );

    // Format bookings for calendar
    const formattedBookings = bookings.map((booking: any) => ({
      id: booking.id,
      vehicleId: booking.vehicleId,
      vehicle: `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}`,
      plateNumber: booking.vehicle.plateNumber,
      renter: {
        id: booking.user.id,
        name: `${booking.user.profile?.firstName || ''} ${booking.user.profile?.lastName || ''}`.trim(),
        email: booking.user.email,
        avatar: booking.user.profile?.profilePictureUrl
      },
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      status: booking.status,
      totalAmount: booking.totalAmount,
      pickupTime: booking.startTime,
      returnTime: booking.endTime
    }));

    return NextResponse.json({
      bookings: formattedBookings,
      month,
      year
    });

  } catch (error) {
    console.error('Calendar bookings error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch calendar bookings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
