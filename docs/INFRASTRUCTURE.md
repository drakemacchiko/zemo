# ZEMO Platform - Infrastructure & Deployment Guide
**Phase 12: Production Hardening & Launch**

---

## 📋 Table of Contents

1. [Infrastructure Overview](#infrastructure-overview)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Architecture](#deployment-architecture)
4. [Monitoring & Observability](#monitoring--observability)
5. [Security Configuration](#security-configuration)
6. [Backup & Disaster Recovery](#backup--disaster-recovery)
7. [Scaling Strategy](#scaling-strategy)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Infrastructure Overview

### Technology Stack

**Frontend & API:**
- **Framework**: Next.js 14 (App Router)
- **Hosting**: Vercel (Edge Network)
- **CDN**: Vercel Edge Network + Cloudflare (optional)
- **SSL/TLS**: Automatic via Vercel

**Database:**
- **Primary**: PostgreSQL 15+ (Vercel Postgres or Supabase)
- **Connection Pooling**: PgBouncer (built-in with Vercel Postgres)
- **Replication**: Multi-region read replicas (production)

**File Storage:**
- **Service**: Vercel Blob Storage or AWS S3
- **CDN**: CloudFront (if using S3)
- **Purpose**: Vehicle photos, documents, insurance claims

**External Services:**
- **Payments**: Stripe, MTN MoMo, Airtel Money, Zamtel Kwacha, DPO
- **SMS**: Africa's Talking / Twilio
- **Email**: SendGrid / AWS SES
- **Monitoring**: Sentry, Vercel Analytics
- **Uptime**: Uptime Robot / Pingdom

---

## 🌍 Environment Configuration

### Environment Matrix

| Environment | Branch    | URL                          | Purpose                    |
|-------------|-----------|------------------------------|----------------------------|
| Development | `develop` | `localhost:3000`             | Local development          |
| Staging     | `staging` | `zemo-staging.vercel.app`    | Pre-production testing     |
| Production  | `main`    | `zemo.zm`                    | Live production system     |

### Required Environment Variables

#### Core Configuration
```bash
# App Identity
NEXT_PUBLIC_APP_NAME=ZEMO
NEXT_PUBLIC_APP_URL=https://zemo.zm

# Database (PostgreSQL required for production)
DATABASE_URL=postgresql://user:password@host:5432/zemo?sslmode=require&connection_limit=20&pool_timeout=20

# Authentication
JWT_SECRET=<generate-with-openssl-rand-hex-64>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-hex-64>

# File Storage
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
# OR for S3:
AWS_S3_BUCKET=zemo-uploads
AWS_S3_REGION=af-south-1
AWS_ACCESS_KEY_ID=<aws-key>
AWS_SECRET_ACCESS_KEY=<aws-secret>
```

#### Payment Providers
```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# MTN MoMo (Zambia)
MTN_MOMO_SUBSCRIPTION_KEY=<mtn-subscription-key>
MTN_MOMO_API_USER=<mtn-api-user>
MTN_MOMO_API_KEY=<mtn-api-key>
MTN_MOMO_ENVIRONMENT=production # or 'sandbox'

# Airtel Money (Zambia)
AIRTEL_MONEY_CLIENT_ID=<airtel-client-id>
AIRTEL_MONEY_CLIENT_SECRET=<airtel-client-secret>
AIRTEL_MONEY_ENVIRONMENT=production

# Zamtel Kwacha
ZAMTEL_KWACHA_API_KEY=<zamtel-api-key>
ZAMTEL_KWACHA_MERCHANT_ID=<merchant-id>

# DPO Payment Gateway
DPO_COMPANY_TOKEN=<dpo-company-token>
DPO_SERVICE_TYPE=<service-type>
```

#### Communication Services
```bash
# SMS Provider (Africa's Talking)
AFRICASTALKING_API_KEY=<api-key>
AFRICASTALKING_USERNAME=<username>

# Email Provider (SendGrid)
SENDGRID_API_KEY=<sendgrid-key>
SENDGRID_FROM_EMAIL=noreply@zemo.zm
SENDGRID_FROM_NAME=ZEMO
```

#### Monitoring & Error Tracking
```bash
# Sentry
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=<sentry-auth-token>
SENTRY_ORG=zemo
SENTRY_PROJECT=zemo-pwa

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=<analytics-id>
```

#### PWA & Notifications
```bash
# Web Push Notifications (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<vapid-public-key>
VAPID_PRIVATE_KEY=<vapid-private-key>
VAPID_SUBJECT=mailto:admin@zemo.zm
```

---

## 🚀 Deployment Architecture

### Vercel Deployment Strategy

#### 1. Development Environment
```bash
# Local development
npm run dev
# Accessible at http://localhost:3000
```

#### 2. Staging Deployment (Auto-deploy on `staging` branch)
```bash
# Push to staging branch
git checkout staging
git merge develop
git push origin staging

# Vercel automatically deploys to: https://zemo-staging.vercel.app
```

#### 3. Production Deployment (Auto-deploy on `main` branch)
```bash
# After staging testing passes
git checkout main
git merge staging
git push origin main

# Vercel automatically deploys to: https://zemo.zm
```

### Database Migration Strategy

#### Production Migration Process
```bash
# 1. Create migration locally
npx prisma migrate dev --name migration_name

# 2. Test migration on staging database
DATABASE_URL=<staging-db-url> npx prisma migrate deploy

# 3. Verify staging application works
# Run smoke tests and manual QA

# 4. Deploy to production (during low-traffic window)
DATABASE_URL=<production-db-url> npx prisma migrate deploy

# 5. Verify production application
# Monitor error logs and performance metrics
```

#### Rollback Procedure
```bash
# If migration fails, rollback steps:

# 1. Revert application deployment
vercel rollback

# 2. Restore database from backup (see Backup section)
pg_restore -d zemo_production -Fc latest_backup.dump

# 3. Notify users of temporary downtime via status page
```

---

## 📊 Monitoring & Observability

### Sentry Configuration

#### Setup
```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Configure Sentry for Next.js
npm install --save @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard@latest -i nextjs
```

#### `sentry.client.config.ts`
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Performance Monitoring
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'zemo.zm'],
    }),
  ],

  // Filter sensitive data
  beforeSend(event) {
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  },
});
```

#### `sentry.server.config.ts`
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  
  integrations: [
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],
});
```

