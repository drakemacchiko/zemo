import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { bookingUpdateSchema, type BookingUpdateInput } from '@/lib/validations';
import { calculateBookingPrice } from '@/lib/utils';

/**
 * Verify authentication token and return user info
 */
async function verifyAuthToken(request: NextRequest) {
  const token = extractTokenFromRequest(request);

  if (!token) {
    return { success: false, userId: null };
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return { success: false, userId: null };
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true },
  });

  if (!user) {
    return { success: false, userId: null };
  }

  return { success: true, userId: user.id };
}

/**
 * GET /api/bookings/[id] - Get a specific booking
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = authResult.userId;

    // Get booking and verify ownership or host access
    const booking = await (prisma as any).booking.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            plateNumber: true,
            dailyRate: true,
            locationAddress: true,
            hostId: true,
            photos: {
              where: { isPrimary: true },
              select: { photoUrl: true },
              take: 1,
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Check if user has access (either the renter or the host)
    if (booking.userId !== userId && booking.vehicle.hostId !== userId) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get booking error:', error);

    return NextResponse.json({ success: false, error: 'Failed to fetch booking' }, { status: 500 });
  }
}

/**
 * PUT /api/bookings/[id] - Update a booking
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = authResult.userId;
    const body = await request.json();

    // Validate request body
    const validationResult = bookingUpdateSchema.safeParse(body);
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

    const updateData: BookingUpdateInput = validationResult.data;

    // Use transaction for booking updates
    const result = await prisma.$transaction(async (tx: any) => {
      // Get existing booking
      const existingBooking = await (tx as any).booking.findUnique({
        where: { id },
        include: {
          vehicle: {
            select: {
              id: true,
              hostId: true,
              dailyRate: true,
              isActive: true,
              availabilityStatus: true,
              verificationStatus: true,
            },
          },
        },
      });

      if (!existingBooking) {
        throw new Error('Booking not found');
      }

      // Check permissions
      const isRenter = existingBooking.userId === userId;
      const isHost = existingBooking.vehicle.hostId === userId;

      if (!isRenter && !isHost) {
        throw new Error('Access denied');
      }

      // Business rules for updates
      if (updateData.status) {
        // Only hosts can confirm/reject bookings
        if (['CONFIRMED', 'REJECTED'].includes(updateData.status) && !isHost) {
          throw new Error('Only hosts can confirm or reject bookings');
        }

        // Only renters can cancel their own bookings
        if (updateData.status === 'CANCELLED' && !isRenter) {
          throw new Error('Only renters can cancel their bookings');
        }

        // Cannot modify completed or cancelled bookings
        if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(existingBooking.status)) {
          throw new Error('Cannot modify completed, cancelled, or rejected bookings');
        }
      }

      // If dates are being changed, check availability
      if (updateData.startDate || updateData.endDate) {
        const newStartDate = updateData.startDate
          ? new Date(updateData.startDate)
          : existingBooking.startDate;
        const newEndDate = updateData.endDate
          ? new Date(updateData.endDate)
          : existingBooking.endDate;

        // Check for overlapping bookings (excluding current booking)
        const overlappingBookings = await (tx as any).booking.findMany({
          where: {
            vehicleId: existingBooking.vehicleId,
            id: { not: id },
            status: {
              in: ['PENDING', 'CONFIRMED', 'ACTIVE'],
            },
            OR: [
              {
                AND: [{ startDate: { lte: newStartDate } }, { endDate: { gt: newStartDate } }],
              },
              {
                AND: [{ startDate: { lt: newEndDate } }, { endDate: { gte: newEndDate } }],
              },
              {
                AND: [{ startDate: { gte: newStartDate } }, { endDate: { lte: newEndDate } }],
              },
            ],
          },
        });

        if (overlappingBookings.length > 0) {
          throw new Error('Vehicle is not available for the new dates');
        }

        // Recalculate pricing if dates changed
        if (updateData.startDate && updateData.endDate) {
          const pricing = calculateBookingPrice(
            existingBooking.vehicle.dailyRate,
            newStartDate,
            newEndDate
          );

          // Create update object with pricing data
          const pricingUpdate = {
            totalDays: pricing.totalDays,
            subtotal: pricing.subtotal,
            serviceFee: pricing.serviceFee,
            taxAmount: pricing.taxAmount,
            totalAmount: pricing.totalAmount,
          };

          // Merge with existing update data
          Object.assign(updateData, pricingUpdate);
        }
      }

      // Update booking
      const updatedBooking = await (tx as any).booking.update({
        where: { id },
        data: {
          ...updateData,
          startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
          endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
          confirmedAt: updateData.status === 'CONFIRMED' ? new Date() : undefined,
          cancelledAt: updateData.status === 'CANCELLED' ? new Date() : undefined,
          completedAt: updateData.status === 'COMPLETED' ? new Date() : undefined,
        },
        include: {
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              plateNumber: true,
              dailyRate: true,
              locationAddress: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      return updatedBooking;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Update booking error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to update booking';

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
