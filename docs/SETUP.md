# ZEMO Platform - Environment Setup Guide

## Quick Setup (5 minutes)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd zemo
npm install
```

### 2. Configure Environment
Create `.env.local` in the root directory:

```env
# Database (PostgreSQL required)
DATABASE_URL="postgresql://user:password@localhost:5432/zemo"

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET="your-secret-key-here"

# VAPID Keys for Push Notifications (generate with script below)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"
VAPID_PRIVATE_KEY="your-private-key"

# Payment Providers (optional - get from provider dashboards)
STRIPE_SECRET_KEY="sk_test_..."
MTN_MOMO_API_KEY="..."
AIRTEL_MONEY_API_KEY="..."
ZAMTEL_KWACHA_API_KEY="..."
DPO_API_KEY="..."
```

### 3. Generate VAPID Keys
```bash
node scripts/generate-vapid-keys.js
```

### 4. Setup Database
```bash
npx prisma migrate deploy
npx prisma db seed
```

### 5. Create Admin User
```bash
node scripts/create-admin-user.js
```

### 6. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Payment Provider Setup

### Stripe
1. Create account at https://stripe.com
2. Get API keys from Dashboard > Developers > API Keys
3. Add to `.env.local`

### MTN Mobile Money
1. Register at https://momodeveloper.mtn.com
2. Subscribe to Collections API
3. Get API key and user ID
4. Add to `.env.local`

### Airtel Money
1. Contact Airtel Business: https://airtel.africa/business
2. Request API access
3. Add credentials to `.env.local`

### Zamtel Kwacha
1. Contact Zamtel: https://zamtel.zm
2. Request merchant account
3. Add credentials to `.env.local`

## Testing Without Payment Providers

The platform works fully without payment provider API keys! Payment pages will display, but actual processing will fail gracefully. Perfect for development and demo purposes.

## Production Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Manual Deployment
1. Build: `npm run build`
2. Start: `npm start`
3. Set environment variables on your hosting platform
4. Ensure PostgreSQL database is accessible

## Troubleshooting

### Build Errors
- Dynamic route warnings are expected (API routes)
- Build succeeds despite warnings
- Run: `npm run build` to verify

### Database Connection
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Run: `npx prisma studio` to verify connection

### Service Worker Issues
- Clear browser cache
- Unregister old service workers in DevTools
- Reload page

## Feature Checklist

✅ User registration/login  
✅ Vehicle search and filtering  
✅ Booking creation and management  
✅ Payment processing (5 providers)  
✅ Pickup/return inspections  
✅ Messaging between users  
✅ Push notifications  
✅ Insurance claims  
✅ Admin dashboard  
✅ PWA with offline support  
✅ WCAG 2.1 AA accessibility  

## Next Steps

1. Configure payment providers for your target market
2. Customize branding in `tailwind.config.js`
3. Add real vehicle data via admin dashboard
4. Test complete booking flow
5. Deploy to production

## Support

For issues or questions, check:
- `docs/ZEMO-Comprehensive-Project-Documentation.md` - Full technical docs
- `docs/AUDIT-FINDINGS.md` - Known issues and status
- `docs/PHASE-11.5-PLAN.md` - Development roadmap
