import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authResult = await requireAdmin(request, 'VIEW_ANALYTICS');
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 });
  }

  try {
    // Get basic statistics
    const [
      totalUsers,
      totalVehicles,
      activeBookings,
      totalClaims,
      dailyActiveUsers,
      bookingsToday,
      paymentsToday,
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),

      // Total vehicles count
      prisma.vehicle.count(),

      // Active bookings (not completed/cancelled)
      prisma.booking.count({
        where: {
          status: {
            in: ['PENDING', 'CONFIRMED', 'ACTIVE'],
          },
        },
      }),

      // Total claims
      prisma.claim.count(),

      // Daily active users (users who logged in today)
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),

      // Bookings created today
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),

      // Payments processed today
      prisma.payment.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          status: 'COMPLETED',
        },
        select: {
          amount: true,
        },
      }),
    ]);

    // Calculate revenue
    const revenueToday = paymentsToday.reduce(
      (sum: number, payment: any) => sum + payment.amount,
      0
    );

    const totalPayments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
      },
      select: {
        amount: true,
      },
    });

    const totalRevenue = totalPayments.reduce(
      (sum: number, payment: any) => sum + payment.amount,
      0
    );

    const stats = {
      totalUsers,
      totalVehicles,
      activeBookings,
      totalClaims,
      totalRevenue,
      dailyActiveUsers,
      bookingsToday,
      revenueToday,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard statistics' }, { status: 500 });
  }
}