### Performance Monitoring Metrics

**Critical Metrics to Monitor:**

| Metric                    | Target       | Alert Threshold |
|---------------------------|--------------|-----------------|
| API Response Time (p95)   | < 200ms      | > 500ms         |
| API Response Time (p99)   | < 500ms      | > 1000ms        |
| Error Rate                | < 0.1%       | > 1%            |
| Database Connection Pool  | < 80% used   | > 90% used      |
| Memory Usage              | < 512MB      | > 800MB         |
| CPU Usage                 | < 50%        | > 80%           |

### Uptime Monitoring

**Setup Uptime Robot:**

1. Create account at https://uptimerobot.com
2. Add HTTP(S) monitors for:
   - Homepage: `https://zemo.zm`
   - API Health: `https://zemo.zm/api/health`
   - Search Endpoint: `https://zemo.zm/api/vehicles/search`
3. Configure alerts via:
   - Email: admin@zemo.zm
   - SMS: +260 XXX XXX XXX
   - Slack webhook (optional)

### Custom Health Check Endpoint

**Create `/api/health/route.ts`:**
```typescript
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    database: 'unknown',
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';
    
    return NextResponse.json({ status: 'healthy', checks }, { status: 200 });
  } catch (error) {
    checks.database = 'disconnected';
    return NextResponse.json({ status: 'unhealthy', checks }, { status: 503 });
  }
}
```

---

## 🔒 Security Configuration

### Security Headers (Vercel Configuration)

**`vercel.json` Headers:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-DNS-Prefetch-Control",
          "value": "on"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(self)"
        }
      ]
    }
  ]
}
```

### Content Security Policy (CSP)

**Add to `next.config.js`:**
```javascript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.stripe.com https://sentry.io;
  frame-src 'self' https://js.stripe.com;
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};
```

### Rate Limiting

**API Route Protection:**
```typescript
// src/lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject() : resolve();
      }),
  };
}

// Usage in API routes
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  
  try {
    await limiter.check(10, ip); // 10 requests per minute per IP
  } catch {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // Handle request...
}
```

---

## 💾 Backup & Disaster Recovery

### Database Backup Strategy

#### Automated Daily Backups
```bash
#!/bin/bash
# scripts/backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
DB_NAME="zemo_production"

# Create backup
pg_dump -Fc -d $DATABASE_URL > $BACKUP_DIR/zemo_backup_$DATE.dump

# Upload to S3
aws s3 cp $BACKUP_DIR/zemo_backup_$DATE.dump s3://zemo-backups/daily/

# Retain last 30 days locally
find $BACKUP_DIR -name "*.dump" -mtime +30 -delete

