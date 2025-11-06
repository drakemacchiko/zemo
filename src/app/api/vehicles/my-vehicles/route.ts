import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/db'

// GET /api/vehicles/my-vehicles - Get current user's vehicles
async function handleGet(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const vehicles = await (prisma as any).vehicle.findMany({
      where: { hostId: request.user.id },
      include: {
        photos: {
          orderBy: [
            { isPrimary: 'desc' },
            { uploadDate: 'desc' },
          ],
        },
        documents: {
          select: {
            id: true,
            documentType: true,
            verificationStatus: true,
            expiryDate: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    })

    // Parse features from JSON for each vehicle
    const vehiclesWithFeatures = vehicles.map((vehicle: any) => ({
      ...vehicle,
      features: vehicle.features ? JSON.parse(vehicle.features) : [],
    }))

    return NextResponse.json({
      vehicles: vehiclesWithFeatures,
      total: vehicles.length,
    })
  } catch (error) {
    console.error('My vehicles fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch your vehicles' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGet)