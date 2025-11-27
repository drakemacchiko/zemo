# ZEMO Phase 1 - Quick Start Guide

## Overview
This guide helps you run and test the ZEMO application after Phase 1 completion.

---

## Prerequisites

- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0
- **PostgreSQL:** Database instance (or Supabase account)
- **Git:** For version control

---

## Installation

### 1. Clone & Install Dependencies
```powershell
# Navigate to project directory
cd F:\zemo

# Install dependencies
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/zemo_dev"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-characters"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Database Setup
```powershell
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed database with test data
npx prisma db seed
```

---

## Running the Application

### Development Mode
```powershell
# Start development server (with hot reload)
npm run dev

# Open browser to http://localhost:3000
```

### Production Build
```powershell
# Build for production
npm run build

# Start production server
npm run start
```

---

## Testing

### Automated Tests

#### Run Phase 1 Test Suite
```powershell
# Run automated test suite (63 tests)
node scripts/test-phase-1.js
```

**Expected Output:**
```
Total Tests: 63
Passed: 62
Failed: 1
Success Rate: 98.4%
```

#### Run Unit Tests
```powershell
# Run Jest unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode (for development)
npm run test:watch
```

### Manual Testing

#### 1. PWA Install Prompt
```powershell
# Start dev server
npm run dev

# Open http://localhost:3000
# Wait 30 seconds
# Install prompt should appear at bottom of screen
```

**Test on Different Devices:**
- **iOS Safari:** Shows custom instructions modal
- **Android Chrome:** Shows native install prompt
- **Desktop Chrome:** Shows native install prompt

#### 2. Authentication Flow
```powershell
# Navigate to http://localhost:3000/login

# Test Features:
# - Email input has Mail icon (left side)
# - Password input has Lock icon (left side)
# - Password has Eye/EyeOff toggle button (right side)
# - Click Eye icon → password becomes visible
# - Submit with invalid credentials → error displays
# - Submit with valid credentials → redirects based on role
```

**Role-Based Redirects:**
- `SUPER_ADMIN` / `ADMIN` → `/admin`
- `HOST` → `/host`
- `RENTER` → `/profile` (or stays on homepage)

#### 3. Admin Dashboard Access
```powershell
# Login as ADMIN or SUPER_ADMIN
# Should automatically redirect to /admin

# Test accessing:
# - /admin (dashboard with stats & charts)
# - /admin/users (user management)
# - /admin/vehicles (vehicle approval)
# - /admin/bookings (booking management)
# - /admin/payments (payment tracking)
# - /admin/claims (insurance claims)
```

#### 4. Middleware Protection
```powershell
# Log out (clear localStorage.accessToken)
# Try accessing /admin
# → Should redirect to /login?redirect=/admin

# Login as RENTER
# Try accessing /admin
# → Should redirect to / (homepage) with 403-like behavior
```

---

## Creating Test Users

### Using Prisma Studio
```powershell
# Open Prisma Studio GUI
npx prisma studio

# Navigate to http://localhost:5555
# Add users with different roles:
# - SUPER_ADMIN
# - ADMIN
# - HOST
# - RENTER (or USER)
```

### Using API (if registration endpoint exists)
```powershell
# POST to /api/auth/register
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@zemo.com","password":"password123","role":"ADMIN"}'
```

### Using Script (if exists)
```powershell
# Check if create-admin-user.js exists
node scripts/create-admin-user.js
```

---

## Performance Testing

### Lighthouse CI
```powershell
# Run Lighthouse audit
npm run lighthouse
```

**Target Scores:**
- Performance: >= 90 (Desktop), >= 85 (Mobile)
- Accessibility: >= 95
- Best Practices: >= 90
- SEO: >= 90
- PWA: Installable

### Load Testing (Artillery)
```powershell
# Test peak load
npm run load:test

# Test search API
npm run load:search
```

---

## Deployment

### Pre-Deployment Checks
```powershell
# 1. Run automated tests
node scripts/test-phase-1.js

# 2. Run unit tests
npm run test

# 3. Type check
npm run type-check

# 4. Lint code
npm run lint

# 5. Security audit
npm run security:audit

# 6. Pre-deploy check script
npm run deploy:check
```

### Deploy to Vercel
```powershell
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Or use npm script
npm run deploy:production
```

**Environment Variables in Vercel:**
- Set all `.env.local` variables in Vercel dashboard
- Change `JWT_SECRET` to a strong random value
- Set `NODE_ENV=production`
- Set `NEXT_PUBLIC_APP_URL` to your production domain

---

## Common Issues & Solutions

### Issue: "Cannot find module '@/lib/auth'"
**Solution:**
```powershell
# Restart TypeScript server in VS Code
# Press Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Or restart dev server
npm run dev
```

### Issue: PWA Install Prompt Not Showing
**Solution:**
- Wait 30 seconds (delay is intentional)
- Check if already installed (display-mode: standalone)
- Clear localStorage: `localStorage.removeItem('pwa-install-dismissed')`
- Use Incognito/Private browsing mode

### Issue: Middleware Not Redirecting
**Solution:**
1. Check token exists: `localStorage.getItem('accessToken')`
2. Verify token is valid (not expired)
3. Check user role in token payload
4. Restart dev server (middleware runs on server)

### Issue: Admin Routes Return 404
**Solution:**
```powershell
# Verify admin pages exist
ls src/app/admin/

