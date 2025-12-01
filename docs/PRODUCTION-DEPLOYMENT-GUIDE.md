# ZEMO Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### Environment Setup
- [ ] Production domain configured (zemo.zm)
- [ ] SSL certificate installed and auto-renewal enabled
- [ ] CDN configured for static assets
- [ ] Database hosted with automated backups
- [ ] Redis instance for caching (if using)
- [ ] File storage configured (S3/Cloudinary)

### Environment Variables

Create `.env.production` with:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/zemo_production"

# NextAuth
NEXTAUTH_URL="https://zemo.zm"
NEXTAUTH_SECRET="[generate-strong-random-secret]"

# OAuth Providers
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-secret"

# Payment Providers
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK-production-key"
FLUTTERWAVE_SECRET_KEY="FLWSECK-production-key"
FLUTTERWAVE_ENCRYPTION_KEY="FLWSECK-production-encryption"

STRIPE_PUBLIC_KEY="pk_live_production_key"
STRIPE_SECRET_KEY="sk_live_production_key"
STRIPE_WEBHOOK_SECRET="whsec_production_webhook_secret"

# File Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# AWS S3 (alternative to Cloudinary)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="zemo-production"

# Email Service
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@zemo.zm"

# SMS Service
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Monitoring & Analytics
SENTRY_DSN="your-sentry-dsn"
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Application
NEXT_PUBLIC_BASE_URL="https://zemo.zm"
NODE_ENV="production"

# Security
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW_MS="900000"
SESSION_SECRET="[generate-strong-random-secret]"

# Features
ENABLE_LIVE_CHAT="false"
ENABLE_ANALYTICS="true"
MAINTENANCE_MODE="false"
```

### Security Configuration

**1. Generate Secrets:**
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**2. Configure Security Headers** (next.config.js):
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          }
        ]
      }
    ]
  }
}
```

## 📋 Database Preparation

### 1. Run Migrations
```bash
# Generate Prisma client
npx prisma generate

# Run all migrations
npx prisma migrate deploy
```

### 2. Seed Initial Data
```bash
# Seed help articles
npx ts-node prisma/seed-help-articles.ts

# Seed admin user (if needed)
npx ts-node scripts/create-admin.ts
```

### 3. Create Database Indexes
```sql
-- Add indexes for better query performance
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_vehicles_host ON vehicles(host_id);
CREATE INDEX idx_vehicles_status ON vehicles(verification_status, is_active);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_reviews_vehicle ON reviews(vehicle_id);
CREATE INDEX idx_reviews_user ON reviews(reviewer_id);
```

## 🔨 Build & Deploy

### Vercel Deployment

**1. Install Vercel CLI:**
```bash
npm i -g vercel
```

**2. Deploy:**
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**3. Configure Vercel:**
- Add environment variables in Vercel dashboard
- Configure custom domain (zemo.zm)
- Enable automatic HTTPS
- Set up preview deployments for branches

### Alternative: Docker Deployment

**1. Create Dockerfile:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**2. Build & Run:**
```bash
# Build image
docker build -t zemo:latest .

# Run container
docker run -p 3000:3000 --env-file .env.production zemo:latest
```

## 🔄 Post-Deployment Steps

### 1. Verify Core Functionality
```bash
# Health check endpoint
curl https://zemo.zm/api/health

# Test database connection
curl https://zemo.zm/api/health/db

# Test file upload
# (upload test image through UI)

# Test payment processing
# (use Stripe/Flutterwave test cards)
```

### 2. Configure Payment Webhooks

**Flutterwave:**
- Go to Settings > Webhooks
- Add webhook URL: `https://zemo.zm/api/webhooks/flutterwave`
- Enable all payment events

**Stripe:**
```bash
# Add webhook endpoint in Stripe Dashboard
# URL: https://zemo.zm/api/webhooks/stripe
# Events to listen: payment_intent.succeeded, payment_intent.failed, charge.refunded
```

### 3. Submit Sitemaps
```bash
# Submit to Google Search Console
https://search.google.com/search-console

# Add property: https://zemo.zm
# Submit sitemap: https://zemo.zm/sitemap.xml
```

### 4. Configure Monitoring

**Sentry Setup:**
```bash
# Initialize Sentry
npx @sentry/wizard -i nextjs
```

**Uptime Monitoring:**
- Set up UptimeRobot or Pingdom
- Monitor: https://zemo.zm
- Alert channels: Email, SMS, Slack

### 5. Set Up Analytics
- Verify Google Analytics tracking
- Set up conversion goals
- Configure e-commerce tracking
- Test event tracking

## 📊 Performance Optimization

### 1. Enable Caching
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### 2. Configure CDN
- CloudFlare: Add site and update nameservers
- Enable Auto Minify (HTML, CSS, JS)
- Enable Brotli compression
- Set up cache rules for images

