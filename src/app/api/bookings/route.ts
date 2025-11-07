import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { 
  bookingCreateSchema, 
  bookingSearchSchema,
  type BookingCreateInput,
  type BookingSearchInput 
} from '@/lib/validations';
import { 
  calculateBookingPrice, 
  generateConfirmationNumber 
} from '@/lib/utils';

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
    select: { id: true }
  });
  
  if (!user) {
    return { success: false, userId: null };
  }
  
  return { success: true, userId: user.id };
}

/**
 * POST /api/bookings - Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = bookingCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const bookingData: BookingCreateInput = validationResult.data;
    const userId = authResult.userId;

    // Use database transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Check if vehicle exists and is available
      const vehicle = await tx.vehicle.findUnique({
        where: { 
          id: bookingData.vehicleId,
          isActive: true,
          availabilityStatus: 'AVAILABLE',
          verificationStatus: 'VERIFIED'
        },
        include: {
          host: {
            select: { id: true, email: true }
          }
        }
      });

      if (!vehicle) {
        throw new Error('Vehicle not found or not available');
      }

      // Prevent self-booking
      if (vehicle.hostId === userId) {
        throw new Error('You cannot book your own vehicle');
      }

      // Check for overlapping bookings
      const overlappingBookings = await tx.booking.findMany({
        where: {
          vehicleId: bookingData.vehicleId,
          status: {
            in: ['PENDING', 'CONFIRMED', 'ACTIVE']
          },
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(bookingData.startDate) } },
                { endDate: { gt: new Date(bookingData.startDate) } }
              ]
            },
            {
              AND: [
                { startDate: { lt: new Date(bookingData.endDate) } },
                { endDate: { gte: new Date(bookingData.endDate) } }
              ]
            },
            {
              AND: [
                { startDate: { gte: new Date(bookingData.startDate) } },
                { endDate: { lte: new Date(bookingData.endDate) } }
              ]
            }
          ]
        }
      });

      if (overlappingBookings.length > 0) {
        throw new Error('Vehicle is not available for the selected dates');
      }

      // Calculate pricing
      const pricing = calculateBookingPrice(
        vehicle.dailyRate,
        bookingData.startDate,
        bookingData.endDate
      );

      // Generate confirmation number
      const confirmationNumber = generateConfirmationNumber();

      // Create booking
      const booking = await tx.booking.create({
        data: {
          userId,
          vehicleId: bookingData.vehicleId,
          hostId: vehicle.hostId,
          startDate: new Date(bookingData.startDate),
          endDate: new Date(bookingData.endDate),
          dailyRate: vehicle.dailyRate,
          totalDays: pricing.totalDays,
          subtotal: pricing.subtotal,
          serviceFee: pricing.serviceFee,
          taxAmount: pricing.taxAmount,
          totalAmount: pricing.totalAmount,
          securityDeposit: vehicle.securityDeposit,
          confirmationNumber,
          pickupLocation: bookingData.pickupLocation || null,
          dropoffLocation: bookingData.dropoffLocation || null,
          specialRequests: bookingData.specialRequests || null,
          status: 'PENDING'
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
              locationAddress: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      return booking;
    });

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 });

  } catch (error) {
    console.error('Booking creation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings - Get user's bookings with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters with proper type conversion
    const rawParams = Object.fromEntries(searchParams.entries());
    const queryParams: any = { ...rawParams };
    
    // Convert page and limit to numbers if they exist
    if (queryParams.page) {
      queryParams.page = parseInt(queryParams.page as string, 10);
    }
    if (queryParams.limit) {
      queryParams.limit = parseInt(queryParams.limit as string, 10);
    }

    // Validate query parameters
    const validationResult = bookingSearchSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const searchData: BookingSearchInput = validationResult.data;
    const userId = authResult.userId;

    // Build where clause
    const where: any = {
      userId // Only user's own bookings
    };

    if (searchData.status) {
      where.status = searchData.status;
    }

    if (searchData.vehicleId) {
      where.vehicleId = searchData.vehicleId;
    }

    if (searchData.startDate) {
      where.startDate = { gte: new Date(searchData.startDate) };
    }

    if (searchData.endDate) {
      where.endDate = { lte: new Date(searchData.endDate) };
    }

    // Calculate pagination
    const skip = (searchData.page - 1) * searchData.limit;

    // Get bookings with pagination
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
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
              photos: {
                where: { isPrimary: true },
                select: { photoUrl: true },
                take: 1
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: searchData.limit
      }),
      prisma.booking.count({ where })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / searchData.limit);
    const hasNext = searchData.page < totalPages;
    const hasPrev = searchData.page > 1;

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page: searchData.page,
        limit: searchData.limit,
        total: totalCount,
        totalPages,
        hasNext,
        hasPrev
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}