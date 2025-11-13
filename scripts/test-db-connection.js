/**
 * Database Connection Diagnostics
 * Tests various connection strings to Supabase
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection(connectionString, description) {
  console.log(`\n🔍 Testing: ${description}`);
  console.log(`   Connection: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });

  try {
    const startTime = Date.now();
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ SUCCESS - Connected in ${duration}ms`);
    console.log(`   Result:`, result);
    return true;
  } catch (error) {
    console.log(`   ❌ FAILED - ${error.message}`);
    if (error.code) console.log(`   Error Code: ${error.code}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  ZEMO Database Connection Diagnostics');
  console.log('═══════════════════════════════════════════════════');

  const host = 'db.mydudeietjwoubzmmngz.supabase.co';
  const password = encodeURIComponent('@421ForLife@'); // URL encoded
  const database = 'postgres';
  
  // Test different connection configurations
  const tests = [
    {
      name: 'Session Pooler (Port 6543) with pgbouncer',
      url: `postgresql://postgres:${password}@${host}:6543/${database}?pgbouncer=true&connection_limit=1`,
    },
    {
      name: 'Session Pooler (Port 6543) without pgbouncer',
      url: `postgresql://postgres:${password}@${host}:6543/${database}`,
    },
    {
      name: 'Transaction Pooler (Port 6543)',
      url: `postgresql://postgres:${password}@${host}:6543/${database}?pgbouncer=true&connection_limit=1&pool_timeout=10`,
    },
    {
      name: 'Direct Connection (Port 5432)',
      url: `postgresql://postgres:${password}@${host}:5432/${database}`,
    },
    {
      name: 'Direct Connection with SSL',
      url: `postgresql://postgres:${password}@${host}:5432/${database}?sslmode=require`,
    },
  ];

  const results = [];
  
  for (const test of tests) {
    const success = await testConnection(test.url, test.name);
    results.push({ name: test.name, success });
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Summary');
  console.log('═══════════════════════════════════════════════════');
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\nTotal: ${successCount}/${results.length} successful`);
  
  if (successCount === 0) {
    console.log('\n⚠️  No connections succeeded. Possible issues:');
    console.log('   1. Supabase database is paused (free tier)');
    console.log('   2. Database is still provisioning');
    console.log('   3. Network/firewall blocking connection');
    console.log('   4. Incorrect password or credentials');
    console.log('\n💡 Solution: Check your Supabase dashboard');
    console.log('   URL: https://supabase.com/dashboard/project/mydudeietjwoubzmmngz');
  } else {
    console.log('\n✅ Use the successful connection string in your DATABASE_URL');
  }
  
  console.log('═══════════════════════════════════════════════════\n');
}

main()
  .catch(console.error)
  .finally(() => process.exit());
