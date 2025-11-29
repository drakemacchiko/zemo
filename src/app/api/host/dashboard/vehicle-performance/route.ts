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

    // Get current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all host vehicles with their bookings
    const vehicles = await prisma.vehicle.findMany({
      where: {
        hostId: userId,
        isActive: true,
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        bookings: {
          where: {
            status: {
              in: ['COMPLETED', 'ACTIVE'],
            },
            createdAt: {
              gte: firstDayOfMonth,
            },
          },
          select: {
            id: true,
            totalAmount: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      take: 5, // Top 5 vehicles
    });

    // Calculate performance metrics for each vehicle
    const performanceData = vehicles.map(vehicle => {
      const trips = vehicle.bookings.length;
      const earnings = vehicle.bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

      // Calculate utilization (percentage of days booked this month)
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const bookedDays = vehicle.bookings.reduce((sum, booking) => {
        const start = booking.startDate > firstDayOfMonth ? booking.startDate : firstDayOfMonth;
        const end = booking.endDate < now ? booking.endDate : now;
        const days = Math.max(
          0,
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        );
        return sum + days;
      }, 0);
      const utilization = Math.min(100, Math.round((bookedDays / daysInMonth) * 100));

      return {
        vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        trips,
        earnings,
        utilization,
      };
    });

    // Sort by trips (descending)
    performanceData.sort((a, b) => b.trips - a.trips);

    return NextResponse.json({
      vehicles: performanceData,
    });
  } catch (error) {
    console.error('Error fetching vehicle performance:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle performance' }, { status: 500 });
  }
}
