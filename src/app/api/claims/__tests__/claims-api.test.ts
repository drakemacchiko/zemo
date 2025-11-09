import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/claims/route';
import { prisma } from '@/lib/db';
import { generateTokens } from '@/lib/auth';

// Test database cleanup
async function cleanupDatabase() {
  await prisma.claimDocument.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.insurancePolicy.deleteMany();
  await prisma.insurance.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.drivingLicense.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
}

describe('Claims API Integration Tests', () => {
  let testUser: any;
  let testInsurance: any;
  let testVehicle: any;
  let testBooking: any;
  let testPolicy: any;
  let authToken: string;

  beforeEach(async () => {
    await cleanupDatabase();

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'claims-test@example.com',
        password: 'hashedpassword123',
        phoneNumber: '+260977123456',
      },
    });

    // Generate auth token
    const tokens = generateTokens({ userId: testUser.id, email: testUser.email });
    authToken = tokens.accessToken;

    // Create test insurance
    testInsurance = await prisma.insurance.create({
      data: {
        name: 'Test Insurance',
        description: 'Test insurance product',
        coverageType: 'BASIC',
        maxCoverageAmount: 50000,
        deductibleAmount: 1000,
        dailyRate: 15.0,
      },
    });

    // Create test vehicle
    testVehicle = await prisma.vehicle.create({
      data: {
        hostId: testUser.id,
        plateNumber: 'TEST123',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'White',
        vehicleType: 'SEDAN',
        transmission: 'AUTOMATIC',
        fuelType: 'PETROL',
        seatingCapacity: 5,
        dailyRate: 50.0,
        securityDeposit: 500.0,
        currentMileage: 15000,
        locationLatitude: -15.4067,
        locationLongitude: 28.2871,
        locationAddress: 'Lusaka, Zambia',
      },
    });

    // Create test booking
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);

    testBooking = await prisma.booking.create({
      data: {
        userId: testUser.id,
        vehicleId: testVehicle.id,
        hostId: testUser.id,
        startDate,
        endDate,
        dailyRate: testVehicle.dailyRate,
        totalDays: 2,
        subtotal: 100,
        serviceFee: 10,
        taxAmount: 5,
        totalAmount: 115,
        securityDeposit: testVehicle.securityDeposit,
        confirmationNumber: 'TEST123',
        status: 'CONFIRMED',
      },
    });

    // Create test policy
    testPolicy = await prisma.insurancePolicy.create({
      data: {
        bookingId: testBooking.id,
        userId: testUser.id,
        insuranceId: testInsurance.id,
        policyNumber: 'TEST-POL-123',
        coverageAmount: 25000,
        premiumAmount: 30,
        deductibleAmount: testInsurance.deductibleAmount,
        startDate,
        endDate,
        status: 'ACTIVE',
        activatedAt: new Date(),
      },
    });
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/claims', () => {
    it('should create claim successfully with valid data', async () => {
      const incidentDate = new Date();
      incidentDate.setDate(incidentDate.getDate() + 2); // During policy period

      const claimData = {
        policyId: testPolicy.id,
        incidentDate: incidentDate.toISOString(),
        incidentLocation: 'Lusaka Central',
        incidentDescription: 'Minor accident at traffic intersection. Front bumper damaged.',
        claimType: 'ACCIDENT',
        estimatedDamageAmount: 2500,
        policeReportNumber: 'ZP/123/2024',
      };

      const request = new NextRequest('http://localhost:3000/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(claimData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('claimNumber');
      expect(result.data.policyId).toBe(testPolicy.id);
      expect(result.data.userId).toBe(testUser.id);
      expect(result.data.status).toBe('SUBMITTED');
      expect(result.data.claimType).toBe('ACCIDENT');
      expect(result.data.estimatedDamageAmount).toBe(2500);
      expect(result.data.policeReportNumber).toBe('ZP/123/2024');
    });

    it('should reject claim with invalid data', async () => {
      const claimData = {
        policyId: 'invalid-id',
        incidentDate: 'invalid-date',
        incidentLocation: '',
        incidentDescription: 'Too short',
        claimType: 'INVALID_TYPE',
      };

      const request = new NextRequest('http://localhost:3000/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(claimData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
      expect(result.details).toBeDefined();
    });

    it('should reject claim without authentication', async () => {
      const claimData = {
        policyId: testPolicy.id,
        incidentDate: new Date().toISOString(),
        incidentLocation: 'Lusaka Central',
        incidentDescription: 'Test claim description with sufficient length',
        claimType: 'ACCIDENT',
      };

      const request = new NextRequest('http://localhost:3000/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should reject claim for incident outside policy period', async () => {
      const incidentDate = new Date();
      incidentDate.setDate(incidentDate.getDate() + 10); // Outside policy period

      const claimData = {
        policyId: testPolicy.id,
        incidentDate: incidentDate.toISOString(),
        incidentLocation: 'Lusaka Central',
        incidentDescription: 'Incident occurred outside policy coverage period',
        claimType: 'ACCIDENT',
      };

      const request = new NextRequest('http://localhost:3000/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(claimData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain('outside the policy coverage period');
    });
  });

  describe('GET /api/claims', () => {
    beforeEach(async () => {
      // Create test claims
      const incidentDate = new Date();
      incidentDate.setDate(incidentDate.getDate() + 2);

      await prisma.claim.createMany({
        data: [
          {
            policyId: testPolicy.id,
            bookingId: testBooking.id,
            userId: testUser.id,
            claimNumber: 'CLM-001',
            incidentDate,
            incidentLocation: 'Lusaka Central',
            incidentDescription: 'First test claim',
            claimType: 'ACCIDENT',
            status: 'SUBMITTED',
            priority: 'NORMAL',
          },
          {
            policyId: testPolicy.id,
            bookingId: testBooking.id,
            userId: testUser.id,
            claimNumber: 'CLM-002',
            incidentDate,
            incidentLocation: 'Kitwe Downtown',
            incidentDescription: 'Second test claim',
            claimType: 'THEFT',
            status: 'UNDER_REVIEW',
            priority: 'HIGH',
          },
        ],
      });
    });

    it('should get all user claims', async () => {
      const request = new NextRequest('http://localhost:3000/api/claims', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.claims).toHaveLength(2);
      expect(result.data.total).toBe(2);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    });

    it('should filter claims by status', async () => {
      const url = new URL('http://localhost:3000/api/claims');
      url.searchParams.set('status', 'SUBMITTED');

      const request = new NextRequest(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.claims).toHaveLength(1);
      expect(result.data.claims[0].status).toBe('SUBMITTED');
    });

    it('should filter claims by claim type', async () => {
      const url = new URL('http://localhost:3000/api/claims');
      url.searchParams.set('claimType', 'THEFT');

      const request = new NextRequest(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.claims).toHaveLength(1);
      expect(result.data.claims[0].claimType).toBe('THEFT');
    });

    it('should paginate claims correctly', async () => {
      const url = new URL('http://localhost:3000/api/claims');
      url.searchParams.set('page', '1');
      url.searchParams.set('limit', '1');

      const request = new NextRequest(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.claims).toHaveLength(1);
      expect(result.data.total).toBe(2);
      expect(result.data.totalPages).toBe(2);
    });

    it('should reject request without authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/claims', {
        method: 'GET',
      });

      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });

    it('should handle invalid query parameters', async () => {
      const url = new URL('http://localhost:3000/api/claims');
      url.searchParams.set('status', 'INVALID_STATUS');
      url.searchParams.set('page', 'invalid');

      const request = new NextRequest(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid query parameters');
    });
  });
});