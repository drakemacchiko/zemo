#!/usr/bin/env node

/**
 * Pre-deployment checklist script
 * Run this before deploying to Vercel to ensure everything is ready
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('\n🚀 ZEMO Pre-Deployment Checklist\n');
console.log('='.repeat(50));

const checks = [];

// Check 1: Git status
console.log('\n📋 Checking Git status...');
try {
  const status = execSync('git status --porcelain').toString();
  if (status.trim()) {
    checks.push({ name: 'Git Status', status: '⚠️  WARNING', message: 'You have uncommitted changes' });
  } else {
    checks.push({ name: 'Git Status', status: '✅ PASS', message: 'All changes committed' });
  }
} catch (e) {
  checks.push({ name: 'Git Status', status: '❌ FAIL', message: 'Git not initialized' });
}

// Check 2: Build
console.log('🔨 Testing production build...');
try {
  execSync('npm run build', { stdio: 'ignore' });
  checks.push({ name: 'Production Build', status: '✅ PASS', message: 'Build successful' });
} catch (e) {
  checks.push({ name: 'Production Build', status: '❌ FAIL', message: 'Build failed - fix errors before deploying' });
}

// Check 3: TypeScript
console.log('📘 Checking TypeScript...');
try {
  execSync('npx tsc --noEmit', { stdio: 'ignore' });
  checks.push({ name: 'TypeScript', status: '✅ PASS', message: 'No type errors' });
} catch (e) {
  checks.push({ name: 'TypeScript', status: '❌ FAIL', message: 'Type errors found' });
}

// Check 4: Environment variables template
console.log('🔐 Checking environment configuration...');
if (fs.existsSync('.env.example')) {
  checks.push({ name: 'Environment Template', status: '✅ PASS', message: '.env.example exists' });
} else {
  checks.push({ name: 'Environment Template', status: '❌ FAIL', message: '.env.example missing' });
}

// Check 5: Required files
console.log('📁 Checking required files...');
const requiredFiles = [
  'package.json',
  'next.config.js',
  'prisma/schema.prisma',
  'public/manifest.json',
  'public/sw.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    allFilesExist = false;
    console.log(`   ❌ Missing: ${file}`);
  }
});

if (allFilesExist) {
  checks.push({ name: 'Required Files', status: '✅ PASS', message: 'All required files present' });
} else {
  checks.push({ name: 'Required Files', status: '❌ FAIL', message: 'Some files missing' });
}

// Print results
console.log('\n' + '='.repeat(50));
console.log('\n📊 RESULTS:\n');

checks.forEach(check => {
  console.log(`${check.status}  ${check.name}`);
  console.log(`    ${check.message}\n`);
});

// Final verdict
const failed = checks.filter(c => c.status.includes('FAIL')).length;
const warnings = checks.filter(c => c.status.includes('WARNING')).length;

console.log('='.repeat(50));

if (failed > 0) {
  console.log('\n❌ DEPLOYMENT NOT READY');
  console.log(`   Fix ${failed} failing check(s) before deploying\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n⚠️  DEPLOYMENT READY WITH WARNINGS');
  console.log(`   ${warnings} warning(s) - review before deploying\n`);
} else {
  console.log('\n✅ READY FOR DEPLOYMENT!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Push to GitHub: git push origin main');
  console.log('   2. Go to: https://vercel.com');
  console.log('   3. Import project: drakemacchiko/zemo');
  console.log('   4. Add environment variables (see DEPLOYMENT.md)');
  console.log('   5. Click Deploy!\n');
}

console.log('📖 Full deployment guide: See DEPLOYMENT.md\n');