# Verify backup integrity
pg_restore --list $BACKUP_DIR/zemo_backup_$DATE.dump > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Backup successful: zemo_backup_$DATE.dump"
else
  echo "❌ Backup verification failed!"
  exit 1
fi
```

#### Backup Schedule
- **Daily**: Full database backup at 2:00 AM UTC
- **Weekly**: Full backup with 90-day retention
- **Monthly**: Full backup with 1-year retention
- **Pre-deployment**: Manual backup before major releases

#### Restore Procedure
```bash
# 1. Stop application (prevent writes)
vercel env rm DATABASE_URL production

# 2. Restore database
pg_restore -d zemo_production -Fc -c backups/zemo_backup_YYYYMMDD.dump

# 3. Verify data integrity
psql -d zemo_production -c "SELECT COUNT(*) FROM \"User\";"
psql -d zemo_production -c "SELECT COUNT(*) FROM \"Vehicle\";"

# 4. Restart application
vercel env add DATABASE_URL production
vercel --prod
```

### Disaster Recovery Runbook

**Scenario 1: Complete Database Loss**

1. **Immediate Actions** (RTO: 30 minutes)
   ```bash
   # Activate maintenance mode
   echo "We're performing emergency maintenance. Back online shortly." > public/maintenance.html
   vercel --prod
   
   # Provision new database
   # Restore from latest backup (see above)
   
   # Update connection string
   vercel env add DATABASE_URL <new-db-url> production
   
   # Deploy application
   vercel --prod
   ```

2. **Verify Recovery**
   - Login as test user
   - Create test booking
   - Process test payment
   - Check admin dashboard

**Scenario 2: Application Deployment Failure**

1. **Rollback to Previous Version**
   ```bash
   # List recent deployments
   vercel ls zemo --prod
   
   # Rollback to specific deployment
   vercel rollback <deployment-url> --prod
   ```

2. **Investigate Root Cause**
   - Check Sentry for errors
   - Review deployment logs
   - Test locally with production data snapshot

**Scenario 3: Payment Provider Outage**

1. **Failover to Alternative Provider**
   ```typescript
   // Update payment processing logic to skip failed provider
   const availableProviders = ['STRIPE', 'MTN_MOMO', 'AIRTEL_MONEY'];
   const failedProviders = ['STRIPE']; // Example: Stripe is down
   
   const activeProviders = availableProviders.filter(
     p => !failedProviders.includes(p)
   );
   ```

2. **User Communication**
   - Display banner: "Stripe payments temporarily unavailable. Use MTN MoMo or Airtel Money."
   - Send email to users with pending payments

---

## 📈 Scaling Strategy

### Horizontal Scaling (Vercel Automatic)

Vercel automatically scales based on traffic:
- **Edge Functions**: Unlimited concurrent executions
- **Serverless Functions**: Auto-scales to handle traffic spikes
- **CDN**: Global edge network for static assets

### Database Scaling

**Current Capacity** (Starting Configuration):
- 1 vCPU, 2GB RAM
- 20 GB storage
- 100 concurrent connections

**Scaling Triggers:**
| Metric                 | Action                              |
|------------------------|-------------------------------------|
| CPU > 70% for 10 min   | Upgrade to next tier                |
| Storage > 80%          | Increase storage                    |
| Connections > 80%      | Add read replicas                   |
| Query latency > 200ms  | Add caching layer (Redis)           |

### Caching Strategy

**Implement Redis for:**
- Session storage
- Frequently accessed data (vehicle listings)
- Search result caching
- Rate limiting counters

---

## 🔧 Troubleshooting

### Common Issues

**Issue: Database connection timeout**
```bash
# Check connection pool
psql -d $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Increase pool size
DATABASE_URL="postgresql://...?connection_limit=50"
```

**Issue: High memory usage**
```bash
# Check Vercel function logs
vercel logs --prod

# Optimize Prisma queries
# Add pagination to large result sets
```

**Issue: Slow API responses**
```bash
# Enable query logging
DATABASE_URL="postgresql://...?log_queries=true"

# Analyze slow queries
npx prisma studio
```

---

## 📞 Support Contacts

**Emergency Contacts:**
- Technical Lead: technical@zemo.zm
- DevOps: devops@zemo.zm
- On-Call: +260 XXX XXX XXX

**Service Providers:**
- Vercel Support: https://vercel.com/support
- Database Provider: [Contact based on chosen provider]
- Sentry: support@sentry.io

---

**Last Updated**: November 12, 2025  
**Version**: 1.0.0  
**Maintained By**: ZEMO DevOps Team
