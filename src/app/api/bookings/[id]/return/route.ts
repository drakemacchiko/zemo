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
const returnDataSchema = z.object({
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
    .min(4, 'At least 4 photos required for return inspection'),
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

// Enhanced damage scoring for return inspection
function calculateDamageScoring(damages: any[], pickupDamages: any[] = []) {
  let totalDamageScore = 0;
  let totalEstimatedCost = 0;
  let newDamages = 0;

  for (const damage of damages) {
    // Check if this is a new damage (not present in pickup)
    const isNewDamage = !pickupDamages.some(
      pd =>
        pd.location === damage.location &&
        pd.category === damage.category &&
        pd.severity === damage.severity
    );

    if (isNewDamage) {
      newDamages++;
    }

    // Calculate score with higher penalty for new damages
    let score = 0;
    switch (damage.severity) {
      case 'minor':
        score = isNewDamage ? 2 : 1;
        break;
      case 'moderate':
        score = isNewDamage ? 6 : 3;
        break;
      case 'major':
        score = isNewDamage ? 10 : 5;
        break;
    }

    // Adjust score based on category
    switch (damage.category) {
      case 'mechanical':
      case 'electrical':
        score *= isNewDamage ? 3 : 2;
        break;
      case 'missing_part':
        score *= isNewDamage ? 2.5 : 1.5;
        break;
    }

    totalDamageScore += score;

    // Calculate estimated cost
    if (damage.estimatedCost) {
      totalEstimatedCost += damage.estimatedCost;
    } else {
      // Enhanced estimation for return inspection
      let estimatedCost = 0;
      switch (damage.category) {
        case 'scratch':
          estimatedCost =
            damage.severity === 'minor' ? 75 : damage.severity === 'moderate' ? 200 : 500;
          break;
        case 'dent':
          estimatedCost =
            damage.severity === 'minor' ? 150 : damage.severity === 'moderate' ? 400 : 1000;
          break;
        case 'crack':
          estimatedCost =
            damage.severity === 'minor' ? 120 : damage.severity === 'moderate' ? 350 : 800;
          break;
        case 'missing_part':
          estimatedCost =
            damage.severity === 'minor' ? 300 : damage.severity === 'moderate' ? 750 : 1500;
          break;
        case 'stain':
          estimatedCost =
            damage.severity === 'minor' ? 50 : damage.severity === 'moderate' ? 120 : 300;
          break;
        case 'mechanical':
          estimatedCost =
            damage.severity === 'minor' ? 500 : damage.severity === 'moderate' ? 1200 : 3000;
          break;
        case 'electrical':
          estimatedCost =
            damage.severity === 'minor' ? 300 : damage.severity === 'moderate' ? 800 : 2000;
          break;
        default:
          estimatedCost =
            damage.severity === 'minor' ? 100 : damage.severity === 'moderate' ? 300 : 600;
      }

      // Premium for new damages
      if (isNewDamage) {
        estimatedCost *= 1.5;
      }

      totalEstimatedCost += estimatedCost;
    }
  }

  return {
    totalDamageScore,
    totalEstimatedCost,
    newDamages,
  };
}

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
    const validatedData = returnDataSchema.parse(body);

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
        { error: 'Not authorized to perform return for this booking' },
        { status: 403 }
      );
    }

    // Check booking status
    if (booking.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          error: 'Booking must be active before return can be performed',
        },
        { status: 400 }
      );
    }

    // Check if return already exists
    const existingReturn = await prisma.vehicleInspection.findFirst({
      where: {
        bookingId: bookingId,
        inspectionType: 'RETURN',
      },
    });

    if (existingReturn) {
      return NextResponse.json(
        {
          error: 'Return inspection already completed',
        },
        { status: 400 }
      );
    }

    // Get pickup inspection for comparison
    const pickupInspection = await prisma.vehicleInspection.findFirst({
      where: {
        bookingId: bookingId,
        inspectionType: 'PICKUP',
      },
      include: {
        damageItems: true,
      },
    });

    if (!pickupInspection) {
      return NextResponse.json(
        {
          error: 'Pickup inspection must be completed before return',
        },
        { status: 400 }
      );
    }

    // Calculate damage score and cost with comparison to pickup
    const damages = validatedData.damages || [];
    const pickupDamages = pickupInspection.damageItems || [];

    const damageAssessment = calculateDamageScoring(damages, pickupDamages);

    // Calculate mileage difference
    const mileageDifference = validatedData.mileage - pickupInspection.mileage;
    if (mileageDifference < 0) {
      return NextResponse.json(
        {
          error: 'Return mileage cannot be less than pickup mileage',
        },
        { status: 400 }
      );
    }

    // Create return inspection record
    const returnInspection = await prisma.vehicleInspection.create({
      data: {
        bookingId: bookingId,
        vehicleId: booking.vehicleId,
        inspectorId: user.id,
        inspectionType: 'RETURN',
        mileage: validatedData.mileage,
        fuelLevel: validatedData.fuelLevel * 100, // Convert to percentage
        notes: validatedData.inspectionNotes || null,
        overallCondition:
          damageAssessment.totalDamageScore === 0
            ? 'EXCELLENT'
            : damageAssessment.totalDamageScore <= 3
              ? 'GOOD'
              : damageAssessment.totalDamageScore <= 8
                ? 'FAIR'
                : damageAssessment.totalDamageScore <= 15
                  ? 'POOR'
                  : 'DAMAGED',
        damageScore: damageAssessment.totalDamageScore,
        estimatedRepairCost: damageAssessment.totalEstimatedCost,
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

    // Calculate deposit adjustment
    let depositAdjustment = 0;
    let adjustmentReason = '';

    // Base penalty for mileage (if excessive)
    const maxDailyMileage = 300; // km per day
    const expectedMileage = booking.totalDays * maxDailyMileage;
    const excessMileage = Math.max(0, mileageDifference - expectedMileage);
    const mileagePenalty = excessMileage * 0.5; // 50 cents per excess km

    // Fuel penalty (if not returned with adequate fuel)
    const pickupFuelLevel = pickupInspection.fuelLevel / 100;
    const returnFuelLevel = validatedData.fuelLevel;
    const fuelDifference = Math.max(0, pickupFuelLevel - returnFuelLevel);
    const fuelPenalty = fuelDifference * 100; // Arbitrary fuel cost

    // Damage penalty
    const damagePenalty = damageAssessment.totalEstimatedCost;

    depositAdjustment = mileagePenalty + fuelPenalty + damagePenalty;

    if (depositAdjustment > 0) {
      adjustmentReason = [
        mileagePenalty > 0 ? `Excess mileage: ${excessMileage}km` : '',
        fuelPenalty > 0 ? `Fuel difference: ${(fuelDifference * 100).toFixed(1)}%` : '',
        damagePenalty > 0 ? `New damages: ${damageAssessment.newDamages} items` : '',
      ]
        .filter(Boolean)
        .join(', ');

      // Create deposit adjustment record
      await prisma.depositAdjustment.create({
        data: {
          bookingId: bookingId,
          returnInspectionId: returnInspection.id,
          originalDeposit: booking.securityDeposit,
          damageCharges: damagePenalty,
          fuelCharges: fuelPenalty,
          otherCharges: excessMileage > 0 ? excessMileage * 0.5 : 0, // 50c per excess km
          adjustmentAmount: depositAdjustment,
          finalDepositReturn: Math.max(0, booking.securityDeposit - depositAdjustment),
          status: 'PENDING',
          justification: adjustmentReason,
        },
      });
    }

    // Update booking status to 'completed'
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Return inspection completed successfully',
      inspection: returnInspection,
      damageScore: damageAssessment.totalDamageScore,
      estimatedCost: damageAssessment.totalEstimatedCost,
      newDamages: damageAssessment.newDamages,
      mileageDifference,
      depositAdjustment:
        depositAdjustment > 0
          ? {
              amount: Math.min(depositAdjustment, booking.securityDeposit),
              reason: adjustmentReason,
              breakdown: {
                mileagePenalty,
                fuelPenalty,
                damagePenalty,
              },
            }
          : null,
    });
  } catch (error) {
    console.error('Return inspection error:', error);

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
        error: 'Failed to complete return inspection',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve return inspection details
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
        { error: 'Not authorized to view this return inspection' },
        { status: 403 }
      );
    }

    // Get return inspection
    const returnInspection = await prisma.vehicleInspection.findFirst({
      where: {
        bookingId: bookingId,
        inspectionType: 'RETURN',
      },
      include: {
        photos: true,
        damageItems: true,
      },
    });

    if (!returnInspection) {
      return NextResponse.json({ error: 'Return inspection not found' }, { status: 404 });
    }

    // Get deposit adjustments if any
    const depositAdjustments = await prisma.depositAdjustment.findMany({
      where: {
        bookingId: bookingId,
      },
    });

    return NextResponse.json({
      inspection: returnInspection,
      depositAdjustments,
    });
  } catch (error) {
    console.error('Get return inspection error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve return inspection',
      },
      { status: 500 }
    );
  }
}
