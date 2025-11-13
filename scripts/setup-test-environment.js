/**
 * ZEMO Platform - Complete Workflow Test Setup
 * 
 * This script creates:
 * 1. Test users with different roles (USER, HOST, ADMIN)
 * 2. Sample vehicles for booking
 * 3. Insurance data
 * 
 * Run this to set up a complete testing environment
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Test user credentials
const TEST_USERS = [
  {
    email: 'john.renter@test.com',
    password: 'Test@123',
    role: 'USER',
    profile: {
      firstName: 'John',
      lastName: 'Renter',
      country: 'Zambia',
      kycStatus: 'APPROVED'
    },
    phone: '+260971111111',
    description: 'Regular customer - books vehicles'
  },
  {
    email: 'sarah.host@test.com',
    password: 'Test@123',
    role: 'HOST',
    profile: {
      firstName: 'Sarah',
      lastName: 'Vehicle Owner',
      country: 'Zambia',
      kycStatus: 'APPROVED'
    },
    phone: '+260972222222',
    description: 'Vehicle owner - lists vehicles for rent'
  },
  {
    email: 'mike.admin@test.com',
    password: 'Test@123',
    role: 'ADMIN',
    profile: {
      firstName: 'Mike',
      lastName: 'Support',
      country: 'Zambia',
      kycStatus: 'APPROVED'
    },
    phone: '+260973333333',
    description: 'Admin user - manages platform',
    permissions: [
      'VIEW_USERS', 'MANAGE_USERS',
      'VIEW_VEHICLES', 'MANAGE_VEHICLES',
      'VIEW_BOOKINGS', 'MANAGE_BOOKINGS',
      'VIEW_CLAIMS', 'MANAGE_CLAIMS',
      'VIEW_PAYMENTS', 'MANAGE_PAYMENTS',
      'VIEW_ANALYTICS'
    ]
  },
  {
    email: 'lisa.premium@test.com',
    password: 'Test@123',
    role: 'USER',
    profile: {
      firstName: 'Lisa',
      lastName: 'Premium Customer',
      country: 'Zambia',
      kycStatus: 'APPROVED'
    },
    phone: '+260974444444',
    description: 'Premium customer - frequent renter'
  },
  {
    email: 'david.host@test.com',
    password: 'Test@123',
    role: 'HOST',
    profile: {
      firstName: 'David',
      lastName: 'Fleet Owner',
      country: 'Zambia',
      kycStatus: 'APPROVED'
    },
    phone: '+260975555555',
    description: 'Fleet owner - lists multiple vehicles'
  }
]

// Sample vehicles
const SAMPLE_VEHICLES = [
  {
    make: 'Toyota',
    model: 'Corolla',
    year: 2022,
    plateNumber: 'BAZ 2022',
    vehicleType: 'SEDAN',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    seatingCapacity: 5,
    dailyRate: 350,
    securityDeposit: 500,
    currentMileage: 15000,
    color: 'Silver',
    locationAddress: 'Lusaka CBD, Zambia',
    locationLatitude: -15.4167,
    locationLongitude: 28.2833,
    features: ['Air Conditioning', 'Power Windows', 'Bluetooth', 'USB Charging', 'Central Locking'],
    availabilityStatus: 'AVAILABLE'
  },
  {
    make: 'Honda',
    model: 'CR-V',
    year: 2023,
    plateNumber: 'BAZ 3023',
    vehicleType: 'SUV',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    seatingCapacity: 7,
    dailyRate: 550,
    securityDeposit: 800,
    currentMileage: 8000,
    color: 'White',
    locationAddress: 'Kabulonga, Lusaka',
    locationLatitude: -15.3875,
    locationLongitude: 28.3228,
    features: ['AWD', 'Leather Seats', 'Sunroof', 'Reverse Camera', 'Cruise Control', 'Apple CarPlay'],
    availabilityStatus: 'AVAILABLE'
  },
  {
    make: 'Nissan',
    model: 'Patrol',
    year: 2021,
    plateNumber: 'BAZ 1021',
    vehicleType: 'SUV',
    transmission: 'AUTOMATIC',
    fuelType: 'DIESEL',
    seatingCapacity: 8,
    dailyRate: 750,
    securityDeposit: 1000,
    currentMileage: 25000,
    color: 'Black',
    locationAddress: 'Roma, Lusaka',
    locationLatitude: -15.3947,
    locationLongitude: 28.3228,
    features: ['4WD', 'Leather Interior', 'Parking Sensors', 'Hill Assist', 'Climate Control'],
    availabilityStatus: 'AVAILABLE'
  },
  {
    make: 'Mazda',
    model: 'Demio',
    year: 2020,
    plateNumber: 'BAZ 5020',
    vehicleType: 'HATCHBACK',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    seatingCapacity: 5,
    dailyRate: 250,
    securityDeposit: 350,
    currentMileage: 35000,
    color: 'Blue',
    locationAddress: 'Chilenje, Lusaka',
    locationLatitude: -15.4300,
    locationLongitude: 28.3100,
    features: ['Air Conditioning', 'Power Steering', 'Radio/CD', 'Central Locking'],
    availabilityStatus: 'AVAILABLE'
  },
  {
    make: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2023,
    plateNumber: 'BAZ 7023',
    vehicleType: 'SEDAN',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    seatingCapacity: 5,
    dailyRate: 1200,
    securityDeposit: 2000,
    currentMileage: 5000,
    color: 'Black',
    locationAddress: 'Leopards Hill, Lusaka',
    locationLatitude: -15.3500,
    locationLongitude: 28.3800,
    features: ['Premium Sound System', 'Massage Seats', 'Ambient Lighting', 'Adaptive Cruise', 'Lane Assist', '360 Camera'],
    availabilityStatus: 'AVAILABLE'
  }
]

async function setupTestEnvironment() {
  console.log('🚀 Setting up ZEMO test environment...\n')

  try {
    // 1. Create test users
    console.log('👥 Creating test users...')
    const createdUsers = []
    
    for (const userData of TEST_USERS) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        console.log(`   ⚠️  User ${userData.email} already exists - skipping`)
        createdUsers.push(existingUser)
        continue
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10)
      
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          phoneNumber: userData.phone,
          emailVerified: true,
          phoneVerified: true,
          role: userData.role,
          permissions: userData.permissions ? JSON.stringify(userData.permissions) : null,
          profile: {
            create: userData.profile
          }
        },
        include: {
          profile: true
        }
      })

      createdUsers.push(user)
      console.log(`   ✅ Created ${userData.role}: ${userData.email} - ${userData.description}`)
    }

    // 2. Seed insurance products if not exists
    console.log('\n🏥 Setting up insurance products...')
    const insuranceCount = await prisma.insurance.count()
    
    if (insuranceCount === 0) {
      await prisma.insurance.createMany({
        data: [
          {
            name: 'Basic Coverage',
            description: 'Essential protection for your rental',
            coverageType: 'BASIC',
            maxCoverageAmount: 500000,
            deductibleAmount: 50000,
            accidentCoverage: true,
            theftCoverage: false,
            vandalismCoverage: false,
            naturalDisasterCoverage: false,
            thirdPartyCoverage: true,
            dailyRate: 15000,
            weeklyRate: 90000,
            monthlyRate: 300000,
            insuranceProvider: 'Madison Insurance',
            isActive: true
          },
          {
            name: 'Standard Coverage',
            description: 'Comprehensive protection for peace of mind',
            coverageType: 'COMPREHENSIVE',
            maxCoverageAmount: 1000000,
            deductibleAmount: 30000,
            accidentCoverage: true,
            theftCoverage: true,
            vandalismCoverage: true,
            naturalDisasterCoverage: false,
            thirdPartyCoverage: true,
            dailyRate: 25000,
            weeklyRate: 150000,
            monthlyRate: 500000,
            insuranceProvider: 'Professional Insurance',
            isActive: true
          },
          {
            name: 'Premium Coverage',
            description: 'Full protection with roadside assistance',
            coverageType: 'PREMIUM',
            maxCoverageAmount: 2000000,
            deductibleAmount: 20000,
            accidentCoverage: true,
            theftCoverage: true,
            vandalismCoverage: true,
            naturalDisasterCoverage: true,
            thirdPartyCoverage: true,
            dailyRate: 45000,
            weeklyRate: 270000,
            monthlyRate: 900000,
            insuranceProvider: 'ZSIC Insurance',
            isActive: true
          }
        ]
      })

      console.log(`   ✅ Created 3 insurance products (Basic, Standard, Premium)`)
    } else {
      console.log(`   ℹ️  Insurance data already exists (${insuranceCount} products)`)
    }

    // 3. Create sample vehicles for HOST users
    console.log('\n🚗 Creating sample vehicles...')
    const hostUsers = createdUsers.filter(u => u.role === 'HOST')
    
    if (hostUsers.length === 0) {
      console.log('   ⚠️  No HOST users found - skipping vehicle creation')
    } else {
      let vehicleIndex = 0
      for (const host of hostUsers) {
        const vehiclesForHost = SAMPLE_VEHICLES.slice(vehicleIndex, vehicleIndex + 2)
        
        for (const vehicleData of vehiclesForHost) {
          const existing = await prisma.vehicle.findUnique({
            where: { plateNumber: vehicleData.plateNumber }
          })

          if (existing) {
            console.log(`   ⚠️  Vehicle ${vehicleData.plateNumber} already exists - skipping`)
            continue
          }

          await prisma.vehicle.create({
            data: {
              ...vehicleData,
              hostId: host.id,
              features: JSON.stringify(vehicleData.features)
            }
          })

          console.log(`   ✅ Created ${vehicleData.year} ${vehicleData.make} ${vehicleData.model} (${vehicleData.plateNumber}) for ${host.email}`)
        }
        
        vehicleIndex += 2
      }
    }

    // 4. Display summary
    console.log('\n' + '='.repeat(70))
    console.log('✅ TEST ENVIRONMENT SETUP COMPLETE!')
    console.log('='.repeat(70))
    
    console.log('\n📋 TEST ACCOUNTS CREATED:\n')
    console.log('┌─────────────────────────────────────────────────────────────────┐')
    console.log('│ Role        │ Email                    │ Password   │ Purpose  │')
    console.log('├─────────────────────────────────────────────────────────────────┤')
    
    TEST_USERS.forEach(user => {
      console.log(`│ ${user.role.padEnd(11)} │ ${user.email.padEnd(24)} │ Test@123   │ ${user.description.substring(0, 30).padEnd(8)} │`)
    })
    
    console.log('└─────────────────────────────────────────────────────────────────┘')

    console.log('\n🎯 TESTING WORKFLOW:\n')
    console.log('1. 🔐 LOGIN AS RENTER (john.renter@test.com)')
    console.log('   → Search for vehicles')
    console.log('   → Book a vehicle with insurance')
    console.log('   → Make payment')
    console.log('   → View booking details')
    console.log('')
    console.log('2. 🚗 LOGIN AS HOST (sarah.host@test.com)')
    console.log('   → View your vehicles')
    console.log('   → Add new vehicle listings')
    console.log('   → Manage bookings')
    console.log('   → Process handover inspections')
    console.log('')
    console.log('3. 🛡️  TEST INSURANCE CLAIMS')
    console.log('   → Create a booking with insurance')
    console.log('   → File a claim during rental')
    console.log('   → Upload claim documents')
    console.log('   → Admin reviews and approves claim')
    console.log('')
    console.log('4. 👑 LOGIN AS ADMIN (mike.admin@test.com)')
    console.log('   → Manage all users')
    console.log('   → Approve/reject vehicles')
    console.log('   → Process payments and payouts')
    console.log('   → Review and settle claims')
    console.log('   → View analytics dashboard')
    console.log('')
    console.log('5. 🎫 COMPLETE BOOKING FLOW')
    console.log('   → Search → Book → Pay → Pickup Inspection → Return Inspection → Review')
    console.log('')
    
    console.log('💡 ADMIN ACCESS:')
    console.log('   Main Admin: drakemacchiko@gmail.com (password123)')
    console.log('   Test Admin: mike.admin@test.com (Test@123)')
    console.log('')
    console.log('🌐 PRODUCTION URL:')
    console.log('   https://zemo-bannyh0ir-zed-designs-dev-team.vercel.app')
    console.log('')
    console.log('='.repeat(70))

  } catch (error) {
    console.error('❌ Error setting up test environment:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run setup
setupTestEnvironment()
  .then(() => {
    console.log('\n✨ Setup completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Setup failed:', error)
    process.exit(1)
  })
