import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request, 'VIEW_VEHICLES')
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (category && category !== 'all') {
      where.category = category.toUpperCase()
    }

    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
      ]
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        host: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error('Admin vehicles error:', error)
    return NextResponse.json({ error: 'Failed to load vehicles' }, { status: 500 })
  }
}