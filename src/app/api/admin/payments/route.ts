import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request, 'VIEW_PAYMENTS')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            vehicle: {
              select: {
                make: true,
                model: true,
              },
            },
            user: {
              select: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Transform to include renter name
    const transformedPayments = payments.map(payment => ({
      ...payment,
      booking: payment.booking ? {
        ...payment.booking,
        renter: {
          email: payment.booking.user.email,
          name: payment.booking.user.profile 
            ? `${payment.booking.user.profile.firstName} ${payment.booking.user.profile.lastName}`
            : 'N/A',
        },
      } : null,
    }))

    return NextResponse.json({ payments: transformedPayments })
  } catch (error) {
    console.error('Admin payments API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
