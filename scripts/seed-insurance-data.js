// Sample script to populate insurance products
// Run with: node scripts/seed-insurance-data.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const insuranceProducts = [
  {
    name: 'Basic Coverage',
    description: 'Essential protection for your rental vehicle including third-party liability and basic accident coverage.',
    coverageType: 'BASIC',
    maxCoverageAmount: 25000,
    deductibleAmount: 2000,
    accidentCoverage: true,
    theftCoverage: false,
    vandalismCoverage: false,
    naturalDisasterCoverage: false,
    thirdPartyCoverage: true,
    dailyRate: 12.0,
    weeklyRate: 75.0,
    monthlyRate: 300.0,
    insuranceProvider: 'Madison Insurance',
    policyTermsUrl: 'https://zemo.zm/insurance/basic-terms',
    isActive: true,
  },
  {
    name: 'Comprehensive Coverage',
    description: 'Complete protection including theft, vandalism, and comprehensive accident coverage with lower deductible.',
    coverageType: 'COMPREHENSIVE',
    maxCoverageAmount: 75000,
    deductibleAmount: 1000,
    accidentCoverage: true,
    theftCoverage: true,
    vandalismCoverage: true,
    naturalDisasterCoverage: true,
    thirdPartyCoverage: true,
    dailyRate: 25.0,
    weeklyRate: 160.0,
    monthlyRate: 650.0,
    insuranceProvider: 'Professional Insurance',
    policyTermsUrl: 'https://zemo.zm/insurance/comprehensive-terms',
    isActive: true,
  },
  {
    name: 'Premium Coverage',
    description: 'Ultimate protection with maximum coverage, zero deductible, and additional benefits including roadside assistance.',
    coverageType: 'PREMIUM',
    maxCoverageAmount: 150000,
    deductibleAmount: 0,
    accidentCoverage: true,
    theftCoverage: true,
    vandalismCoverage: true,
    naturalDisasterCoverage: true,
    thirdPartyCoverage: true,
    dailyRate: 45.0,
    weeklyRate: 280.0,
    monthlyRate: 1100.0,
    insuranceProvider: 'ZEMO Premium Partners',
    policyTermsUrl: 'https://zemo.zm/insurance/premium-terms',
    isActive: true,
  },
];

async function seedInsuranceData() {
  try {
    console.log('🏥 Seeding insurance products...');

    // Clear existing insurance data
    await prisma.insurancePolicy.deleteMany();
    await prisma.insurance.deleteMany();

    // Create insurance products
    for (const product of insuranceProducts) {
      const created = await prisma.insurance.create({
        data: product,
      });
      console.log(`✅ Created insurance product: ${created.name}`);
    }

    console.log('🎉 Insurance data seeded successfully!');
    console.log('\nAvailable insurance products:');
    
    const products = await prisma.insurance.findMany({
      select: {
        name: true,
        coverageType: true,
        dailyRate: true,
        maxCoverageAmount: true,
        deductibleAmount: true,
      },
    });

    products.forEach(product => {
      console.log(`- ${product.name} (${product.coverageType}): ZMW ${product.dailyRate}/day, Max Coverage: ZMW ${product.maxCoverageAmount}, Deductible: ZMW ${product.deductibleAmount}`);
    });

  } catch (error) {
    console.error('❌ Error seeding insurance data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Sample claims scenarios for testing
const sampleClaimScenarios = [
  {
    scenario: 'Minor Fender Bender',
    claimType: 'ACCIDENT',
    incidentDescription: 'Minor collision at traffic intersection. Front bumper and headlight damaged. No injuries reported.',
    estimatedDamageAmount: 3500,
    expectedOutcome: 'APPROVED',
    expectedSettlement: 3200,
    policeReportRequired: false,
    urgencyLevel: 'NORMAL',
  },
  {
    scenario: 'Vehicle Theft',
    claimType: 'THEFT',
    incidentDescription: 'Vehicle stolen from hotel parking lot overnight. Keys were secured with guest. CCTV footage available.',
    estimatedDamageAmount: 45000,
    expectedOutcome: 'INVESTIGATING',
    expectedSettlement: 40000,
    policeReportRequired: true,
    urgencyLevel: 'HIGH',
  },
  {
    scenario: 'Vandalism Damage',
    claimType: 'VANDALISM',
    incidentDescription: 'Windows smashed and tires slashed while parked in public area. No valuable items stolen.',
    estimatedDamageAmount: 2800,
    expectedOutcome: 'APPROVED',
    expectedSettlement: 2500,
    policeReportRequired: true,
    urgencyLevel: 'NORMAL',
  },
  {
    scenario: 'Storm Damage',
    claimType: 'NATURAL_DISASTER',
    incidentDescription: 'Hail damage to roof and windshield during severe thunderstorm. Multiple dents and cracked windshield.',
    estimatedDamageAmount: 5200,
    expectedOutcome: 'APPROVED',
    expectedSettlement: 4800,
    policeReportRequired: false,
    urgencyLevel: 'NORMAL',
  },
  {
    scenario: 'Third-Party Liability',
    claimType: 'THIRD_PARTY',
    incidentDescription: 'Collision caused damage to third-party vehicle and property. Our driver determined at fault.',
    estimatedDamageAmount: 12000,
    expectedOutcome: 'UNDER_REVIEW',
    expectedSettlement: 10500,
    policeReportRequired: true,
    urgencyLevel: 'HIGH',
  },
];

async function displayClaimScenarios() {
  console.log('\n📋 Sample Claim Scenarios for Testing:');
  console.log('=====================================');
  
  sampleClaimScenarios.forEach((scenario, index) => {
    console.log(`\n${index + 1}. ${scenario.scenario}`);
    console.log(`   Type: ${scenario.claimType}`);
    console.log(`   Description: ${scenario.incidentDescription}`);
    console.log(`   Estimated Damage: ZMW ${scenario.estimatedDamageAmount}`);
    console.log(`   Expected Outcome: ${scenario.expectedOutcome}`);
    console.log(`   Expected Settlement: ZMW ${scenario.expectedSettlement}`);
    console.log(`   Police Report Required: ${scenario.policeReportRequired ? 'Yes' : 'No'}`);
    console.log(`   Urgency: ${scenario.urgencyLevel}`);
  });

  console.log('\n📝 Testing Instructions:');
  console.log('1. Create bookings with insurance using POST /api/bookings');
  console.log('2. Submit claims using POST /api/claims with the scenarios above');
  console.log('3. Test admin review workflow using PUT /api/admin/claims/:id');
  console.log('4. Upload claim documents using POST /api/claims/:id/documents');
  console.log('5. Test webhook handlers with mock insurance provider updates');
}

// Main execution
if (require.main === module) {
  seedInsuranceData().then(() => {
    displayClaimScenarios();
  });
}

module.exports = {
  seedInsuranceData,
  insuranceProducts,
  sampleClaimScenarios,
};