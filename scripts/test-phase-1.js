/**
 * Automated Phase 1 Test Suite
 * 
 * Run with: node scripts/test-phase-1.js
 * 
 * Tests core functionality of Phase 1 features:
 * - Image uploads
 * - Authentication
 * - PWA configuration
 * - Admin routing
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class Phase1TestRunner {
  constructor() {
    this.passedTests = 0;
    this.failedTests = 0;
    this.warnings = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  success(message) {
    this.passedTests++;
    this.log(`✓ ${message}`, 'green');
  }

  fail(message) {
    this.failedTests++;
    this.log(`✗ ${message}`, 'red');
  }

  warn(message) {
    this.warnings.push(message);
    this.log(`⚠ ${message}`, 'yellow');
  }

  info(message) {
    this.log(`ℹ ${message}`, 'cyan');
  }

  section(title) {
    this.log(`\n${'='.repeat(60)}`, 'blue');
    this.log(`  ${title}`, 'blue');
    this.log(`${'='.repeat(60)}`, 'blue');
  }

  // Test 1: Check if PWA files exist
  testPWAFiles() {
    this.section('PWA Configuration');

    const pwaFiles = [
      'public/manifest.json',
      'public/sw.js',
      'public/offline.html',
      'src/components/PWAInstallPrompt.tsx'
    ];

    pwaFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.success(`${file} exists`);
      } else {
        this.fail(`${file} is missing`);
      }
    });

    // Check manifest.json content
    try {
      const manifestPath = path.join(process.cwd(), 'public/manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      if (manifest.name === 'ZEMO') {
        this.success('Manifest name is correct: ZEMO');
      } else {
        this.fail(`Manifest name is incorrect: ${manifest.name}`);
      }

      if (manifest.theme_color === '#EAB308' || manifest.theme_color === '#eab308') {
        this.success('Theme color is correct: #EAB308 (yellow-500)');
      } else {
        this.warn(`Theme color might be incorrect: ${manifest.theme_color}`);
      }

      if (manifest.display === 'standalone') {
        this.success('Display mode is standalone');
      } else {
        this.fail(`Display mode is ${manifest.display}, should be standalone`);
      }

      if (manifest.icons && manifest.icons.length >= 2) {
        this.success(`Manifest has ${manifest.icons.length} icons`);
      } else {
        this.fail('Manifest should have at least 2 icons (192x192, 512x512)');
      }
    } catch (error) {
      this.fail(`Error reading manifest.json: ${error.message}`);
    }
  }

  // Test 2: Check authentication components
  testAuthComponents() {
    this.section('Authentication Components');

    const authFiles = [
      'src/app/login/page.tsx',
      'src/app/register/page.tsx',
      'src/lib/auth.ts',
      'src/lib/auth/jwt.ts',
      'src/middleware.ts'
    ];

    authFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.success(`${file} exists`);

        // Check for specific patterns
        const content = fs.readFileSync(filePath, 'utf8');

        if (file === 'src/app/login/page.tsx') {
          if (content.includes('Eye') && content.includes('EyeOff')) {
            this.success('Login page has password visibility toggle');
          } else {
            this.warn('Login page might be missing password toggle');
          }

          if (content.includes('Mail') && content.includes('Lock')) {
            this.success('Login page has icon-enhanced inputs');
          } else {
            this.warn('Login page might be missing input icons');
          }
        }

        if (file === 'src/middleware.ts') {
          if (content.includes('ADMIN') && content.includes('SUPER_ADMIN')) {
            this.success('Middleware checks for admin roles');
          } else {
            this.fail('Middleware missing admin role checks');
          }

          if (content.includes('/admin')) {
            this.success('Middleware protects admin routes');
          } else {
            this.fail('Middleware not protecting admin routes');
          }
        }
      } else {
        this.fail(`${file} is missing`);
      }
    });
  }

  // Test 3: Check design system components
  testDesignSystem() {
    this.section('Design System Components');

    const designFiles = [
      'src/app/layout.tsx',
      'tailwind.config.js',
      'src/styles/globals.css'
    ];

    designFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.success(`${file} exists`);

        const content = fs.readFileSync(filePath, 'utf8');

        if (file === 'tailwind.config.js') {
          if (content.includes('yellow') || content.includes('#EAB308')) {
            this.success('Tailwind config includes primary yellow color');
          } else {
            this.warn('Tailwind config might be missing yellow-500 customization');
          }
        }

        if (file === 'src/app/layout.tsx') {
          if (content.includes('Inter') || content.includes('font-inter')) {
            this.success('Layout uses Inter font family');
          } else {
            this.warn('Layout might not be using Inter font');
          }

          if (content.includes('PWAInstallPrompt')) {
            this.success('Layout includes PWA install prompt');
          } else {
            this.fail('Layout missing PWA install prompt component');
          }
        }
      } else {
        this.fail(`${file} is missing`);
      }
    });
  }

  // Test 4: Check navigation components
  testNavigation() {
    this.section('Navigation Components');

    const navFiles = [
      'src/components/layout/Header.tsx',
      'src/components/layout/Footer.tsx'
    ];

    navFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.success(`${file} exists`);

        const content = fs.readFileSync(filePath, 'utf8');

        if (file === 'src/components/layout/Header.tsx') {
          if (content.includes('List your car') || content.includes('Become a host')) {
            this.success('Header has "List your car" CTA');
          } else {
            this.warn('Header might be missing host CTA');
          }

          if (content.includes('Menu') || content.includes('hamburger')) {
            this.success('Header has mobile menu');
          } else {
            this.warn('Header might be missing mobile menu');
          }
        }

        if (file === 'src/components/layout/Footer.tsx') {
          if (content.includes('About') && content.includes('Privacy')) {
            this.success('Footer has About and Privacy links');
          } else {
            this.warn('Footer might be missing key links');
          }
        }
      } else {
        this.fail(`${file} is missing`);
      }
    });
  }

  // Test 5: Check admin dashboard
  testAdminDashboard() {
    this.section('Admin Dashboard');

    const adminFiles = [
      'src/app/admin/page.tsx',
      'src/app/admin/layout.tsx',
      'src/app/admin/users/page.tsx',
      'src/app/admin/vehicles/page.tsx',
      'src/app/admin/bookings/page.tsx',
      'src/app/admin/payments/page.tsx',
      'src/app/admin/claims/page.tsx'
    ];

    adminFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.success(`${file} exists`);
      } else {
        this.fail(`${file} is missing`);
      }
    });

    // Check admin page has charts
    const adminPagePath = path.join(process.cwd(), 'src/app/admin/page.tsx');
    if (fs.existsSync(adminPagePath)) {
      const content = fs.readFileSync(adminPagePath, 'utf8');
      
      if (content.includes('Chart') || content.includes('chart.js')) {
        this.success('Admin dashboard includes charts');
      } else {
        this.warn('Admin dashboard might be missing charts');
      }

      if (content.includes('totalUsers') || content.includes('stats')) {
        this.success('Admin dashboard has stats');
      } else {
        this.warn('Admin dashboard might be missing stats');
      }
    }
  }

  // Test 6: Check homepage
  testHomepage() {
    this.section('Homepage');

    const homepagePath = path.join(process.cwd(), 'src/app/page.tsx');
    if (fs.existsSync(homepagePath)) {
      this.success('Homepage (src/app/page.tsx) exists');

      const content = fs.readFileSync(homepagePath, 'utf8');

      const sections = [
        { name: 'Hero section', pattern: /hero|Hero|HERO/i },
        { name: 'Search form', pattern: /search|Search/i },
        { name: 'How it works', pattern: /how.*works|How.*Works/i },
        { name: 'Popular vehicles', pattern: /popular|Popular|vehicles/i },
        { name: 'CTA section', pattern: /cta|CTA|call.*action/i }
      ];

      sections.forEach(section => {
        if (section.pattern.test(content)) {
          this.success(`Homepage has ${section.name}`);
        } else {
          this.warn(`Homepage might be missing ${section.name}`);
        }
      });
    } else {
      this.fail('Homepage is missing');
    }
  }

  // Test 7: Check image upload infrastructure
  testImageUploads() {
    this.section('Image Upload Infrastructure');

    const uploadDirs = [
      'public/uploads',
      'public/uploads/vehicles',
      'public/uploads/documents'
    ];

    uploadDirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        this.success(`${dir} directory exists`);
      } else {
        this.warn(`${dir} directory missing (will be created on first upload)`);
      }
    });

    // Check for upload API routes
    const uploadApiPath = path.join(process.cwd(), 'src/app/api/upload');
    if (fs.existsSync(uploadApiPath)) {
      this.success('Upload API routes exist');
    } else {
      this.warn('Upload API routes might be missing');
    }
  }

  // Test 8: Check environment variables
  testEnvironment() {
    this.section('Environment Configuration');

    const envPath = path.join(process.cwd(), '.env.local');
    const envExamplePath = path.join(process.cwd(), '.env.example');

    if (fs.existsSync(envExamplePath)) {
      this.success('.env.example exists');
    } else {
      this.warn('.env.example missing (should document required vars)');
    }

    if (fs.existsSync(envPath)) {
      this.success('.env.local exists');

      const envContent = fs.readFileSync(envPath, 'utf8');
      const requiredVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'NEXT_PUBLIC_APP_URL'
      ];

      requiredVars.forEach(varName => {
        if (envContent.includes(varName)) {
          this.success(`${varName} is defined`);
        } else {
          this.fail(`${varName} is missing from .env.local`);
        }
      });
    } else {
      this.fail('.env.local missing (copy from .env.example)');
    }
  }

  // Test 9: Check package dependencies
  testDependencies() {
    this.section('Package Dependencies');

    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      this.success('package.json exists');

      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      const requiredDeps = {
        'next': 'Next.js framework',
        'react': 'React library',
        'tailwindcss': 'Tailwind CSS',
        'lucide-react': 'Icon library',
        'jsonwebtoken': 'JWT authentication',
        'bcryptjs': 'Password hashing',
        '@prisma/client': 'Database ORM',
        'chart.js': 'Charts for admin dashboard'
      };

      Object.entries(requiredDeps).forEach(([dep, description]) => {
        if (deps[dep]) {
          this.success(`${dep} installed (${description})`);
        } else {
          this.fail(`${dep} missing (needed for ${description})`);
        }
      });
    } else {
      this.fail('package.json missing');
    }
  }

  // Test 10: Check TypeScript configuration
  testTypeScript() {
    this.section('TypeScript Configuration');

    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      this.success('tsconfig.json exists');

      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

      if (tsConfig.compilerOptions?.strict) {
        this.success('Strict mode enabled');
      } else {
        this.warn('Strict mode not enabled (recommended for type safety)');
      }

      if (tsConfig.compilerOptions?.paths?.['@/*']) {
        this.success('Path alias @/* configured');
      } else {
        this.fail('Path alias @/* not configured');
      }
    } else {
      this.fail('tsconfig.json missing');
    }
  }

  // Run all tests
  async runAll() {
    this.log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    this.log('║          ZEMO Phase 1 Automated Test Suite               ║', 'cyan');
    this.log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    this.testPWAFiles();
    this.testAuthComponents();
    this.testDesignSystem();
    this.testNavigation();
    this.testAdminDashboard();
    this.testHomepage();
    this.testImageUploads();
    this.testEnvironment();
    this.testDependencies();
    this.testTypeScript();

    // Print summary
    this.section('Test Summary');
    this.log(`\nTotal Tests: ${this.passedTests + this.failedTests}`, 'blue');
    this.log(`Passed: ${this.passedTests}`, 'green');
    this.log(`Failed: ${this.failedTests}`, 'red');
    this.log(`Warnings: ${this.warnings.length}`, 'yellow');

    const successRate = ((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1);
    this.log(`\nSuccess Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');

    if (this.failedTests === 0) {
      this.log('\n🎉 All tests passed! Phase 1 is looking good!', 'green');
    } else {
      this.log(`\n⚠️  ${this.failedTests} test(s) failed. Please review the issues above.`, 'red');
    }

    if (this.warnings.length > 0) {
      this.log('\n⚠️  Warnings (review recommended):', 'yellow');
      this.warnings.forEach((warning, i) => {
        this.log(`  ${i + 1}. ${warning}`, 'yellow');
      });
    }

    this.log('\n📋 For manual testing, see: docs/PHASE-1-TESTING-CHECKLIST.md\n', 'cyan');

    // Exit with appropriate code
    process.exit(this.failedTests > 0 ? 1 : 0);
  }
}

// Run tests
const runner = new Phase1TestRunner();
runner.runAll();
