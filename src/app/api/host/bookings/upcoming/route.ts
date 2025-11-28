import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromRequest, verifyAccessToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
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
    const now = new Date()

    // Fetch confirmed bookings that haven't started yet
    const bookings = await prisma.booking.findMany({
      where: {
        vehicle: {
          hostId
        },
        status: 'CONFIRMED',
        startDate: {
          gt: now
        }
      },
      include: {
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
            plateNumber: true,
            photos: {
              where: { isPrimary: true },
              take: 1
            }
          }
        },
        user: {
          select: {
            email: true,
            phoneNumber: true,
            emailVerified: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                profilePictureUrl: true
              }
            }
          }
        },
        agreement: {
          select: {
            id: true,
            fullyExecuted: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    const formattedBookings = bookings.map((booking: any) => {
      const hoursUntilStart = Math.ceil(
        (new Date(booking.startDate).getTime() - now.getTime()) / (1000 * 60 * 60)
      )

      return {
        id: booking.id,
        vehicle: {
          make: booking.vehicle.make,
          model: booking.vehicle.model,
          year: booking.vehicle.year,
          photo: booking.vehicle.photos?.[0]?.photoUrl || null,
          licensePlate: booking.vehicle.plateNumber || 'N/A'
        },
        renter: {
          name: `${booking.user.profile?.firstName || 'User'} ${booking.user.profile?.lastName || ''}`,
          profilePicture: booking.user.profile?.profilePictureUrl || null,
          phone: booking.user.phoneNumber || '',
          email: booking.user.email,
          verified: booking.user.emailVerified || false
        },
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalAmount: booking.totalAmount,
        pickupLocation: booking.pickupLocation || 'To be confirmed',
        dropoffLocation: booking.dropoffLocation || 'To be confirmed',
        hasInsurance: false, // TODO: Check InsurancePolicy relation
        hasAgreementSigned: booking.agreement?.fullyExecuted || false,
        preInspectionCompleted: false, // TODO: Check TripInspection model when ready
        hoursUntilStart
      }
    })

    return NextResponse.json({ bookings: formattedBookings })
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upcoming bookings' },
      { status: 500 }
    )
  }
}
