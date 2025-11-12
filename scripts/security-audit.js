#!/usr/bin/env node
/**
 * ZEMO Security Audit Script
 * Performs comprehensive security checks before deployment
 * 
 * Checks:
 * - Environment variable security
 * - Dependency vulnerabilities
 * - Code quality issues
 * - Security best practices
 */

/* eslint-disable no-console */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🔒 ZEMO Security Audit');
console.log('='.repeat(50));

const checks = {
  passed: [],
  warnings: [],
  failed: [],
};

// ============================================
// Check 1: Environment Variable Security
// ============================================
console.log('\n📋 Checking environment variables...');

function checkEnvSecurity() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    checks.failed.push(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  } else {
    checks.passed.push('All required environment variables present');
  }

  // Check JWT secret strength
  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 32) {
    checks.warnings.push('JWT_SECRET should be at least 32 characters long');
  } else {
    checks.passed.push('JWT_SECRET has adequate length');
  }

  // Check for default/weak secrets
  const weakSecrets = ['secret', 'password', '12345', 'test', 'dummy'];
  const hasWeakSecret = weakSecrets.some((weak) =>
    jwtSecret.toLowerCase().includes(weak)
  );

  if (hasWeakSecret) {
    checks.failed.push('JWT_SECRET appears to be weak or default value');
  } else {
    checks.passed.push('JWT_SECRET is not a common weak value');
  }
}

checkEnvSecurity();

// ============================================
// Check 2: Dependency Vulnerabilities
// ============================================
console.log('\n📦 Checking dependencies for vulnerabilities...');

function checkDependencies() {
  try {
    execSync('npm audit --production --audit-level=high', {
      stdio: 'pipe',
    });
    checks.passed.push('No high-severity vulnerabilities in dependencies');
  } catch (error) {
    const output = error.stdout?.toString() || '';
    if (output.includes('found 0 vulnerabilities')) {
      checks.passed.push('No vulnerabilities found');
    } else {
      checks.warnings.push(
        'Dependency vulnerabilities detected - run "npm audit" for details'
      );
    }
  }
}

checkDependencies();

// ============================================
// Check 3: Sensitive File Exposure
// ============================================
console.log('\n🔍 Checking for exposed sensitive files...');

function checkSensitiveFiles() {
  const sensitiveFiles = ['.env', '.env.local', '.env.production'];
  const gitignorePath = path.join(process.cwd(), '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    checks.failed.push('.gitignore file not found!');
    return;
  }

  const gitignore = fs.readFileSync(gitignorePath, 'utf-8');

  sensitiveFiles.forEach((file) => {
    if (!gitignore.includes(file)) {
      checks.warnings.push(`${file} should be in .gitignore`);
    } else {
      checks.passed.push(`${file} is properly ignored`);
    }
  });
}

checkSensitiveFiles();

// ============================================
// Check 4: HTTPS Configuration
// ============================================
console.log('\n🔐 Checking HTTPS configuration...');

function checkHTTPS() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (process.env.NODE_ENV === 'production' && !appUrl.startsWith('https://')) {
    checks.failed.push(
      'Production APP_URL must use HTTPS for security'
    );
  } else if (process.env.NODE_ENV === 'production') {
    checks.passed.push('Production URL uses HTTPS');
  }
}

checkHTTPS();

// ============================================
// Check 5: Database Security
// ============================================
console.log('\n🗄️  Checking database security...');

function checkDatabaseSecurity() {
  const dbUrl = process.env.DATABASE_URL || '';

  // Check SSL mode for production
  if (process.env.NODE_ENV === 'production') {
    if (!dbUrl.includes('sslmode=require') && !dbUrl.includes('ssl=true')) {
      checks.warnings.push(
        'Production database should enforce SSL connections'
      );
    } else {
      checks.passed.push('Database SSL enforcement configured');
    }
  }

  // Check connection pooling
  if (!dbUrl.includes('connection_limit') && !dbUrl.includes('pool_timeout')) {
    checks.warnings.push(
      'Consider configuring connection pooling for better performance'
    );
  } else {
    checks.passed.push('Database connection pooling configured');
  }
}

checkDatabaseSecurity();

// ============================================
// Check 6: Code Quality
// ============================================
console.log('\n✨ Running code quality checks...');

function checkCodeQuality() {
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    checks.passed.push('ESLint checks passed');
  } catch (error) {
    checks.warnings.push('ESLint found issues - run "npm run lint" to see details');
  }

  // Check TypeScript compilation
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    checks.passed.push('TypeScript type checking passed');
  } catch (error) {
    checks.failed.push('TypeScript type errors detected');
  }
}

checkCodeQuality();

// ============================================
// Check 7: Security Headers
// ============================================
console.log('\n🛡️  Checking security headers configuration...');

function checkSecurityHeaders() {
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');

  if (!fs.existsSync(vercelConfigPath)) {
    checks.warnings.push('vercel.json not found - security headers not configured');
    return;
  }

  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
  const headers = vercelConfig.headers || [];

  const requiredHeaders = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Strict-Transport-Security',
  ];

  const configuredHeaders = headers.flatMap((h) => h.headers || []);
  const missingHeaders = requiredHeaders.filter(
    (header) => !configuredHeaders.some((h) => h.key === header)
  );

  if (missingHeaders.length > 0) {
    checks.warnings.push(
      `Missing security headers: ${missingHeaders.join(', ')}`
    );
  } else {
    checks.passed.push('All critical security headers configured');
  }
}

checkSecurityHeaders();

// ============================================
// Print Results
// ============================================
console.log('\n' + '='.repeat(50));
console.log('📊 Security Audit Results');
console.log('='.repeat(50));

console.log(`\n✅ Passed: ${checks.passed.length}`);
checks.passed.forEach((check) => console.log(`  • ${check}`));

if (checks.warnings.length > 0) {
  console.log(`\n⚠️  Warnings: ${checks.warnings.length}`);
  checks.warnings.forEach((warning) => console.log(`  • ${warning}`));
}

if (checks.failed.length > 0) {
  console.log(`\n❌ Failed: ${checks.failed.length}`);
  checks.failed.forEach((failure) => console.log(`  • ${failure}`));
}

// Exit with error if critical issues found
if (checks.failed.length > 0) {
  console.log('\n❌ Security audit failed! Fix critical issues before deployment.');
  process.exit(1);
} else if (checks.warnings.length > 0) {
  console.log('\n⚠️  Security audit passed with warnings. Review before deployment.');
  process.exit(0);
} else {
  console.log('\n✅ Security audit passed! Safe to deploy.');
  process.exit(0);
}
