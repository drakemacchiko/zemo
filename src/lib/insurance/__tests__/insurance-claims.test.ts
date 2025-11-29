import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '@/lib/db';
import { InsurancePricingService, ClaimService } from '@/lib/insurance';

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

// Sample test data
const sampleUser = {
  email: 'testuser@example.com',
  password: 'hashedpassword123',
  phoneNumber: '+260977123456',
};

const sampleInsurance = {
  name: 'Basic Coverage',
  description: 'Basic car rental insurance',
  coverageType: 'BASIC' as const,
  maxCoverageAmount: 50000,
  deductibleAmount: 1000,
  dailyRate: 15.0,
  accidentCoverage: true,
  theftCoverage: false,
  vandalismCoverage: false,
  naturalDisasterCoverage: false,
  thirdPartyCoverage: true,
};

const sampleVehicle = {
  plateNumber: 'ABC123',
  make: 'Toyota',
  model: 'Corolla',
  year: 2020,
  color: 'White',
  vehicleType: 'SEDAN' as const,
  transmission: 'AUTOMATIC' as const,
  fuelType: 'PETROL' as const,
  seatingCapacity: 5,
  dailyRate: 50.0,
  securityDeposit: 500.0,
  currentMileage: 15000,
  locationLatitude: -15.4067,
  locationLongitude: 28.2871,
  locationAddress: 'Lusaka, Zambia',
};

