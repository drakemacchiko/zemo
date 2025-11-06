import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { adminVehicleActionSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'

// PUT /api/admin/vehicles/[id] - Admin verify/reject specific vehicle
async function handlePut(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const vehicleId = pathSegments[pathSegments.length - 1]

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedAction = adminVehicleActionSchema.parse(body)

    const vehicle = await (prisma as any).vehicle.findUnique({
      where: { id: vehicleId },
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    const newStatus = validatedAction.action === 'APPROVE' ? 'VERIFIED' : 'REJECTED'
    
    const updatedVehicle = await (prisma as any).vehicle.update({
      where: { id: vehicleId },
      data: { verificationStatus: newStatus },
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
      message: `Vehicle ${validatedAction.action.toLowerCase()}d successfully`,
      vehicle: updatedVehicle,
    })
  } catch (error) {
    console.error('Admin action error:', error)
    return NextResponse.json(
      { error: 'Failed to process admin action' },
      { status: 500 }
    )
  }
}

export const PUT = withAuth(handlePut)