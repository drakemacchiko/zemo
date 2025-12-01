# External Services Required for ZEMO Platform

Complete setup guide for all third-party services needed to run the ZEMO car rental platform.

---

## 1. Supabase (Database & Storage)

**Purpose**: PostgreSQL database, file storage, authentication support

### Setup Steps

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get credentials from Project Settings > API:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
4. Create storage buckets:
   - `vehicle-images` (public)
   - `profile-images` (public)
   - `documents` (private)
5. Configure CORS for image uploads
6. Set up RLS policies for security

### Environment Variables

```env
DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
SUPABASE_URL="https://[PROJECT_ID].supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_KEY="eyJ..."
```

### Monthly Cost
- **Free tier**: 500MB storage, 2GB bandwidth
- **Paid**: Starts at $25/month (8GB database, 100GB bandwidth)

---

## 2. SendGrid (Email Delivery)

**Purpose**: Transactional emails, notifications, booking confirmations

### Setup Steps

1. Create account at [sendgrid.com](https://sendgrid.com)
2. Complete sender authentication (verify domain)
3. Create API key with full access
4. Create email templates:
   - Welcome email
   - Booking confirmation
   - Payment receipt
   - Trip reminder
   - Review request
5. Configure webhooks for bounce/spam tracking

### Environment Variables

```env
SENDGRID_API_KEY="SG.xxx"
SENDGRID_FROM_EMAIL="noreply@zemo.zm"
SENDGRID_FROM_NAME="ZEMO"
```

### Monthly Cost
- **Free tier**: 100 emails/day
- **Paid**: $19.95/month (50K emails)

---

## 3. Flutterwave (Payment Processing - Zambia)

**Purpose**: Mobile money (MTN, Airtel, Zamtel), card payments

### Setup Steps

1. Create account at [flutterwave.com/zm](https://flutterwave.com/zm)
2. Complete business verification
3. Get API credentials from Settings > API
4. Configure webhook URL for payment callbacks
5. Test with test cards in sandbox
6. Request production access

### Environment Variables

```env
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_TEST-xxx"
FLUTTERWAVE_SECRET_KEY="FLWSECK_TEST-xxx"
FLUTTERWAVE_ENCRYPTION_KEY="FLWSECK_TESTxxx"
FLUTTERWAVE_WEBHOOK_SECRET="xxx"
FLUTTERWAVE_ENVIRONMENT="test" # or "production"
```

### Transaction Fees
- Local cards: 1.4%
- International cards: 3.8%
- Mobile money: 1.4%

---

## 4. Google Maps Platform (Maps & Geolocation)

**Purpose**: Address autocomplete, maps display, distance calculation

### Setup Steps

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Distance Matrix API
3. Create API key
4. Restrict API key to your domain
5. Enable billing (required even for free tier)

### Environment Variables

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyxxx"
```

### Monthly Cost
- $200 free credit per month
- Maps: $7 per 1000 loads
- Places autocomplete: $2.83 per 1000 requests

---

## 5. Cloudinary (Optional - Image Storage & Optimization)

**Purpose**: Advanced image optimization, transformations, CDN

### Setup Steps

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get cloud name and API credentials
3. Configure upload presets
4. Set up automatic image optimization

### Environment Variables

```env
CLOUDINARY_CLOUD_NAME="xxx"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"
CLOUDINARY_UPLOAD_PRESET="zemo-vehicles"
```

### Monthly Cost
- **Free tier**: 25GB storage, 25GB bandwidth
- **Paid**: $99/month (100GB)

**Note**: Can use Supabase Storage instead to save costs.

---

## 6. Vercel (Hosting & Deployment)

**Purpose**: Platform hosting, serverless functions, CDN

### Setup Steps

1. Connect GitHub repository
2. Configure environment variables in dashboard
3. Set up custom domain
4. Configure deployment settings
5. Enable automatic deployments

### Environment Variables
All above environment variables plus:

```env
JWT_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="another-secret-key"
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://zemo.zm"
```

### Monthly Cost
- **Free tier**: Hobby projects
- **Pro**: $20/month (better analytics, team features)

---

## 7. Sentry (Optional - Error Tracking)

**Purpose**: Application monitoring, error tracking

### Setup Steps

1. Create account at [sentry.io](https://sentry.io)
2. Create new project (Next.js)
3. Install Sentry SDK
4. Configure source maps upload

### Environment Variables

```env
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_AUTH_TOKEN="xxx"
```

### Monthly Cost
- **Free tier**: 5K errors/month

---

## 8. Twilio (Optional - SMS Notifications)

**Purpose**: SMS notifications for Zambia (if email not enough)

### Setup Steps

1. Create account at [twilio.com](https://twilio.com)
2. Get phone number with SMS capabilities
3. Configure messaging service
4. Set up webhook for delivery status

### Environment Variables

```env
TWILIO_ACCOUNT_SID="ACxxx"
TWILIO_AUTH_TOKEN="xxx"
TWILIO_PHONE_NUMBER="+260..."
```

### Monthly Cost
- $15/month phone rental
- $0.075 per SMS to Zambia

---

## Total Estimated Monthly Costs

### Minimum (Free Tiers)
- All services: **$0/month**
- Good for testing and low traffic

### Recommended (Production)
- Supabase Pro: $25
- SendGrid Essentials: $19.95
- Vercel Pro: $20
- Google Maps: ~$50 (estimate)
- **Total: ~$115/month**

**Note**: Payment processing fees are per-transaction, not monthly.

---

## Setup Priority Order

1. **Database First**: Supabase (needed for everything)
2. **Authentication**: Complete JWT setup
3. **Storage**: Supabase buckets for images
4. **Email**: SendGrid for transactional emails
5. **Payments**: Flutterwave for Zambian payments
6. **Maps**: Google Maps for location features
7. **Optional**: Cloudinary, Sentry, Twilio (as needed)

---

## Environment Variables Template

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase
SUPABASE_URL="https://[PROJECT_ID].supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_KEY="eyJ..."

# Email
SENDGRID_API_KEY="SG.xxx"
SENDGRID_FROM_EMAIL="noreply@zemo.zm"
SENDGRID_FROM_NAME="ZEMO"

# Payments
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_TEST-xxx"
FLUTTERWAVE_SECRET_KEY="FLWSECK_TEST-xxx"
FLUTTERWAVE_ENCRYPTION_KEY="xxx"
FLUTTERWAVE_WEBHOOK_SECRET="xxx"
FLUTTERWAVE_ENVIRONMENT="test" # or "production"

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyxxx"

# Security
JWT_SECRET="your-super-secret-key-minimum-32-characters"
JWT_REFRESH_SECRET="another-secret-key-for-refresh-tokens"

# Environment
NODE_ENV="development" # or "production"
NEXT_PUBLIC_APP_URL="http://localhost:3000" # or your production URL
```

---

## Verification Checklist

Before going to production, verify:

- [ ] Database connection working
- [ ] File uploads to Supabase Storage successful
- [ ] SendGrid sending emails correctly
- [ ] Flutterwave test payments working
- [ ] Google Maps API loading on pages
- [ ] All environment variables set in Vercel
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Error tracking configured (Sentry)
- [ ] Backup strategy in place

---

## Support & Documentation Links

- **Supabase**: [docs.supabase.com](https://docs.supabase.com)
- **SendGrid**: [docs.sendgrid.com](https://docs.sendgrid.com)
- **Flutterwave**: [developer.flutterwave.com](https://developer.flutterwave.com)
- **Google Maps**: [developers.google.com/maps](https://developers.google.com/maps)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

---

*Last updated: November 2025*
