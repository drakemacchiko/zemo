const { PrismaClient } = require('@prisma/client');

async function checkVehicles() {
  const prisma = new PrismaClient();
  
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        host: {
          select: {
            email: true,
            profile: true
          }
        }
      }
    });
    
    console.log('\n========================================');
    console.log('TOTAL VEHICLES IN DATABASE:', vehicles.length);
    console.log('========================================\n');
    
    vehicles.forEach((v, i) => {
      console.log(`${i + 1}. ${v.year} ${v.make} ${v.model} (${v.plateNumber})`);
      console.log(`   Host: ${v.host.email}`);
      console.log(`   Status: ${v.availabilityStatus}`);
      console.log(`   Active: ${v.isActive}`);
      console.log(`   Verification: ${v.verificationStatus}`);
      console.log(`   Daily Rate: ZMW ${v.dailyRate}`);
      console.log(`   Location: ${v.locationAddress}`);
      console.log('');
    });
    
    // Check if any are available
    const available = vehicles.filter(v => v.availabilityStatus === 'AVAILABLE' && v.isActive);
    console.log(`Available vehicles: ${available.length}`);
    
    const verified = vehicles.filter(v => v.verificationStatus === 'APPROVED');
    console.log(`Verified vehicles: ${verified.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVehicles();
