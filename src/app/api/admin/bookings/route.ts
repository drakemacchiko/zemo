import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request, 'VIEW_BOOKINGS')
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        {
          vehicle: {
            OR: [
              { make: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } },
              { plateNumber: { contains: search, mode: 'insensitive' } },
            ]
          }
        },
        {
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              {
                profile: {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                  ]
                }
              }
            ]
          }
        }
      ]
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        vehicle: {
          select: {
            make: true,
            model: true,
            year: true,
            plateNumber: true
          }
        },
        user: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Admin bookings error:', error)
    return NextResponse.json({ error: 'Failed to load bookings' }, { status: 500 })
  }
}