describe('Insurance and Claims System', () => {
  let testUser: any;
  let testInsurance: any;
  let testVehicle: any;
  let testBooking: any;

  beforeEach(async () => {
    await cleanupDatabase();

    // Create test user
    testUser = await prisma.user.create({
      data: sampleUser,
    });

    // Create test insurance product
    testInsurance = await prisma.insurance.create({
      data: sampleInsurance,
    });

    // Create test vehicle
    testVehicle = await prisma.vehicle.create({
      data: {
        ...sampleVehicle,
        hostId: testUser.id,
      },
    });

    // Create test booking
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Tomorrow
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3); // Day after tomorrow

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
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('InsurancePricingService', () => {
    it('should calculate insurance premium correctly', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);

      const result = await InsurancePricingService.calculatePremium(
        testInsurance.id,
        30000, // vehicle value
        startDate,
        endDate,
        25000 // coverage amount
      );

      expect(result).toHaveProperty('dailyPremium');
      expect(result).toHaveProperty('totalPremium');
      expect(result).toHaveProperty('coverageAmount');
      expect(result.coverageAmount).toBe(25000);
      expect(result.totalPremium).toBeGreaterThan(0);
      expect(result.dailyPremium).toBeGreaterThan(0);
      expect(result.totalPremium).toBe(result.dailyPremium * 2); // 2 days
    });

    it('should throw error for inactive insurance', async () => {
      // Deactivate insurance
      await prisma.insurance.update({
        where: { id: testInsurance.id },
        data: { isActive: false },
      });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);

      await expect(
        InsurancePricingService.calculatePremium(testInsurance.id, 30000, startDate, endDate)
      ).rejects.toThrow('Insurance product not found or inactive');
    });

    it('should create insurance policy successfully', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);

      const policy = await InsurancePricingService.createPolicy(
        testBooking.id,
        testUser.id,
        testInsurance.id,
        25000,
        30.0,
        startDate,
        endDate
      );

      expect(policy).toHaveProperty('id');
      expect(policy).toHaveProperty('policyNumber');
      expect(policy.bookingId).toBe(testBooking.id);
      expect(policy.userId).toBe(testUser.id);
      expect(policy.coverageAmount).toBe(25000);
      expect(policy.premiumAmount).toBe(30.0);
      expect(policy.status).toBe('PENDING');
    });

    it('should prevent duplicate policies for same booking', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);

      // Create first policy
      await InsurancePricingService.createPolicy(
        testBooking.id,
        testUser.id,
        testInsurance.id,
        25000,
        30.0,
        startDate,
        endDate
      );

      // Try to create second policy for same booking
      await expect(
        InsurancePricingService.createPolicy(
          testBooking.id,
          testUser.id,
          testInsurance.id,
          25000,
          30.0,
          startDate,
          endDate
        )
      ).rejects.toThrow('Booking already has an insurance policy');
    });

    it('should activate policy successfully', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);

      const policy = await InsurancePricingService.createPolicy(
        testBooking.id,
        testUser.id,
        testInsurance.id,
        25000,
        30.0,
        startDate,
        endDate
      );

      const activatedPolicy = await InsurancePricingService.activatePolicy(policy.id);

      expect(activatedPolicy.status).toBe('ACTIVE');
      expect(activatedPolicy.activatedAt).toBeTruthy();
    });
  });

  describe('ClaimService', () => {
    let testPolicy: any;

    beforeEach(async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);

      testPolicy = await InsurancePricingService.createPolicy(
        testBooking.id,
        testUser.id,
        testInsurance.id,
        25000,
        30.0,
        startDate,
        endDate
      );

      // Activate policy
      await InsurancePricingService.activatePolicy(testPolicy.id);
    });

    it('should create claim successfully', async () => {
      const incidentDate = new Date();
      incidentDate.setDate(incidentDate.getDate() + 2); // During booking period

      const claim = await ClaimService.createClaim(testPolicy.id, testUser.id, {
        incidentDate,
        incidentLocation: 'Lusaka Central',
        incidentDescription: 'Minor fender bender at traffic light',
        claimType: 'ACCIDENT',
        estimatedDamageAmount: 2500,
        policeReportNumber: 'POL123456',
      });

      expect(claim).toHaveProperty('id');
      expect(claim).toHaveProperty('claimNumber');
      expect(claim.policyId).toBe(testPolicy.id);
      expect(claim.userId).toBe(testUser.id);
      expect(claim.status).toBe('SUBMITTED');
      expect(claim.priority).toBe('NORMAL');
      expect(claim.estimatedDamageAmount).toBe(2500);
    });

    it('should reject claim for inactive policy', async () => {
      // Cancel policy
      await prisma.insurancePolicy.update({
        where: { id: testPolicy.id },
        data: { status: 'CANCELLED' },
      });

      const incidentDate = new Date();
      incidentDate.setDate(incidentDate.getDate() + 2);

      await expect(
        ClaimService.createClaim(testPolicy.id, testUser.id, {
          incidentDate,
          incidentLocation: 'Lusaka Central',
          incidentDescription: 'Minor fender bender',
          claimType: 'ACCIDENT',
        })
      ).rejects.toThrow('Insurance policy is not active');
    });

    it('should reject claim for unauthorized user', async () => {
      // Create another user
      const anotherUser = await prisma.user.create({
        data: {
          email: 'another@example.com',
          password: 'hashedpassword456',
          phoneNumber: '+260977654321',
        },
      });

      const incidentDate = new Date();
      incidentDate.setDate(incidentDate.getDate() + 2);

      await expect(
        ClaimService.createClaim(testPolicy.id, anotherUser.id, {
          incidentDate,
          incidentLocation: 'Lusaka Central',
          incidentDescription: 'Minor fender bender',
          claimType: 'ACCIDENT',
        })
      ).rejects.toThrow('Unauthorized to create claim for this policy');
    });

    it('should reject claim for incident outside policy period', async () => {
      const incidentDate = new Date();
      incidentDate.setDate(incidentDate.getDate() + 10); // Outside booking period

      await expect(
        ClaimService.createClaim(testPolicy.id, testUser.id, {
          incidentDate,
          incidentLocation: 'Lusaka Central',
          incidentDescription: 'Minor fender bender',
          claimType: 'ACCIDENT',
        })
      ).rejects.toThrow('Incident date is outside the policy coverage period');
    });

    it('should update claim status as admin', async () => {
      const incidentDate = new Date();
      incidentDate.setDate(incidentDate.getDate() + 2);

      const claim = await ClaimService.createClaim(testPolicy.id, testUser.id, {
        incidentDate,
        incidentLocation: 'Lusaka Central',
        incidentDescription: 'Minor fender bender',
        claimType: 'ACCIDENT',
        estimatedDamageAmount: 2500,
      });

      const updatedClaim = await ClaimService.updateClaim(
        claim.id,
        {
          status: 'UNDER_REVIEW',
          reviewNotes: 'Initial review completed',
          actualDamageAmount: 2800,
          priority: 'HIGH',
        },
        testUser.id // reviewer ID
      );

      expect(updatedClaim.status).toBe('UNDER_REVIEW');
      expect(updatedClaim.reviewNotes).toBe('Initial review completed');
      expect(updatedClaim.actualDamageAmount).toBe(2800);
      expect(updatedClaim.priority).toBe('HIGH');
      expect(updatedClaim.reviewedBy).toBe(testUser.id);
      expect(updatedClaim.reviewedAt).toBeTruthy();
    });

    it('should search claims with filters', async () => {
      // Create multiple claims
      const incidentDate = new Date();
      incidentDate.setDate(incidentDate.getDate() + 2);

      await ClaimService.createClaim(testPolicy.id, testUser.id, {
        incidentDate,
        incidentLocation: 'Lusaka Central',
        incidentDescription: 'Accident claim',
        claimType: 'ACCIDENT',
      });

      await ClaimService.createClaim(testPolicy.id, testUser.id, {
        incidentDate,
        incidentLocation: 'Kitwe',
        incidentDescription: 'Theft claim',
        claimType: 'THEFT',
      });

      // Search all claims
      const allClaimsResult = await ClaimService.searchClaims({
        userId: testUser.id,
      });

      expect(allClaimsResult.claims).toHaveLength(2);
      expect(allClaimsResult.total).toBe(2);

      // Search by claim type
      const accidentClaimsResult = await ClaimService.searchClaims({
        userId: testUser.id,
        claimType: 'ACCIDENT',
      });

      expect(accidentClaimsResult.claims).toHaveLength(1);
      expect(accidentClaimsResult.claims?.[0]?.claimType).toBe('ACCIDENT');

      // Search by status
      const submittedClaimsResult = await ClaimService.searchClaims({
        userId: testUser.id,
        status: 'SUBMITTED',
      });

      expect(submittedClaimsResult.claims).toHaveLength(2);
    });

    it('should get claim by ID with authorization', async () => {
      const incidentDate = new Date();
      incidentDate.setDate(incidentDate.getDate() + 2);

      const claim = await ClaimService.createClaim(testPolicy.id, testUser.id, {
        incidentDate,
        incidentLocation: 'Lusaka Central',
        incidentDescription: 'Test claim',
        claimType: 'ACCIDENT',
      });

      // Get claim as owner
      const retrievedClaim = await ClaimService.getClaimById(claim.id, testUser.id);
      expect(retrievedClaim.id).toBe(claim.id);

      // Create another user
      const anotherUser = await prisma.user.create({
        data: {
          email: 'unauthorized@example.com',
          password: 'hashedpassword789',
          phoneNumber: '+260977987654',
        },
      });

      // Try to get claim as unauthorized user
      await expect(ClaimService.getClaimById(claim.id, anotherUser.id)).rejects.toThrow(
        'Unauthorized to view this claim'
      );
    });
  });
});
