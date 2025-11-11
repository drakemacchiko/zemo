import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET as getVehicles } from '@/app/api/admin/vehicles/route'
import { GET as getBookings } from '@/app/api/admin/bookings/route'
import { GET as getDashboardStats } from '@/app/api/admin/dashboard/stats/route'

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  requireAdmin: jest.fn()
}))

// Mock the database
jest.mock('@/lib/db', () => ({
  prisma: {
    vehicle: {
      findMany: jest.fn()
    },
    booking: {
      findMany: jest.fn()
    },
    user: {
      count: jest.fn()
    },
    claim: {
      count: jest.fn()
    },
    payment: {
      findMany: jest.fn()
    }
  }
}))

describe('Admin API Endpoints', () => {
  const { requireAdmin } = require('@/lib/auth')
  const { prisma } = require('@/lib/db')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/vehicles', () => {
    test('should return vehicles for authorized admin', async () => {
      const mockVehicles = [
        {
          id: 'vehicle1',
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          plateNumber: 'ABC123',
          dailyRate: 50,
          availabilityStatus: 'AVAILABLE',
          host: {
            id: 'host1',
            profile: {
              firstName: 'John',
              lastName: 'Doe'
            }
          }
        }
      ]

      requireAdmin.mockResolvedValue({ user: { id: 'admin1' }, error: null })
      prisma.vehicle.findMany.mockResolvedValue(mockVehicles)

      const request = new NextRequest('http://localhost/api/admin/vehicles')
      const response = await getVehicles(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.vehicles).toEqual(mockVehicles)
      expect(requireAdmin).toHaveBeenCalledWith(request, 'VIEW_VEHICLES')
    })

    test('should return error for unauthorized user', async () => {
      requireAdmin.mockResolvedValue({ 
        error: 'Admin access required', 
        status: 403 
      })

      const request = new NextRequest('http://localhost/api/admin/vehicles')
      const response = await getVehicles(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Admin access required')
    })

    test('should filter vehicles by status', async () => {
      requireAdmin.mockResolvedValue({ user: { id: 'admin1' }, error: null })
      prisma.vehicle.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost/api/admin/vehicles?status=available')
      await getVehicles(request)

      expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
        where: {
          availabilityStatus: 'AVAILABLE'
        },
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
    })

    test('should filter vehicles by search term', async () => {
      requireAdmin.mockResolvedValue({ user: { id: 'admin1' }, error: null })
      prisma.vehicle.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost/api/admin/vehicles?search=toyota')
      await getVehicles(request)

      expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { make: { contains: 'toyota', mode: 'insensitive' } },
            { model: { contains: 'toyota', mode: 'insensitive' } },
            { plateNumber: { contains: 'toyota', mode: 'insensitive' } },
          ]
        },
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
    })
  })

  describe('GET /api/admin/bookings', () => {
    test('should return bookings for authorized admin', async () => {
      const mockBookings = [
        {
          id: 'booking1',
          startDate: '2023-12-01',
          endDate: '2023-12-05',
          totalAmount: 200,
          status: 'CONFIRMED',
          vehicle: {
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            plateNumber: 'ABC123'
          },
          user: {
            profile: {
              firstName: 'Jane',
              lastName: 'Smith'
            }
          }
        }
      ]

      requireAdmin.mockResolvedValue({ user: { id: 'admin1' }, error: null })
      prisma.booking.findMany.mockResolvedValue(mockBookings)

      const request = new NextRequest('http://localhost/api/admin/bookings')
      const response = await getBookings(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.bookings).toEqual(mockBookings)
      expect(requireAdmin).toHaveBeenCalledWith(request, 'VIEW_BOOKINGS')
    })

    test('should filter bookings by status', async () => {
      requireAdmin.mockResolvedValue({ user: { id: 'admin1' }, error: null })
      prisma.booking.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost/api/admin/bookings?status=confirmed')
      await getBookings(request)

      expect(prisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          status: 'CONFIRMED'
        },
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
    })
  })

  describe('GET /api/admin/dashboard/stats', () => {
    test('should return dashboard statistics for authorized admin', async () => {
      requireAdmin.mockResolvedValue({ user: { id: 'admin1' }, error: null })
      
      prisma.user.count
        .mockResolvedValueOnce(150) // totalUsers
        .mockResolvedValueOnce(25)  // dailyActiveUsers
      
      prisma.vehicle.count.mockResolvedValue(75)
      prisma.booking.count
        .mockResolvedValueOnce(20) // activeBookings
        .mockResolvedValueOnce(5)  // bookingsToday
      
      prisma.claim.count.mockResolvedValue(3)
      
      prisma.payment.findMany
        .mockResolvedValueOnce([     // paymentsToday
          { amount: 100 },
          { amount: 200 }
        ])
        .mockResolvedValueOnce([     // totalPayments
          { amount: 100 },
          { amount: 200 },
          { amount: 150 },
          { amount: 250 }
        ])

      const request = new NextRequest('http://localhost/api/admin/dashboard/stats')
      const response = await getDashboardStats(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        totalUsers: 150,
        totalVehicles: 75,
        activeBookings: 20,
        totalClaims: 3,
        totalRevenue: 700,
        dailyActiveUsers: 25,
        bookingsToday: 5,
        revenueToday: 300
      })
      expect(requireAdmin).toHaveBeenCalledWith(request, 'VIEW_ANALYTICS')
    })

    test('should return error for unauthorized user', async () => {
      requireAdmin.mockResolvedValue({ 
        error: 'Permission required: VIEW_ANALYTICS', 
        status: 403 
      })

      const request = new NextRequest('http://localhost/api/admin/dashboard/stats')
      const response = await getDashboardStats(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Permission required: VIEW_ANALYTICS')
    })
  })
})