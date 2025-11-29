import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { availabilityCheckSchema, type AvailabilityCheckInput } from '@/lib/validations';

/**
 * POST /api/bookings/availability - Check vehicle availability for given dates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = availabilityCheckSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const checkData: AvailabilityCheckInput = validationResult.data;

    // Check if vehicle exists and is available
    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id: checkData.vehicleId,
        isActive: true,
        availabilityStatus: 'AVAILABLE',
        verificationStatus: 'VERIFIED',
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        dailyRate: true,
        isActive: true,
        availabilityStatus: true,
        verificationStatus: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          reason: 'Vehicle not found or not available',
          conflicts: [],
        },
      });
    }

    // Check for overlapping bookings
    const overlappingBookings = await (prisma as any).booking.findMany({
      where: {
        vehicleId: checkData.vehicleId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'ACTIVE'],
        },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(checkData.startDate) } },
              { endDate: { gt: new Date(checkData.startDate) } },
            ],
          },
          {
            AND: [
              { startDate: { lt: new Date(checkData.endDate) } },
              { endDate: { gte: new Date(checkData.endDate) } },
            ],
          },
          {
            AND: [
              { startDate: { gte: new Date(checkData.startDate) } },
              { endDate: { lte: new Date(checkData.endDate) } },
            ],
          },
        ],
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        confirmationNumber: true,
      },
    });

    const isAvailable = overlappingBookings.length === 0;

    return NextResponse.json({
      success: true,
      data: {
        available: isAvailable,
        reason: isAvailable ? 'Vehicle is available' : 'Vehicle has conflicting bookings',
        conflicts: overlappingBookings,
        vehicle: {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          dailyRate: vehicle.dailyRate,
        },
      },
    });
  } catch (error) {
    console.error('Availability check error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
