const { PrismaClient } = require('@prisma/client');

async function verifyVehicles() {
  const prisma = new PrismaClient();
  
  try {
    console.log('\n🔧 Updating vehicle verification status...\n');
    
    const result = await prisma.vehicle.updateMany({
      where: {
        verificationStatus: 'PENDING'
      },
      data: {
        verificationStatus: 'VERIFIED'
      }
    });
    
    console.log(`✅ Updated ${result.count} vehicles to VERIFIED status\n`);
    
    // Verify the update
    const vehicles = await prisma.vehicle.findMany({
      select: {
        plateNumber: true,
        make: true,
        model: true,
        verificationStatus: true,
        availabilityStatus: true,
        isActive: true
      }
    });
    
    console.log('Current vehicle status:');
    console.log('========================================');
    vehicles.forEach(v => {
      console.log(`${v.make} ${v.model} (${v.plateNumber})`);
      console.log(`  Verification: ${v.verificationStatus}`);
      console.log(`  Availability: ${v.availabilityStatus}`);
      console.log(`  Active: ${v.isActive}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyVehicles();
