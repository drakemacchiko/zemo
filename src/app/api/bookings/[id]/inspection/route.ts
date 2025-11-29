import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const bookingId = params.id;
    const body = await request.json();
    const {
      inspectionType, // 'PRE_TRIP' or 'POST_TRIP'
      inspectorRole, // 'HOST' or 'RENTER'
      photos,
      fuelLevel,
      odometerReading,
      damageNotes,
    } = body;

    // Fetch booking to verify user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify user is either host or renter
    if (booking.userId !== userId && booking.vehicle.hostId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get or create rental agreement
    let agreement = await prisma.rentalAgreement.findUnique({
      where: { bookingId },
    });

    if (!agreement) {
      agreement = await prisma.rentalAgreement.create({
        data: {
          bookingId,
          vehicleId: booking.vehicleId,
          hostId: booking.vehicle.hostId,
          renterId: booking.userId,
          agreementTemplate: 'STANDARD_V1',
          agreementContent: 'Agreement content to be generated',
        },
      });
    }

    // Create or update inspection
    const existingInspection = await prisma.tripInspection.findFirst({
      where: {
        agreementId: agreement.id,
        inspectionType,
      },
    });

    let inspection;
    if (existingInspection) {
      // Update existing inspection
      const updateData: any = {
        photos: JSON.stringify(photos),
        fuelLevel,
        odometerReading,
        notes: damageNotes,
        damageDescription: damageNotes,
        updatedAt: new Date(),
      };

      // Update signatures based on role
      if (inspectorRole === 'HOST') {
        updateData.hostSignedAt = new Date();
        updateData.hostSigned = true;
      } else {
        updateData.renterSignedAt = new Date();
        updateData.renterSigned = true;
      }

      inspection = await prisma.tripInspection.update({
        where: { id: existingInspection.id },
        data: updateData,
      });
    } else {
      // Create new inspection
      // TODO: Map checklistItems array to individual schema fields
      // For now, create with default values for required fields
      const createData: any = {
        agreementId: agreement.id,
        inspectionType,
        // Required exterior condition fields
        frontBumper: 'GOOD',
        rearBumper: 'GOOD',
        hood: 'GOOD',
        roof: 'GOOD',
        leftDoor: 'GOOD',
        rightDoor: 'GOOD',
        windows: 'GOOD',
        lights: 'GOOD',
        mirrors: 'GOOD',
        tires: 'GOOD',
        // Required interior condition fields
        seats: 'GOOD',
        dashboard: 'GOOD',
        steeringWheel: 'GOOD',
        floorMats: 'GOOD',
        trunk: 'GOOD',
        // Required functional checks
        airConditioning: true,
        allLights: true,
        wipers: true,
        horn: true,
        locks: true,
        // Readings
        fuelLevel,
        odometerReading,
        cleanliness: 5,
        photos: JSON.stringify(photos),
        notes: damageNotes,
        damageDescription: damageNotes,
      };

      if (inspectorRole === 'HOST') {
        createData.hostSignedAt = new Date();
        createData.hostSigned = true;
        createData.renterSigned = false;
      } else {
        createData.renterSignedAt = new Date();
        createData.renterSigned = true;
        createData.hostSigned = false;
      }

      inspection = await prisma.tripInspection.create({
        data: createData,
      });
    }

    return NextResponse.json({
      success: true,
      inspection,
    });
  } catch (error) {
    console.error('Error saving inspection:', error);
    return NextResponse.json({ error: 'Failed to save inspection' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const bookingId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const inspectionType = searchParams.get('type');

    // Get rental agreement for this booking
    const agreement = await prisma.rentalAgreement.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            vehicle: true,
            user: {
              include: { profile: true },
            },
          },
        },
      },
    });

    if (!agreement) {
      return NextResponse.json({ inspections: [] });
    }

    const where: any = { agreementId: agreement.id };
    if (inspectionType) {
      where.inspectionType = inspectionType;
    }

    const inspections = await prisma.tripInspection.findMany({
      where,
      include: {
        agreement: {
          include: {
            booking: {
              include: {
                vehicle: true,
                user: {
                  include: { profile: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ inspections });
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return NextResponse.json({ error: 'Failed to fetch inspections' }, { status: 500 });
  }
}
