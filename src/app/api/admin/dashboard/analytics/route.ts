import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authResult = await requireAdmin(request, 'VIEW_ANALYTICS')
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status || 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    
    let days = 7
    if (range === '30d') days = 30
    if (range === '90d') days = 90

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))

    // Generate date array for the range
    const dateArray = []
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000))
      dateArray.push({
        date: date.toISOString().split('T')[0],
        dateObj: date
      })
    }

    // Get analytics data
    const analyticsData = await Promise.all(
      dateArray.map(async ({ date, dateObj }) => {
        const dayStart = new Date(dateObj.setHours(0, 0, 0, 0))
        const dayEnd = new Date(dateObj.setHours(23, 59, 59, 999))

        const [users, bookings, payments] = await Promise.all([
          // Daily active users (users who logged in on this day)
          prisma.user.count({
            where: {
              lastLoginAt: {
                gte: dayStart,
                lte: dayEnd
              }
            }
          }),
          
          // Bookings created on this day
          prisma.booking.count({
            where: {
              createdAt: {
                gte: dayStart,
                lte: dayEnd
              }
            }
          }),
          
          // Revenue from completed payments on this day
          prisma.payment.findMany({
            where: {
              createdAt: {
                gte: dayStart,
                lte: dayEnd
              },
              status: 'COMPLETED'
            },
            select: {
              amount: true
            }
          })
        ])

        const revenue = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0)

        return {
          date,
          users,
          bookings,
          revenue
        }
      })
    )

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to load analytics data' }, { status: 500 })
  }
}