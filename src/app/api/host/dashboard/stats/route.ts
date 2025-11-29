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

    // Get current month and last month date ranges
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Active Bookings (current and upcoming)
    const activeBookings = await prisma.booking.count({
      where: {
        hostId: userId,
        status: {
          in: ['CONFIRMED', 'ACTIVE'],
        },
        endDate: {
          gte: now,
        },
      },
    });

    const lastMonthActiveBookings = await prisma.booking.count({
      where: {
        hostId: userId,
        status: {
          in: ['CONFIRMED', 'ACTIVE'],
        },
        createdAt: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
    });

    const bookingTrend =
      lastMonthActiveBookings > 0
        ? ((activeBookings - lastMonthActiveBookings) / lastMonthActiveBookings) * 100
        : activeBookings > 0
          ? 100
          : 0;

    // Monthly Earnings
    const monthlyEarnings = await prisma.payment.aggregate({
      where: {
        booking: {
          hostId: userId,
        },
        status: 'COMPLETED',
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const lastMonthEarnings = await prisma.payment.aggregate({
      where: {
        booking: {
          hostId: userId,
        },
        status: 'COMPLETED',
        createdAt: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const currentEarnings = monthlyEarnings._sum.amount || 0;
    const previousEarnings = lastMonthEarnings._sum.amount || 0;
    const earningsTrend =
      previousEarnings > 0
        ? ((currentEarnings - previousEarnings) / previousEarnings) * 100
        : currentEarnings > 0
          ? 100
          : 0;

    // Total Vehicles
    const totalVehicles = await prisma.vehicle.count({
      where: {
        hostId: userId,
      },
    });

    const activeVehicles = await prisma.vehicle.count({
      where: {
        hostId: userId,
        isActive: true,
        verificationStatus: 'VERIFIED',
        availabilityStatus: {
          in: ['AVAILABLE', 'RENTED'],
        },
      },
    });

    // Average Rating (placeholder until schema migration is run)
    // TODO: Calculate actual average rating from reviews after migration
    const averageRating = 0;
    const reviewCount = 0;

    return NextResponse.json({
      activeBookings: {
        count: activeBookings,
        trend: Math.round(bookingTrend * 10) / 10,
      },
      monthlyEarnings: {
        amount: currentEarnings,
        trend: Math.round(earningsTrend * 10) / 10,
      },
      totalVehicles: {
        active: activeVehicles,
        total: totalVehicles,
      },
      averageRating: {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: reviewCount,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
}
