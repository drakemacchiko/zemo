import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'plateNumber',
      'make',
      'model',
      'year',
      'transmission',
      'fuelType',
      'seatingCapacity',
      'color',
      'currentMileage',
      'vehicleType',
      'locationAddress',
      'dailyRate',
      'securityDeposit',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Create vehicle listing
    const vehicle = await prisma.vehicle.create({
      data: {
        hostId: userId,

        // Basic details
        vin: body.vin || null,
        plateNumber: body.plateNumber,
        registrationNumber: body.registrationNumber || null,
        year: parseInt(body.year),
        make: body.make,
        model: body.model,
        trim: body.trim || null,
        engineNumber: body.engineNumber || null,
        chassisNumber: body.chassisNumber || null,
        color: body.color,
        transmission: body.transmission,
        fuelType: body.fuelType,
        seatingCapacity: parseInt(body.seatingCapacity),
        numberOfDoors: body.numberOfDoors ? parseInt(body.numberOfDoors) : null,
        currentMileage: parseInt(body.currentMileage),

        // Category & Type
        vehicleCategory: body.vehicleCategory || null,
        vehicleType: body.vehicleType,
        features: body.features || [],

        // Location
        locationAddress: body.locationAddress,
        locationCity: body.locationCity || null,
        locationProvince: body.locationProvince || null,
        locationPostalCode: body.locationPostalCode || null,
        locationLatitude: body.locationLatitude || 0,
        locationLongitude: body.locationLongitude || 0,
        hideExactLocation: body.hideExactLocation !== false,

        // Delivery
        deliveryAvailable: body.deliveryAvailable || false,
        deliveryRadius: body.deliveryRadius ? parseInt(body.deliveryRadius) : null,
        deliveryFeePerKm: body.deliveryFeePerKm ? parseFloat(body.deliveryFeePerKm) : null,
        airportDelivery: body.airportDelivery || false,
        airportDeliveryFee: body.airportDeliveryFee ? parseFloat(body.airportDeliveryFee) : null,
        pickupInstructions: body.pickupInstructions || null,

        // Availability
        alwaysAvailable: body.alwaysAvailable !== false,
        advanceNoticeHours: body.advanceNoticeHours || 24,
        shortestTripDuration: body.shortestTripDuration || 1,
        longestTripDuration: body.longestTripDuration ? parseInt(body.longestTripDuration) : null,
        instantBooking: body.instantBooking || false,
        minRenterRating: body.minRenterRating ? parseFloat(body.minRenterRating) : null,
        minRenterTrips: body.minRenterTrips ? parseInt(body.minRenterTrips) : null,
        requireVerifiedLicense: body.requireVerifiedLicense !== false,

        // Pricing
        dailyRate: parseFloat(body.dailyRate),
        hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
        weeklyDiscount: body.weeklyDiscount ? parseFloat(body.weeklyDiscount) : null,
        monthlyDiscount: body.monthlyDiscount ? parseFloat(body.monthlyDiscount) : null,
        weekendPricing: body.weekendPricing ? parseFloat(body.weekendPricing) : null,
        securityDeposit: parseFloat(body.securityDeposit),
        mileageAllowance: body.mileageAllowance ? parseInt(body.mileageAllowance) : null,
        extraMileageFee: body.extraMileageFee ? parseFloat(body.extraMileageFee) : null,
        fuelPolicy: body.fuelPolicy || null,
        lateReturnFee: body.lateReturnFee ? parseFloat(body.lateReturnFee) : null,
        cleaningFee: body.cleaningFee ? parseFloat(body.cleaningFee) : null,

        // Insurance
        insurancePolicyNumber: body.insurancePolicyNumber || null,
        insuranceCoverage: body.insuranceCoverage || null,

        // Rules
        minDriverAge: body.minDriverAge || 21,
        minDrivingExperience: body.minDrivingExperience || 2,
        additionalDriverFee: body.additionalDriverFee ? parseFloat(body.additionalDriverFee) : null,
        smokingAllowed: body.smokingAllowed || false,
        smokingFee: body.smokingFee ? parseFloat(body.smokingFee) : null,
        petsAllowed: body.petsAllowed || false,
        petFee: body.petFee ? parseFloat(body.petFee) : null,
        usageRestrictions: body.usageRestrictions || [],
        customRules: body.customRules || null,

        // Description
        title: body.title || `${body.year} ${body.make} ${body.model}`,
        description: body.description || null,

        // Status
        listingStatus: 'DRAFT',
        verificationStatus: 'PENDING',
        availabilityStatus: 'AVAILABLE',
        isActive: false,
      },
      include: {
        host: {
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

    return NextResponse.json(
      {
        success: true,
        vehicle: {
          id: vehicle.id,
          plateNumber: vehicle.plateNumber,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          status: vehicle.listingStatus,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating vehicle listing:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A vehicle with this license plate already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Failed to create vehicle listing' }, { status: 500 });
  }
}

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

    // Get host's vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: {
        hostId: userId,
      },
      include: {
        photos: {
          where: {
            isPrimary: true,
          },
          take: 1,
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      vehicles: vehicles.map(vehicle => ({
        id: vehicle.id,
        plateNumber: vehicle.plateNumber,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        dailyRate: vehicle.dailyRate,
        status: vehicle.listingStatus,
        verificationStatus: vehicle.verificationStatus,
        availabilityStatus: vehicle.availabilityStatus,
        isActive: vehicle.isActive,
        totalTrips: vehicle._count.bookings,
        averageRating: vehicle.averageRating,
        monthlyEarnings: vehicle.monthlyEarnings,
        photo: vehicle.photos[0]?.photoUrl || null,
      })),
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}