# Should see:
# - page.tsx
# - layout.tsx
# - users/page.tsx
# - vehicles/page.tsx
# - bookings/page.tsx
# - payments/page.tsx
# - claims/page.tsx
```

### Issue: Database Connection Errors
**Solution:**
```powershell
# Test database connection
node scripts/test-db-connection.js

# Check DATABASE_URL in .env.local
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Regenerate Prisma client
npx prisma generate
```

---

## File Structure Reference

```
zemo/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with PWA prompt
│   │   ├── page.tsx                      # Homepage
│   │   ├── login/page.tsx                # Modern login page ✨
│   │   ├── register/page.tsx             # Registration page
│   │   └── admin/                        # Admin dashboard
│   │       ├── page.tsx                  # Main dashboard
│   │       ├── layout.tsx                # Admin layout
│   │       ├── users/page.tsx            # User management
│   │       ├── vehicles/page.tsx         # Vehicle approval
│   │       ├── bookings/page.tsx         # Booking management
│   │       ├── payments/page.tsx         # Payment tracking
│   │       └── claims/page.tsx           # Claims management
│   ├── components/
│   │   ├── PWAInstallPrompt.tsx          # PWA install prompt ✨
│   │   └── layout/
│   │       ├── Header.tsx                # Navigation header
│   │       └── Footer.tsx                # Footer
│   ├── lib/
│   │   ├── auth.ts                       # Auth utilities
│   │   ├── auth/
│   │   │   └── jwt.ts                    # JWT utilities ✨
│   │   └── db.ts                         # Prisma client
│   └── middleware.ts                     # Role-based routing ✨
├── public/
│   ├── manifest.json                     # PWA manifest
│   ├── sw.js                             # Service worker
│   ├── offline.html                      # Offline page
│   └── uploads/                          # User uploads
│       ├── vehicles/                     # Vehicle photos
│       └── documents/                    # ID, license, insurance
├── docs/
│   ├── PHASE-1-TESTING-CHECKLIST.md      # Manual testing guide ✨
│   └── phase-1-completion-final.md       # Completion summary ✨
├── scripts/
│   ├── test-phase-1.js                   # Automated test suite ✨
│   └── ...other scripts
├── .env.local                            # Environment variables
├── package.json                          # Dependencies & scripts
└── README.md                             # Project documentation

✨ = New/Modified in Phase 1 (Tasks 10-13)
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Admin (Requires ADMIN/SUPER_ADMIN Role)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/analytics?range=7d` - Analytics data
- `GET /api/admin/users` - List users
- `GET /api/admin/vehicles` - List vehicles
- `GET /api/admin/bookings` - List bookings
- `GET /api/admin/payments` - List payments
- `GET /api/admin/claims` - List insurance claims

### User (Authenticated)
- `GET /api/messages/unread-count` - Unread message count
- `GET /api/notifications/unread-count` - Unread notification count

---

## Browser DevTools Tips

### Check PWA Installation Status
```javascript
// Open DevTools Console
// Check if already installed
window.matchMedia('(display-mode: standalone)').matches
// true = installed, false = not installed
```

### Check JWT Token
```javascript
// Open DevTools Console
// Get current token
localStorage.getItem('accessToken')

// Decode token (copy token, paste at jwt.io)
// Or use this function:
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  );
  return JSON.parse(jsonPayload);
}

parseJwt(localStorage.getItem('accessToken'))
// Returns: { userId, email, role, iat, exp }
```

### Check Service Worker
```javascript
// Open DevTools Console
// Check if service worker is registered
navigator.serviceWorker.getRegistration()

// Check service worker status
navigator.serviceWorker.controller
```

### Simulate Offline Mode
```
1. Open DevTools
2. Go to "Network" tab
3. Change throttling dropdown from "Online" to "Offline"
4. Reload page → should show offline.html
```

---

## Keyboard Shortcuts (VS Code)

- `Ctrl + Shift + P` - Command palette
- `Ctrl + `` ` `` - Toggle terminal
- `F5` - Start debugging
- `Ctrl + Shift + B` - Run build task
- `Alt + Shift + F` - Format document (Prettier)

---

## Useful Commands

### Database
```powershell
# Open Prisma Studio (visual DB editor)
npx prisma studio

# Reset database (delete all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name

# View database schema
npx prisma db pull
```

### Development
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

### Git
```powershell
# Check current status
git status

# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: your feature description"

# Push to remote
git push origin feature/your-feature-name
```

---

## Support & Documentation

### Phase 1 Documentation
- **Testing Checklist:** `/docs/PHASE-1-TESTING-CHECKLIST.md`
- **Completion Summary:** `/docs/phase-1-completion-final.md`
- **Automated Tests:** Run `node scripts/test-phase-1.js`

### Project Documentation
- **Main README:** `/README.md`
- **Deployment Guide:** `/DEPLOYMENT.md`
- **Setup Guide:** `/SETUP.md`
- **Phase 2 Plan:** `/ZEMO-REBUILD-PHASE-2-HOST-EXPERIENCE.md`

### External Resources
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Lucide Icons:** https://lucide.dev/icons

---

## Phase 1 Completion Status

✅ **All 13 Tasks Complete**
- Task 10: PWA Configuration
- Task 11: Authentication Modernization
- Task 12: Admin Dashboard Routing
- Task 13: Comprehensive Testing

**Test Results:** 98.4% Pass Rate (62/63 tests)  
**Status:** Ready for Phase 2 🚀

---

**Last Updated:** [Auto-generated by GitHub Copilot]
