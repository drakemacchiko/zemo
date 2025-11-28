import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAccessToken(token)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const hostId = payload.userId
    const bookingId = params.id

    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json(
        { error: 'Decline reason is required' },
        { status: 400 }
      )
    }

    // Verify booking exists and belongs to host's vehicle
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        vehicle: {
          hostId
        },
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true
              }
            }
          }
        },
        vehicle: {
          select: {
            make: true,
            model: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or already processed' },
        { status: 404 }
      )
    }

    // Update booking status to cancelled
    // TODO: Store decline reason in a separate CancellationReason model
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED'
      }
    })

    // TODO: Send notification email/SMS to renter
    // Notify renter at booking.user.email with reason: reason

    // TODO: Process refund if payment was already captured
    // For most platforms, payments are only captured after host accepts

    return NextResponse.json({
      message: 'Booking declined successfully',
      booking: updatedBooking
    })
  } catch (error) {
    console.error('Error declining booking:', error)
    return NextResponse.json(
      { error: 'Failed to decline booking' },
      { status: 500 }
    )
  }
}
