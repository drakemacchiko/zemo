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
    const period = searchParams.get('period') || 'month'; // month, quarter, year, all

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get earnings data
    const [earnings, bookings] = await Promise.all([
      // Total earnings from completed bookings
      withPrismaRetry(async prisma => {
        const result = await prisma.booking.aggregate({
          where: {
            vehicle: {
              hostId: userId,
            },
            status: 'COMPLETED',
            createdAt: {
              gte: startDate,
            },
          },
          _sum: {
            totalAmount: true,
          },
          _count: true,
        });

        const totalRevenue = result._sum.totalAmount || 0;
        // Calculate host earnings as 85% (15% platform fee)
        const hostEarnings = totalRevenue * 0.85;

        return {
          totalRevenue,
          hostEarnings,
          completedBookings: result._count,
        };
      }),

      // Booking details for breakdown
      withPrismaRetry(async prisma =>
        prisma.booking.findMany({
          where: {
            vehicle: {
              hostId: userId,
            },
            status: 'COMPLETED',
            createdAt: {
              gte: startDate,
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
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      ),
    ]);

    // Get pending payouts (last 7 days completed bookings)
    const pendingPayouts = await withPrismaRetry(async prisma => {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      const result = await prisma.booking.aggregate({
        where: {
          vehicle: {
            hostId: userId,
          },
          status: 'COMPLETED',
          completedAt: {
            gte: sevenDaysAgo,
          },
        },
        _sum: {
          totalAmount: true,
        },
      });

      // Calculate host earnings as 85% of total
      return (result._sum.totalAmount || 0) * 0.85;
    });

    // Get next payout date (first Monday of next month)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextPayout = new Date(nextMonth);
    while (nextPayout.getDay() !== 1) {
      nextPayout.setDate(nextPayout.getDate() + 1);
    }

    // Calculate earnings by vehicle
    const earningsByVehicle = bookings.reduce(
      (acc: any, booking: any) => {
        const vehicleKey = `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}`;
        if (!acc[vehicleKey]) {
          acc[vehicleKey] = {
            vehicle: vehicleKey,
            vehicleId: booking.vehicleId,
            earnings: 0,
            bookings: 0,
          };
        }
        acc[vehicleKey].earnings += booking.totalAmount * 0.85 || 0;
        acc[vehicleKey].bookings += 1;
        return acc;
      },
      {} as Record<string, any>
    );

    // Calculate earnings trend (last 12 months)
    const earningsTrend = await withPrismaRetry(async prisma => {
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthEarnings = await prisma.booking.aggregate({
          where: {
            vehicle: {
              hostId: userId,
            },
            status: 'COMPLETED',
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            totalAmount: true,
          },
        });

        months.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          year: monthStart.getFullYear(),
          earnings: (monthEarnings._sum.totalAmount || 0) * 0.85,
        });
      }
      return months;
    });

    return NextResponse.json({
      overview: {
        totalRevenue: earnings.totalRevenue,
        hostEarnings: earnings.hostEarnings,
        completedBookings: earnings.completedBookings,
        pendingPayouts,
        nextPayoutDate: nextPayout.toISOString(),
        platformFee: earnings.totalRevenue - earnings.hostEarnings,
      },
      byVehicle: Object.values(earningsByVehicle),
      trend: earningsTrend,
      recentBookings: bookings.slice(0, 10).map((booking: any) => ({
        id: booking.id,
        vehicle: `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}`,
        renter:
          `${booking.user.profile?.firstName || ''} ${booking.user.profile?.lastName || ''}`.trim(),
        startDate: booking.startDate,
        endDate: booking.endDate,
        amount: booking.totalAmount,
        hostEarnings: booking.totalAmount * 0.85,
        status: 'COMPLETED',
      })),
    });
  } catch (error) {
    console.error('Earnings overview error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch earnings overview',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
