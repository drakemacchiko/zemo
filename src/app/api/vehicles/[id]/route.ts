import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { vehicleUpdateSchema, adminVehicleActionSchema } from '@/lib/validations'
import { prisma } from '@/lib/db'

// GET /api/vehicles/[id] - Get vehicle details
async function handleGet(request: AuthenticatedRequest) {
  try {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const vehicleId = pathSegments[pathSegments.length - 1]

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
                profilePictureUrl: true,
              },
            },
          },
        },
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
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Only show vehicles that are active and verified/pending (unless it's the owner)
    // Allow PENDING vehicles to be viewable publicly so search results and details match.
    const isOwner = request.user?.id === vehicle.hostId
    if (!isOwner && (!vehicle.isActive || !['VERIFIED', 'PENDING'].includes(vehicle.verificationStatus))) {
      return NextResponse.json(
        { error: 'Vehicle not available' },
        { status: 404 }
      )
    }

    // Parse features from JSON
    const vehicleWithFeatures = {
      ...vehicle,
      features: vehicle.features ? JSON.parse(vehicle.features as string) : [],
    }

    return NextResponse.json({ vehicle: vehicleWithFeatures })
  } catch (error) {
    console.error('Vehicle fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle details' },
      { status: 500 }
    )
  }
}

// PUT /api/vehicles/[id] - Update vehicle details
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
    
    // Check if this is an admin action
    if (body.action && ['APPROVE', 'REJECT'].includes(body.action)) {
      return handleAdminAction(vehicleId, body)
    }

    const validatedData = vehicleUpdateSchema.parse(body)

    // Verify ownership
    const existingVehicle = await (prisma as any).vehicle.findUnique({
      where: { id: vehicleId },
      select: { hostId: true, verificationStatus: true },
    })

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    if (existingVehicle.hostId !== request.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - not vehicle owner' },
        { status: 403 }
      )
    }

    // Prevent updates to verified vehicles without re-verification
    const baseUpdateData = {
      ...validatedData,
      features: validatedData.features ? JSON.stringify(validatedData.features) : undefined,
    }
    
    let updateData: any = baseUpdateData
    
    if (existingVehicle.verificationStatus === 'VERIFIED') {
      // Set back to pending if critical fields are changed
      const criticalFields = ['make', 'model', 'year', 'plateNumber']
      const hasCriticalChange = criticalFields.some(field => 
        validatedData[field as keyof typeof validatedData] !== undefined
      )
      
      if (hasCriticalChange) {
        updateData = { ...baseUpdateData, verificationStatus: 'PENDING' }
      }
    }

    const updatedVehicle = await (prisma as any).vehicle.update({
      where: { id: vehicleId },
      data: updateData,
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
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle,
    })
  } catch (error) {
    console.error('Vehicle update error:', error)
    
    if (error instanceof Error && error.message.includes('Validation error')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    )
  }
}

// DELETE /api/vehicles/[id] - Delete vehicle
async function handleDelete(request: AuthenticatedRequest) {
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

    // Verify ownership
    const existingVehicle = await (prisma as any).vehicle.findUnique({
      where: { id: vehicleId },
      select: { hostId: true },
    })

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    if (existingVehicle.hostId !== request.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - not vehicle owner' },
        { status: 403 }
      )
    }

    // TODO: Check if vehicle has active bookings before deletion
    // For now, we'll just soft-delete by setting isActive to false
    await (prisma as any).vehicle.update({
      where: { id: vehicleId },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'Vehicle listing deactivated successfully',
    })
  } catch (error) {
    console.error('Vehicle deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    )
  }
}

// Handle admin actions (approve/reject)
async function handleAdminAction(vehicleId: string, body: any) {
  try {
    // TODO: Add proper admin role check
    // For now, we'll create a simple admin endpoint
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
    
    await (prisma as any).vehicle.update({
      where: { id: vehicleId },
      data: { verificationStatus: newStatus },
    })

    return NextResponse.json({
      message: `Vehicle ${validatedAction.action.toLowerCase()}d successfully`,
      status: newStatus,
    })
  } catch (error) {
    console.error('Admin action error:', error)
    return NextResponse.json(
      { error: 'Failed to process admin action' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleGet, { requireAuth: false })
export const PUT = withAuth(handlePut)
export const DELETE = withAuth(handleDelete)