### 3. Database Connection Pooling
```javascript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 🔐 Security Hardening

### 1. Enable Rate Limiting
```javascript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map()

export function middleware(request: NextRequest) {
  const ip = request.ip ?? 'anonymous'
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const max = 100 // requests per window

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
  } else {
    const limiter = rateLimit.get(ip)
    if (now > limiter.resetTime) {
      limiter.count = 1
      limiter.resetTime = now + windowMs
    } else {
      limiter.count++
      if (limiter.count > max) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        )
      }
    }
  }

  return NextResponse.next()
}
```

### 2. Configure CORS
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://zemo.zm' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}
```

### 3. Implement CSP
```javascript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.flutterwave.com https://api.stripe.com;
  frame-src 'self' https://checkout.flutterwave.com https://js.stripe.com;
`

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  }
}
```

## 🧪 Testing Checklist

### Pre-Production Tests
- [ ] All user flows work (sign up → booking → review)
- [ ] Payment processing (test mode)
- [ ] Email sending (all templates)
- [ ] File uploads (images, documents)
- [ ] Search functionality
- [ ] Messaging system
- [ ] Admin panel access
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility
- [ ] Load testing (100+ concurrent users)
- [ ] Security scanning (OWASP ZAP)

### Production Smoke Tests
- [ ] Homepage loads
- [ ] User registration works
- [ ] Login/logout works
- [ ] Search returns results
- [ ] Vehicle detail page loads
- [ ] Booking flow completes
- [ ] Payment processing works
- [ ] Emails are sent
- [ ] Admin panel accessible
- [ ] Error pages (404, 500) display correctly

## 📱 Mobile App Deployment (PWA)

### 1. Verify PWA Configuration
- Check `manifest.json` is accessible
- Verify service worker registration
- Test offline functionality
- Test install prompt

### 2. Test on Devices
- iOS Safari (iPhone)
- Chrome (Android)
- Test "Add to Home Screen"
- Verify push notifications (if enabled)

## 🚨 Rollback Plan

### If Critical Issues Occur:

**Vercel:**
```bash
# Rollback to previous deployment
vercel rollback
```

**Docker:**
```bash
# Rollback to previous image
docker pull zemo:previous-tag
docker stop zemo-current
docker run -d --name zemo-current zemo:previous-tag
```

**Database:**
```bash
# Restore from backup
pg_restore -h host -U user -d zemo_production backup.dump
```

## 📈 Post-Launch Monitoring

### Week 1 - Intensive Monitoring
- Monitor error rates (Sentry)
- Check server performance (CPU, memory)
- Track response times
- Monitor database connections
- Review user feedback
- Fix critical bugs immediately

### Week 2-4 - Stabilization
- Analyze user behavior (Google Analytics)
- Identify bottlenecks
- Optimize slow queries
- Improve UX based on data
- Plan feature iterations

## 🎯 Success Metrics

### Track Daily:
- Active users
- New registrations
- Bookings created
- Booking completion rate
- Payment success rate
- Error rate
- Average response time

### Track Weekly:
- User retention
- Booking conversion rate
- Revenue
- Customer support tickets
- Average resolution time
- User satisfaction (reviews, ratings)

## 📞 Emergency Contacts

### Critical Issues Escalation:
- **Tech Lead:** [Phone/Email]
- **DevOps:** [Phone/Email]
- **Database Admin:** [Phone/Email]
- **Payment Provider Support:** [Phone/Email]
- **Hosting Provider Support:** [Phone/Email]

### Incident Response Process:
1. Identify and assess severity
2. Notify team lead immediately
3. Document issue in incident log
4. Implement fix or rollback
5. Monitor for stability
6. Post-mortem review within 48 hours

---

## ✅ Launch Day Checklist

### T-24 Hours:
- [ ] Final code freeze
- [ ] All tests passing
- [ ] Backups verified
- [ ] Team briefed
- [ ] Support team ready
- [ ] Monitoring configured
- [ ] Rollback plan reviewed

### T-1 Hour:
- [ ] Final smoke tests complete
- [ ] Database migrated
- [ ] Environment variables set
- [ ] SSL certificate verified
- [ ] CDN configured

### Launch:
- [ ] Deploy to production
- [ ] Run smoke tests
- [ ] Verify all systems operational
- [ ] Monitor error logs
- [ ] Test critical flows
- [ ] Announce launch

### T+1 Hour:
- [ ] All metrics normal
- [ ] No critical errors
- [ ] User flows working
- [ ] Payments processing
- [ ] Team monitoring

### T+24 Hours:
- [ ] Review metrics
- [ ] Address any issues
- [ ] Gather user feedback
- [ ] Plan hotfixes if needed

---

**🎉 You're ready to launch ZEMO! Good luck!**
