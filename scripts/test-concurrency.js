/**
 * Concurrency Test Script for Booking Engine
 * 
 * This script simulates concurrent booking attempts to test
 * the double-booking prevention mechanisms in our API.
 * 
 * Usage: node scripts/test-concurrency.js
 */

/* eslint-disable no-console */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  concurrentRequests: 5,
  testDuration: 10000, // 10 seconds
  requestDelay: 100, // 100ms between batches
};

// Mock user and vehicle data
const TEST_USER = {
  id: 'test-user-concurrency',
  email: 'concurrency@test.com',
  password: 'TestPassword123!',
};

const TEST_HOST = {
  id: 'test-host-concurrency', 
  email: 'host-concurrency@test.com',
  password: 'TestPassword123!',
};

const TEST_VEHICLE = {
  id: 'test-vehicle-concurrency',
  plateNumber: 'TEST-CONCURRENT',
  make: 'Toyota',
  model: 'Corolla',
  year: 2022,
  color: 'White',
  vehicleType: 'SEDAN',
  transmission: 'AUTOMATIC',
  fuelType: 'PETROL',
  seatingCapacity: 5,
  dailyRate: 200.0,
  securityDeposit: 1000.0,
  currentMileage: 15000,
  locationLatitude: -15.4067,
  locationLongitude: 28.2871,
  locationAddress: 'Lusaka, Zambia',
};

/**
 * Setup test data in database
 */
async function setupTestData() {
  console.log('🔧 Setting up test data...');
  
  try {
    // Clean up existing test data
    await cleanupTestData();

    // Hash passwords
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 12);

    // Create test user
    await prisma.user.create({
      data: {
        id: TEST_USER.id,
        email: TEST_USER.email,
        password: hashedPassword,
        emailVerified: true,
        profile: {
          create: {
            firstName: 'Test',
            lastName: 'User',
            kycStatus: 'APPROVED',
          },
        },
      },
    });

    // Create test host
    await prisma.user.create({
      data: {
        id: TEST_HOST.id,
        email: TEST_HOST.email,
        password: hashedPassword,
        emailVerified: true,
        profile: {
          create: {
            firstName: 'Test',
            lastName: 'Host',
            kycStatus: 'APPROVED',
          },
        },
      },
    });

    // Create test vehicle
    await prisma.vehicle.create({
      data: {
        ...TEST_VEHICLE,
        hostId: TEST_HOST.id,
        availabilityStatus: 'AVAILABLE',
        verificationStatus: 'VERIFIED',
        isActive: true,
      },
    });

    console.log('✅ Test data setup complete');
  } catch (error) {
    console.error('❌ Failed to setup test data:', error);
    throw error;
  }
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  try {
    await prisma.booking.deleteMany({
      where: {
        OR: [
          { userId: TEST_USER.id },
          { vehicleId: TEST_VEHICLE.id },
        ],
      },
    });

    await prisma.vehicle.deleteMany({
      where: { id: TEST_VEHICLE.id },
    });

    await prisma.userProfile.deleteMany({
      where: {
        OR: [
          { userId: TEST_USER.id },
          { userId: TEST_HOST.id },
        ],
      },
    });

    await prisma.user.deleteMany({
      where: {
        OR: [
          { id: TEST_USER.id },
          { id: TEST_HOST.id },
        ],
      },
    });

    console.log('✅ Cleanup complete');
  } catch (error) {
    console.warn('⚠️ Cleanup error (may be normal):', error.message);
  }
}

/**
 * Generate JWT token for test user
 */
function generateTestToken() {
  const payload = {
    userId: TEST_USER.id,
    email: TEST_USER.email,
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
}

/**
 * Make a booking request
 */
async function makeBookingRequest(requestId, startDate, endDate) {
  const token = generateTestToken();
  
  const bookingData = {
    vehicleId: TEST_VEHICLE.id,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    pickupLocation: 'Test Location',
    specialRequests: `Concurrency test request #${requestId}`,
  };

  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();
    
    return {
      requestId,
      status: response.status,
      success: result.success,
      data: result.data,
      error: result.error,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      requestId,
      status: 0,
      success: false,
      error: error.message,
      timestamp: new Date(),
    };
  }
}

/**
 * Run concurrent booking test
 */
async function runConcurrencyTest() {
  console.log('🚀 Starting concurrency test...');
  console.log(`📊 Configuration:
    - Concurrent requests: ${TEST_CONFIG.concurrentRequests}
    - Base URL: ${TEST_CONFIG.baseUrl}
    - Test dates: Same overlapping period for all requests
  `);

  // Use same dates for all requests to force conflicts
  const startDate = new Date('2025-12-01T00:00:00.000Z');
  const endDate = new Date('2025-12-03T00:00:00.000Z');

  console.log(`📅 Test booking period: ${startDate.toISOString()} to ${endDate.toISOString()}`);

  // Launch concurrent requests
  const promises = [];
  for (let i = 1; i <= TEST_CONFIG.concurrentRequests; i++) {
    promises.push(makeBookingRequest(i, startDate, endDate));
  }

  console.log(`⏱️ Launching ${TEST_CONFIG.concurrentRequests} concurrent requests...`);
  const startTime = Date.now();

  // Wait for all requests to complete
  const results = await Promise.all(promises);
  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log(`✅ All requests completed in ${duration}ms`);

  // Analyze results
  analyzeResults(results);
  
  return results;
}

