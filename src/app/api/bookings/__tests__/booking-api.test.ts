/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { prisma } from '@/lib/db';
import { generateTokens } from '@/lib/auth';

// Mock the Prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  } as any,
}));

describe('Booking API Tests', () => {
  const mockUser = {
    id: 'clku6q7890123456789abcdef',
    email: 'test@example.com',
  };

  const mockVehicle = {
    id: 'clkv6q7890123456789abcdef',
    hostId: 'clkh6q7890123456789abcdef',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    plateNumber: 'ABC-123',
    dailyRate: 150.0,
    isActive: true,
    availabilityStatus: 'AVAILABLE',
    verificationStatus: 'VERIFIED',
    securityDeposit: 500.0,
    locationAddress: 'Lusaka, Zambia',
    host: {
      id: 'clkh6q7890123456789abcdef',
      email: 'host@example.com',
    },
  };

  const mockBooking = {
    id: 'booking-1',
    userId: 'user-1',
    vehicleId: 'vehicle-1',
    hostId: 'host-1',
    startDate: '2025-11-20T00:00:00.000Z',
    endDate: '2025-11-22T00:00:00.000Z',
    dailyRate: 150.0,
    totalDays: 3,
    subtotal: 450.0,
    serviceFee: 45.0,
    taxAmount: 79.2,
    totalAmount: 574.2,
    securityDeposit: 500.0,
    confirmationNumber: 'ZEM-20251120-ABCD',
    status: 'PENDING',
    createdAt: '2025-11-07T07:07:34.686Z',
    updatedAt: '2025-11-07T07:07:34.686Z',
    vehicle: {
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      plateNumber: 'ABC-123',
      dailyRate: 150.0,
      locationAddress: 'Lusaka, Zambia',
    },
    user: {
      id: 'user-1',
      email: 'test@example.com',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('POST /api/bookings', () => {
    it('should create a booking successfully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2); // 2 days from now
      tomorrow.setHours(10, 0, 0, 0); // 10 AM
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 4); // 4 days from now
      dayAfterTomorrow.setHours(10, 0, 0, 0); // 10 AM

      const bookingData = {
        vehicleId: 'clkv6q7890123456789abcdef', // Use a proper CUID format
        startDate: tomorrow.toISOString(),
        endDate: dayAfterTomorrow.toISOString(),
        pickupLocation: 'Lusaka City Center',
        specialRequests: 'Please have the car cleaned',
      };

      // Mock transaction
      (prisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = {
          vehicle: {
            findUnique: jest.fn().mockResolvedValue(mockVehicle),
          },
          booking: {
            findMany: jest.fn().mockResolvedValue([]), // No overlapping bookings
            create: jest.fn().mockResolvedValue(mockBooking),
          },
        };
        return callback(tx);
      });

      // Generate auth token
      const { accessToken } = generateTokens({ userId: mockUser.id, email: mockUser.email });

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.confirmationNumber).toBe('ZEM-20251120-ABCD');
    });

    it('should reject booking if vehicle is not available', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      tomorrow.setHours(10, 0, 0, 0);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 4);
      dayAfterTomorrow.setHours(10, 0, 0, 0);

      const bookingData = {
        vehicleId: 'clkv6q7890123456789abcdef',
        startDate: tomorrow.toISOString(),
        endDate: dayAfterTomorrow.toISOString(),
      };

      // Mock transaction - vehicle not found
      (prisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = {
          vehicle: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(tx);
      });

      const { accessToken } = generateTokens({ userId: mockUser.id, email: mockUser.email });

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Vehicle not found or not available');
    });

    it('should reject booking with overlapping dates', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      tomorrow.setHours(10, 0, 0, 0);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 4);
      dayAfterTomorrow.setHours(10, 0, 0, 0);

      const bookingData = {
        vehicleId: 'clkv6q7890123456789abcdef',
        startDate: tomorrow.toISOString(),
        endDate: dayAfterTomorrow.toISOString(),
      };

      // Mock transaction - with overlapping booking
      (prisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = {
          vehicle: {
            findUnique: jest.fn().mockResolvedValue(mockVehicle),
          },
          booking: {
            findMany: jest.fn().mockResolvedValue([
              {
                id: 'existing-booking',
                startDate: new Date('2025-11-21'),
                endDate: new Date('2025-11-23'),
                status: 'CONFIRMED',
              },
            ]),
          },
        };
        return callback(tx);
      });

      const { accessToken } = generateTokens({ userId: mockUser.id, email: mockUser.email });

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Vehicle is not available for the selected dates');
    });

    it('should reject booking if user tries to book their own vehicle', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      tomorrow.setHours(10, 0, 0, 0);
      const dayAfterTomorrow = new Date();
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 4);
      dayAfterTomorrow.setHours(10, 0, 0, 0);

      const bookingData = {
        vehicleId: 'clkv6q7890123456789abcdef',
        startDate: tomorrow.toISOString(),
        endDate: dayAfterTomorrow.toISOString(),
      };

      const ownVehicle = { ...mockVehicle, hostId: mockUser.id };

      (prisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = {
          vehicle: {
            findUnique: jest.fn().mockResolvedValue(ownVehicle),
          },
        };
        return callback(tx);
      });

      const { accessToken } = generateTokens({ userId: mockUser.id, email: mockUser.email });

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('You cannot book your own vehicle');
    });

    it('should reject booking without authentication', async () => {
      const bookingData = {
        vehicleId: 'vehicle-1',
        startDate: '2025-11-20T00:00:00.000Z',
        endDate: '2025-11-22T00:00:00.000Z',
      };

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should reject booking with invalid date range', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      futureDate.setHours(10, 0, 0, 0);
      const earlierDate = new Date();
      earlierDate.setDate(earlierDate.getDate() + 2);
      earlierDate.setHours(10, 0, 0, 0);

      const bookingData = {
        vehicleId: 'clkv6q7890123456789abcdef',
        startDate: futureDate.toISOString(), // Start date after end date
        endDate: earlierDate.toISOString(),
      };

      const { accessToken } = generateTokens({ userId: mockUser.id, email: mockUser.email });

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });
  });

  describe('GET /api/bookings', () => {
    it('should fetch user bookings successfully', async () => {
      const mockBookings = [mockBooking];

      ((prisma as any).booking.findMany as jest.Mock).mockResolvedValue(mockBookings);
      ((prisma as any).booking.count as jest.Mock).mockResolvedValue(1);

      const { accessToken } = generateTokens({ userId: mockUser.id, email: mockUser.email });

      const request = new NextRequest('http://localhost:3000/api/bookings?page=1&limit=20', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBookings);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(1);
    });

    it('should fetch bookings with status filter', async () => {
      const pendingBookings = [{ ...mockBooking, status: 'PENDING' }];

      ((prisma as any).booking.findMany as jest.Mock).mockResolvedValue(pendingBookings);
      ((prisma as any).booking.count as jest.Mock).mockResolvedValue(1);

      const { accessToken } = generateTokens({ userId: mockUser.id, email: mockUser.email });

      const request = new NextRequest('http://localhost:3000/api/bookings?status=PENDING', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data[0].status).toBe('PENDING');
    });

    it('should reject unauthorized access', async () => {
      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'GET',
      });

      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });
});
