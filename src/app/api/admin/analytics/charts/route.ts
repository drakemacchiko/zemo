import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { startOfMonth, subMonths, format } from 'date-fns';

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

    // Get chart type from query params
    const { searchParams } = new URL(req.url);
    const chartType = searchParams.get('type') || 'revenue'; // revenue, bookings, users, vehicles

    // Get data for last 12 months
    const endDate = new Date();

    if (chartType === 'revenue') {
      // Revenue over time (last 12 months)
      const monthlyRevenue = [];
      
      for (let i = 0; i < 12; i++) {
        const monthStart = subMonths(startOfMonth(endDate), 11 - i);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
        
        const revenue = await prisma.booking.aggregate({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
            status: 'COMPLETED',
          },
          _sum: {
            totalAmount: true,
          },
        });

        monthlyRevenue.push({
          month: format(monthStart, 'MMM yyyy'),
          revenue: revenue._sum?.totalAmount || 0,
        });
      }

      return NextResponse.json({ data: monthlyRevenue });
    }

    if (chartType === 'bookings') {
      // Bookings by month (last 12 months)
      const monthlyBookings = [];
      
      for (let i = 0; i < 12; i++) {
        const monthStart = subMonths(startOfMonth(endDate), 11 - i);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
        
        const count = await prisma.booking.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        monthlyBookings.push({
          month: format(monthStart, 'MMM yyyy'),
          bookings: count,
        });
      }

      return NextResponse.json({ data: monthlyBookings });
    }

    if (chartType === 'users') {
      // User growth (last 12 months)
      const monthlyUsers = [];
      
      for (let i = 0; i < 12; i++) {
        const monthStart = subMonths(startOfMonth(endDate), 11 - i);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
        
        const count = await prisma.user.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        });

        monthlyUsers.push({
          month: format(monthStart, 'MMM yyyy'),
          users: count,
        });
      }

      return NextResponse.json({ data: monthlyUsers });
    }

    if (chartType === 'vehicles') {
      // Vehicle types distribution
      const vehiclesByType = await prisma.vehicle.groupBy({
        by: ['vehicleType'],
        _count: true,
        where: {
          verificationStatus: 'VERIFIED',
        },
      });

      const data = vehiclesByType.map((item) => ({
        category: item.vehicleType,
        count: item._count,
      }));

      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: 'Invalid chart type' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