/**
 * Analyze test results
 */
function analyzeResults(results) {
  console.log('\n📊 CONCURRENCY TEST RESULTS');
  console.log('=' .repeat(50));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Total requests: ${results.length}`);
  console.log(`Successful bookings: ${successful.length}`);
  console.log(`Failed requests: ${failed.length}`);

  if (successful.length > 1) {
    console.log('❌ DOUBLE BOOKING DETECTED! Multiple bookings succeeded for same dates.');
    console.log('This indicates a race condition in the booking system.');
  } else if (successful.length === 1) {
    console.log('✅ CONCURRENCY TEST PASSED! Only one booking succeeded.');
    console.log('The double-booking prevention mechanism is working correctly.');
  } else {
    console.log('⚠️ NO SUCCESSFUL BOOKINGS. This may indicate an API or setup issue.');
  }

  console.log('\n📝 Detailed Results:');
  results.forEach(result => {
    const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
    const confirmationNumber = result.data?.confirmationNumber || 'N/A';
    const error = result.error || '';
    
    console.log(`Request ${result.requestId}: ${status} (${result.status}) - ${confirmationNumber} ${error}`);
  });

  // Check for specific error patterns
  const conflictErrors = failed.filter(r => 
    r.error && r.error.includes('not available for the selected dates')
  );
  
  if (conflictErrors.length > 0) {
    console.log(`\n✅ ${conflictErrors.length} requests correctly rejected due to date conflicts`);
  }

  console.log('\n' + '='.repeat(50));
}

/**
 * Verify database state after test
 */
async function verifyDatabaseState() {
  console.log('\n🔍 Verifying database state...');
  
  const bookings = await prisma.booking.findMany({
    where: {
      vehicleId: TEST_VEHICLE.id,
    },
    select: {
      id: true,
      confirmationNumber: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,
    },
  });

  console.log(`📋 Found ${bookings.length} booking(s) in database:`);
  bookings.forEach(booking => {
    console.log(`  - ${booking.confirmationNumber} (${booking.status}): ${booking.startDate.toISOString()} to ${booking.endDate.toISOString()}`);
  });

  // Check for overlapping bookings
  const activeBookings = bookings.filter(b => 
    ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(b.status)
  );

  if (activeBookings.length > 1) {
    console.log('❌ Multiple active bookings found - this indicates a concurrency issue!');
  } else {
    console.log('✅ Database state is consistent');
  }
}

/**
 * Run additional stress test
 */
async function runStressTest() {
  console.log('\n🔥 Running stress test with rapid requests...');
  
  const stressStartDate = new Date('2025-12-10T00:00:00.000Z');
  const stressEndDate = new Date('2025-12-12T00:00:00.000Z');
  
  const rapidRequests = [];
  const requestCount = 10;
  
  for (let i = 1; i <= requestCount; i++) {
    // Add small random delay to simulate real-world timing
    const delay = Math.random() * 50;
    rapidRequests.push(
      new Promise(resolve => {
        setTimeout(async () => {
          const result = await makeBookingRequest(i + 100, stressStartDate, stressEndDate);
          resolve(result);
        }, delay);
      })
    );
  }

  const stressResults = await Promise.all(rapidRequests);
  
  console.log('\n📊 STRESS TEST RESULTS:');
  analyzeResults(stressResults);
  
  return stressResults;
}

/**
 * Main test execution
 */
async function main() {
  console.log('🧪 ZEMO Booking Concurrency Test');
  console.log('Testing double-booking prevention mechanisms\n');

  try {
    // Setup
    await setupTestData();
    
    // Test 1: Basic concurrency test
    const results1 = await runConcurrencyTest();
    
    // Test 2: Stress test
    const results2 = await runStressTest();
    
    // Verify final state
    await verifyDatabaseState();
    
    // Summary
    const totalTests = results1.length + results2.length;
    const totalSuccessful = results1.filter(r => r.success).length + results2.filter(r => r.success).length;
    
    console.log(`\n🎯 FINAL SUMMARY:`);
    console.log(`Total test requests: ${totalTests}`);
    console.log(`Total successful bookings: ${totalSuccessful}`);
    
    if (totalSuccessful <= 2) { // Allow up to 2 successful bookings (one per test)
      console.log('✅ CONCURRENCY TESTS PASSED - Double booking prevention is working!');
      process.exit(0);
    } else {
      console.log('❌ CONCURRENCY TESTS FAILED - Double booking prevention needs improvement!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await cleanupTestData();
    await prisma.$disconnect();
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the test if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  setupTestData,
  cleanupTestData,
  runConcurrencyTest,
  runStressTest,
  makeBookingRequest,
  analyzeResults,
  verifyDatabaseState,
};