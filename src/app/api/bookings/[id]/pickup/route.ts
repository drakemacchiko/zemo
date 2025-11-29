import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAccessToken, extractTokenFromRequest } from '@/lib/auth';
import { z } from 'zod';

/**
 * Verify authentication token and return user info
 */
async function verifyAuthToken(request: NextRequest) {
  const token = extractTokenFromRequest(request);

  if (!token) {
    return null;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return null;
  }

  // Verify user exists and get full user info
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
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
  });

  return user;
}

// Validation schemas
const pickupDataSchema = z.object({
  mileage: z.number().positive('Mileage must be positive'),
  fuelLevel: z.number().min(0).max(1, 'Fuel level must be between 0 and 1'),
  inspectionNotes: z.string().optional(),
  photos: z
    .array(
      z.object({
        url: z.string().url('Must be a valid URL'),
        category: z.enum([
          'exterior_front',
          'exterior_back',
          'exterior_left',
          'exterior_right',
          'interior',
          'dashboard',
          'damage',
          'other',
        ]),
        description: z.string().optional(),
      })
    )
    .min(4, 'At least 4 photos required for pickup inspection'),
  damages: z
    .array(
      z.object({
        category: z.enum([
          'scratch',
          'dent',
          'crack',
          'missing_part',
          'stain',
          'mechanical',
          'electrical',
          'other',
        ]),
        severity: z.enum(['minor', 'moderate', 'major']),
        location: z.string(),
        description: z.string(),
        estimatedCost: z.number().min(0).optional(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate the request
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = params.id;

    // Validate request body
    const body = await request.json();
    const validatedData = pickupDataSchema.parse(body);

    // Get the booking and verify permissions
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: {
          include: {
            host: true,
          },
        },
        user: true, // This is the renter
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized (host or renter)
    const isHost = booking.vehicle.hostId === user.id;
    const isRenter = booking.userId === user.id;

    if (!isHost && !isRenter) {
      return NextResponse.json(
        { error: 'Not authorized to perform pickup for this booking' },
        { status: 403 }
      );
    }

    // Check booking status
    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        {
          error: 'Booking must be confirmed before pickup can be performed',
        },
        { status: 400 }
      );
    }

    // Check if pickup already exists
    const existingPickup = await prisma.vehicleInspection.findFirst({
      where: {
        bookingId: bookingId,
        inspectionType: 'PICKUP',
      },
    });

    if (existingPickup) {
      return NextResponse.json(
        {
          error: 'Pickup inspection already completed',
        },
        { status: 400 }
      );
    }

    // Calculate damage score and total estimated cost
    const damages = validatedData.damages || [];
    let totalDamageScore = 0;
    let totalEstimatedCost = 0;

    for (const damage of damages) {
      // Simple scoring algorithm
      let score = 0;
      switch (damage.severity) {
        case 'minor':
          score = 1;
          break;
        case 'moderate':
          score = 3;
          break;
        case 'major':
          score = 5;
          break;
      }

      // Adjust score based on category
      switch (damage.category) {
        case 'mechanical':
        case 'electrical':
          score *= 2; // More serious
          break;
        case 'missing_part':
          score *= 1.5;
          break;
      }

      totalDamageScore += score;

      // If estimated cost is provided, use it, otherwise estimate
      if (damage.estimatedCost) {
        totalEstimatedCost += damage.estimatedCost;
      } else {
        // Basic estimation based on category and severity
        let estimatedCost = 0;
        switch (damage.category) {
          case 'scratch':
            estimatedCost =
              damage.severity === 'minor' ? 50 : damage.severity === 'moderate' ? 150 : 400;
            break;
          case 'dent':
            estimatedCost =
              damage.severity === 'minor' ? 100 : damage.severity === 'moderate' ? 300 : 800;
            break;
          case 'crack':
            estimatedCost =
              damage.severity === 'minor' ? 80 : damage.severity === 'moderate' ? 250 : 600;
            break;
          case 'missing_part':
            estimatedCost =
              damage.severity === 'minor' ? 200 : damage.severity === 'moderate' ? 500 : 1000;
            break;
          case 'stain':
            estimatedCost =
              damage.severity === 'minor' ? 30 : damage.severity === 'moderate' ? 80 : 200;
            break;
          case 'mechanical':
            estimatedCost =
              damage.severity === 'minor' ? 300 : damage.severity === 'moderate' ? 800 : 2000;
            break;
          case 'electrical':
            estimatedCost =
              damage.severity === 'minor' ? 200 : damage.severity === 'moderate' ? 600 : 1500;
            break;
          default:
            estimatedCost =
              damage.severity === 'minor' ? 100 : damage.severity === 'moderate' ? 250 : 500;
        }
        totalEstimatedCost += estimatedCost;
      }
    }

    // Create pickup inspection record
    const pickup = await prisma.vehicleInspection.create({
      data: {
        bookingId: bookingId,
        vehicleId: booking.vehicleId,
        inspectorId: user.id,
        inspectionType: 'PICKUP',
        mileage: validatedData.mileage,
        fuelLevel: validatedData.fuelLevel * 100, // Convert to percentage
        notes: validatedData.inspectionNotes || null,
        overallCondition:
          totalDamageScore === 0
            ? 'EXCELLENT'
            : totalDamageScore <= 2
              ? 'GOOD'
              : totalDamageScore <= 5
                ? 'FAIR'
                : totalDamageScore <= 10
                  ? 'POOR'
                  : 'DAMAGED',
        damageScore: totalDamageScore,
        estimatedRepairCost: totalEstimatedCost,
        status: 'PENDING',
        photos: {
          create: validatedData.photos.map(photo => {
            // Map photo category to InspectionPhotoType enum
            let photoType: string = 'OTHER';
            switch (photo.category) {
              case 'exterior_front':
              case 'exterior_back':
              case 'exterior_left':
              case 'exterior_right':
                photoType = 'EXTERIOR_OVERVIEW';
                break;
              case 'interior':
                photoType = 'INTERIOR_OVERVIEW';
                break;
              case 'dashboard':
                photoType = 'DASHBOARD';
                break;
              case 'damage':
                photoType = 'DAMAGE_CLOSEUP';
                break;
              default:
                photoType = 'OTHER';
            }

            return {
              photoUrl: photo.url,
              photoType: photoType as any,
              viewAngle: photo.description || '',
              fileName: photo.url.split('/').pop() || 'unknown',
              fileSize: 0,
              mimeType: 'image/jpeg',
              isDamagePhoto: photo.category === 'damage',
              damageDescription: photo.category === 'damage' ? photo.description || null : null,
            };
          }),
        },
        damageItems: (damages.length > 0
          ? {
              create: damages.map(damage => ({
                category: damage.category,
                severity: damage.severity,
                location: damage.location,
                description: damage.description,
                estimatedCost: damage.estimatedCost || 0,
              })),
            }
          : undefined) as any,
      },
      include: {
        photos: true,
        damageItems: true,
      },
    });

    // Update booking status to 'active'
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Pickup inspection completed successfully',
      inspection: pickup,
      damageScore: totalDamageScore,
      estimatedCost: totalEstimatedCost,
    });
  } catch (error) {
    console.error('Pickup inspection error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to complete pickup inspection',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve pickup inspection details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = params.id;

    // Get the booking and verify permissions
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: {
          include: {
            host: true,
          },
        },
        user: true, // This is the renter
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized (host or renter)
    const isHost = booking.vehicle.hostId === user.id;
    const isRenter = booking.userId === user.id;

    if (!isHost && !isRenter) {
      return NextResponse.json(
        { error: 'Not authorized to view this pickup inspection' },
        { status: 403 }
      );
    }

    // Get pickup inspection
    const pickup = await prisma.vehicleInspection.findFirst({
      where: {
        bookingId: bookingId,
        inspectionType: 'PICKUP',
      },
      include: {
        photos: true,
        damageItems: true,
      },
    });

    if (!pickup) {
      return NextResponse.json({ error: 'Pickup inspection not found' }, { status: 404 });
    }

    return NextResponse.json({
      inspection: pickup,
    });
  } catch (error) {
    console.error('Get pickup inspection error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve pickup inspection',
      },
      { status: 500 }
    );
  }
}
