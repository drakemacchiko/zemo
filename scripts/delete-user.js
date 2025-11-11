/* eslint-disable no-console */
require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteUser(email) {
  try {
    console.log(`Deleting user: ${email}`)
    
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      await prisma.user.delete({
        where: { email }
      })
      console.log('✅ User deleted successfully!')
    } else {
      console.log('❌ User not found')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2] || 'drakemacchiko@gmail.com'
deleteUser(email)
