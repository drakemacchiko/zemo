import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { adminVehicleActionSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'

// PUT /api/admin/vehicles/[id]/verify - Admin verify/reject vehicle
async function handlePut(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // TODO: Add proper admin role check
    // For now, any authenticated user can perform admin actions
    // In production, add role-based access control

    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const vehicleId = pathSegments[pathSegments.indexOf('vehicles') + 1]

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

    // TODO: Send notification to vehicle owner about verification status

    return NextResponse.json({
      message: `Vehicle ${validatedAction.action.toLowerCase()}d successfully`,
      vehicle: updatedVehicle,
      adminAction: {
        action: validatedAction.action,
        reason: validatedAction.reason,
        performedBy: request.user.id,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Admin verification error:', error)
    
    if (error instanceof Error && error.message.includes('Validation error')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process admin action' },
      { status: 500 }
    )
  }
}

// GET /api/admin/vehicles - Get all vehicles for admin review
async function handleGet(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // TODO: Add proper admin role check

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (status !== 'ALL') {
      where.verificationStatus = status
    }

    const [vehicles, total] = await Promise.all([
      (prisma as any).vehicle.findMany({
        where,
        skip,
        take: limit,
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
          photos: {
            where: { isPrimary: true },
            take: 1,
          },
          documents: {
            select: {
              id: true,
              documentType: true,
              verificationStatus: true,
            },
          },
        },
        orderBy: [
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
      filters: { status },
    })
  } catch (error) {
    console.error('Admin vehicles fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicles for review' },
      { status: 500 }
    )
  }
}

export const PUT = withAuth(handlePut)
export const GET = withAuth(handleGet)