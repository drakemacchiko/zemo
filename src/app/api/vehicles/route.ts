import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { vehicleCreateSchema, vehicleSearchSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'
import { ZodError } from 'zod'

// GET /api/vehicles - Search and list vehicles
async function handleGet(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchQuery = Object.fromEntries(searchParams.entries())
    
    // Convert string parameters to appropriate types
    const queryParams = {
      ...searchQuery,
      minDailyRate: searchQuery.minDailyRate ? parseFloat(searchQuery.minDailyRate) : undefined,
      maxDailyRate: searchQuery.maxDailyRate ? parseFloat(searchQuery.maxDailyRate) : undefined,
      minSeatingCapacity: searchQuery.minSeatingCapacity ? parseInt(searchQuery.minSeatingCapacity) : undefined,
      locationLatitude: searchQuery.locationLatitude ? parseFloat(searchQuery.locationLatitude) : undefined,
      locationLongitude: searchQuery.locationLongitude ? parseFloat(searchQuery.locationLongitude) : undefined,
      radius: searchQuery.radius ? parseFloat(searchQuery.radius) : 50,
      page: searchQuery.page ? parseInt(searchQuery.page) : 1,
      limit: searchQuery.limit ? parseInt(searchQuery.limit) : 20,
    }

    const validatedQuery = vehicleSearchSchema.parse(queryParams)
    const { page, limit, locationLatitude, locationLongitude, radius, ...filters } = validatedQuery

    // Build where clause
    const where: any = {
      isActive: true,
      availabilityStatus: 'AVAILABLE',
      verificationStatus: {
        in: ['VERIFIED', 'PENDING'] // Allow both VERIFIED and PENDING for testing
      },
    }

    // Add filters
    if (filters.make) where.make = { contains: filters.make, mode: 'insensitive' }
    if (filters.model) where.model = { contains: filters.model, mode: 'insensitive' }
    if (filters.vehicleType) where.vehicleType = filters.vehicleType
    if (filters.transmission) where.transmission = filters.transmission
    if (filters.fuelType) where.fuelType = filters.fuelType
    if (filters.minSeatingCapacity) where.seatingCapacity = { gte: filters.minSeatingCapacity }
    if (filters.minDailyRate || filters.maxDailyRate) {
      where.dailyRate = {}
      if (filters.minDailyRate) where.dailyRate.gte = filters.minDailyRate
      if (filters.maxDailyRate) where.dailyRate.lte = filters.maxDailyRate
    }

    // TODO: Add location-based filtering using geographic distance
    // For now, we'll implement basic lat/lng filtering
    if (locationLatitude && locationLongitude) {
      const latRange = radius / 111.32 // Approximate km to degrees conversion
      const lngRange = radius / (111.32 * Math.cos(locationLatitude * Math.PI / 180))
      
      where.locationLatitude = {
        gte: locationLatitude - latRange,
        lte: locationLatitude + latRange,
      }
      where.locationLongitude = {
        gte: locationLongitude - lngRange,
        lte: locationLongitude + lngRange,
      }
    }

    const skip = (page - 1) * limit

    const [vehicles, total] = await Promise.all([
      (prisma as any).vehicle.findMany({
        where,
        skip,
        take: limit,
        include: {
          host: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
          photos: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        orderBy: [
          { verificationStatus: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      (prisma as any).vehicle.count({ where }),
    ])

    return NextResponse.json({
      vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: validatedQuery,
    })
  } catch (error) {
    console.error('Vehicle search error:', error)
    return NextResponse.json(
      { error: 'Failed to search vehicles' },
      { status: 500 }
    )
  }
}

// POST /api/vehicles - Create new vehicle listing
async function handlePost(request: AuthenticatedRequest) {
  try {
    const body = await request.json()
    const validatedData = vehicleCreateSchema.parse(body)

    // Check if plate number already exists
    const existingVehicle = await (prisma as any).vehicle.findUnique({
      where: { plateNumber: validatedData.plateNumber },
    })

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle with this plate number already exists' },
        { status: 400 }
      )
    }

    // Ensure user is authenticated for creating vehicles
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required to create vehicle listing' },
        { status: 401 }
      )
    }

    // Ensure user is authenticated for creating vehicles
    // Optional dev/test bypass: set ALLOW_UNVERIFIED_LISTING=true in your env to skip driving license check
    const allowUnverified = process.env.ALLOW_UNVERIFIED_LISTING === 'true'

    // Verify user has a verified driving license (skip if allowUnverified)
    if (!allowUnverified) {
      const userWithLicense = await (prisma as any).user.findUnique({
        where: { id: request.user.id },
        include: { drivingLicense: true },
      })

      if (!userWithLicense?.drivingLicense || userWithLicense.drivingLicense.verificationStatus !== 'VERIFIED') {
        return NextResponse.json(
          { error: 'Verified driving license required to list a vehicle' },
          { status: 400 }
        )
      }
    } else {
      console.warn('ALLOW_UNVERIFIED_LISTING is enabled — skipping driving license verification for vehicle creation')
    }

    const vehicle = await (prisma as any).vehicle.create({
      data: {
        ...validatedData,
        hostId: request.user.id,
        features: validatedData.features ? JSON.stringify(validatedData.features) : null,
      },
      include: {
        host: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Vehicle listed successfully. Pending verification.',
      vehicle,
    }, { status: 201 })
  } catch (error) {
    console.error('Vehicle creation error:', error)

    // If validation failed, return a 400 with details
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to create vehicle listing' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create vehicle listing' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGet, { requireAuth: false })
export const POST = withAuth(handlePost)