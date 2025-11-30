import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { startOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(token);
    if (!payload || !['ADMIN', 'SUPER_ADMIN'].includes(payload.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get date range from query params (default: current month)
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month'; // month, year, all
    
    let startDate: Date;
    const endDate = new Date();

    if (period === 'month') {
      startDate = startOfMonth(endDate);
    } else if (period === 'year') {
      startDate = new Date(endDate.getFullYear(), 0, 1);
    } else {
      startDate = new Date(0); // All time
    }

    // Calculate previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = startDate;

    // Parallel queries for current period stats
    const [
      totalUsers,
      previousTotalUsers,
      totalBookings,
      previousTotalBookings,
      completedBookings,
      totalRevenue,
      previousRevenue,
      activeListings,
      totalVehicles,
      pendingVerifications,
      openTickets,
      averageRating,
    ] = await Promise.all([
      // Total users (current period)
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      // Total users (previous period)
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: previousEndDate,
          },
        },
      }),
      // Total bookings (current period)
      prisma.booking.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      // Total bookings (previous period)
      prisma.booking.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: previousEndDate,
          },
        },
      }),
      // Completed bookings for revenue calculation
      prisma.booking.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'COMPLETED',
        },
        select: {
          totalAmount: true,
        },
      }),
      // Total revenue (current period)
      prisma.booking.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: 'COMPLETED',
        },
        _sum: {
          totalAmount: true,
        },
      }),
      // Total revenue (previous period)
      prisma.booking.aggregate({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: previousEndDate,
          },
          status: 'COMPLETED',
        },
        _sum: {
          totalAmount: true,
        },
      }),
      // Active listings
      prisma.vehicle.count({
        where: {
          verificationStatus: 'VERIFIED',
          isActive: true,
        },
      }),
      // Total vehicles
      prisma.vehicle.count(),
      // Pending verifications (unverified users)
      prisma.user.count({
        where: {
          isVerified: false,
        },
      }),
      // Open support tickets
      prisma.supportTicket.count({
        where: {
          status: {
            in: ['OPEN', 'IN_PROGRESS'],
          },
        },
      }),
      // Average rating
      prisma.review.aggregate({
        _avg: {
          rating: true,
        },
      }),
    ]);

    // Calculate metrics
    const revenue = totalRevenue._sum?.totalAmount || 0;
    const previousRevenueAmount = previousRevenue._sum?.totalAmount || 0;
    const averageBookingValue = completedBookings.length > 0 
      ? revenue / completedBookings.length 
      : 0;

    // Calculate percentage changes
    const userChange = previousTotalUsers > 0 
      ? ((totalUsers - previousTotalUsers) / previousTotalUsers) * 100 
      : totalUsers > 0 ? 100 : 0;
    
    const bookingChange = previousTotalBookings > 0 
      ? ((totalBookings - previousTotalBookings) / previousTotalBookings) * 100 
      : totalBookings > 0 ? 100 : 0;
    
    const revenueChange = previousRevenueAmount > 0 
      ? ((revenue - previousRevenueAmount) / previousRevenueAmount) * 100 
      : revenue > 0 ? 100 : 0;

    // Calculate conversion rate (bookings / users)
    const allUsers = await prisma.user.count();
    const allBookings = await prisma.booking.count();
    const conversionRate = allUsers > 0 ? (allBookings / allUsers) * 100 : 0;

    return NextResponse.json({
      overview: {
        totalUsers: {
          value: totalUsers,
          change: Math.round(userChange * 10) / 10,
        },
        totalBookings: {
          value: totalBookings,
          change: Math.round(bookingChange * 10) / 10,
        },
        totalRevenue: {
          value: revenue,
          change: Math.round(revenueChange * 10) / 10,
        },
        averageBookingValue: {
          value: Math.round(averageBookingValue * 100) / 100,
        },
        activeListings: {
          value: activeListings,
        },
        conversionRate: {
          value: Math.round(conversionRate * 10) / 10,
        },
      },
      stats: {
        totalVehicles,
        pendingVerifications,
        openTickets,
        averageRating: averageRating._avg.rating 
          ? Math.round(averageRating._avg.rating * 10) / 10 
          : 0,
      },
      period,
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
