import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth'

// PUT /api/vehicles/[id]/extras/[extraId] - Update an extra
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; extraId: string } }
) {
  try {
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const { id: vehicleId, extraId } = params

    // Verify vehicle ownership
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    if (vehicle.hostId !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify extra belongs to vehicle
    const existingExtra = await prisma.vehicleExtra.findUnique({
      where: { id: extraId }
    })

    if (!existingExtra || existingExtra.vehicleId !== vehicleId) {
      return NextResponse.json({ error: 'Extra not found' }, { status: 404 })
    }

    const body = await request.json()
    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.priceType !== undefined) {
      if (!['PER_DAY', 'FLAT_FEE', 'PER_KM'].includes(body.priceType)) {
        return NextResponse.json({ error: 'Invalid price type' }, { status: 400 })
      }
      updateData.priceType = body.priceType
    }
    if (body.price !== undefined) updateData.price = parseFloat(body.price)
    if (body.available !== undefined) updateData.available = body.available
    if (body.quantity !== undefined) updateData.quantity = body.quantity
    if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl

    // Update the extra
    const updatedExtra = await prisma.vehicleExtra.update({
      where: { id: extraId },
      data: updateData
    })

    return NextResponse.json({ extra: updatedExtra })
  } catch (error) {
    console.error('Error updating extra:', error)
    return NextResponse.json(
      { error: 'Failed to update extra' },
      { status: 500 }
    )
  }
}

// DELETE /api/vehicles/[id]/extras/[extraId] - Delete an extra
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; extraId: string } }
) {
  try {
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const { id: vehicleId, extraId } = params

    // Verify vehicle ownership
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    if (vehicle.hostId !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify extra belongs to vehicle
    const existingExtra = await prisma.vehicleExtra.findUnique({
      where: { id: extraId }
    })

    if (!existingExtra || existingExtra.vehicleId !== vehicleId) {
      return NextResponse.json({ error: 'Extra not found' }, { status: 404 })
    }

    // Delete the extra
    await prisma.vehicleExtra.delete({
      where: { id: extraId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting extra:', error)
    return NextResponse.json(
      { error: 'Failed to delete extra' },
      { status: 500 }
    )
  }
}
