import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request, 'VIEW_USERS')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const verified = searchParams.get('verified')
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const where: any = {}

    if (verified === 'true') {
      where.isVerified = true
    } else if (verified === 'false') {
      where.isVerified = false
    }

    if (role && role !== 'all') {
      where.role = role
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            vehicles: true,
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Transform users to include name and isVerified
    const transformedUsers = users.map(user => ({
      ...user,
      name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'N/A',
      isVerified: user.emailVerified && user.phoneVerified,
      _count: {
        vehiclesOwned: user._count.vehicles,
        bookings: user._count.bookings,
      },
    }))

    return NextResponse.json({ users: transformedUsers })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
