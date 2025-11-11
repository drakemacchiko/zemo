/* eslint-disable no-console */
require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    const email = 'drakemacchiko@gmail.com'
    const password = 'password123' // Change this to your desired password
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ User already exists!')
      console.log(`Email: ${existingUser.email}`)
      console.log(`Role: ${existingUser.role}`)
      return
    }

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    console.log('👤 Creating user...')
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phoneNumber: '+260971234567', // Add phone number
        emailVerified: true,
        phoneVerified: true,
        role: 'SUPER_ADMIN', // Make them a super admin
        permissions: JSON.stringify([
          'VIEW_USERS', 'MANAGE_USERS',
          'VIEW_VEHICLES', 'MANAGE_VEHICLES',
          'VIEW_BOOKINGS', 'MANAGE_BOOKINGS',
          'VIEW_CLAIMS', 'MANAGE_CLAIMS',
          'VIEW_PAYMENTS', 'MANAGE_PAYMENTS',
          'VIEW_ANALYTICS', 'MANAGE_SETTINGS'
        ]),
        profile: {
          create: {
            firstName: 'Drake',
            lastName: 'Macchiko',
            country: 'Zambia',
            kycStatus: 'APPROVED'
          }
        }
      },
      include: {
        profile: true
      }
    })

    console.log('\n✅ Super Admin user created successfully!')
    console.log(`📧 Email: ${user.email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`👑 Role: ${user.role}`)
    console.log(`✅ Email Verified: ${user.emailVerified}`)
    console.log(`✅ Phone Verified: ${user.phoneVerified}`)
    console.log(`👤 Name: ${user.profile.firstName} ${user.profile.lastName}`)
    console.log('\n⚠️  Please change your password after first login!')

  } catch (error) {
    console.error('❌ Error creating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
