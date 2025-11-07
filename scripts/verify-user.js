/* eslint-disable no-console */
require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyUser(email) {
  try {
    console.log(`Checking for user: ${email}`)
    
    const user = await prisma.user.findUnique({
      where: {
        email: email
      },
      include: {
        profile: true
      }
    })

    if (user) {
      console.log('✅ User found:')
      console.log(`- ID: ${user.id}`)
      console.log(`- Email: ${user.email}`)
      console.log(`- Phone: ${user.phoneNumber || 'Not provided'}`)
      console.log(`- Email Verified: ${user.emailVerified}`)
      console.log(`- Phone Verified: ${user.phoneVerified}`)
      console.log(`- Role: ${user.role}`)
      console.log(`- Created: ${user.createdAt}`)
      
      if (user.profile) {
        console.log(`- Full Name: ${user.profile.firstName} ${user.profile.lastName}`)
        console.log(`- Date of Birth: ${user.profile.dateOfBirth || 'Not provided'}`)
        console.log(`- License Verified: ${user.profile.licenseVerified}`)
      }

      // Verify the user if not already verified
      if (!user.emailVerified) {
        console.log('\n🔄 Verifying user email...')
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { 
            emailVerified: true
          }
        })
        console.log('✅ Email verified successfully!')
      } else {
        console.log('\n✅ User email already verified')
      }

    } else {
      console.log('❌ User not found')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line argument
const email = process.argv[2]
if (!email) {
  console.log('Usage: node verify-user.js <email>')
  process.exit(1)
}

verifyUser(email)