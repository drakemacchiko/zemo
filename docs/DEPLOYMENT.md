# ZEMO - Vercel Deployment Guide

## Quick Deploy (5 minutes)

### Step 1: Import Project to Vercel

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Find `drakemacchiko/zemo` in your GitHub repos
5. Click **"Import"**

### Step 2: Configure Environment Variables

Before deploying, click **"Environment Variables"** and add these:

#### Required Variables:
```
DATABASE_URL=your-postgresql-connection-string
JWT_SECRET=your-jwt-secret-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

#### Optional (Payment Providers):
```
STRIPE_SECRET_KEY=sk_test_...
MTN_MOMO_API_KEY=...
AIRTEL_MONEY_API_KEY=...
ZAMTEL_KWACHA_API_KEY=...
DPO_API_KEY=...
```

### Step 3: Generate Required Keys

#### JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### VAPID Keys:
```bash
node scripts/generate-vapid-keys.js
```

### Step 4: Setup PostgreSQL Database

**Option A: Vercel Postgres (Easiest)**
1. In your Vercel project dashboard
2. Go to **Storage** tab
3. Click **"Create Database"** → **"Postgres"**
4. Click **"Connect"** → Copy the `DATABASE_URL`
5. Add to Environment Variables

**Option B: External Provider**
- **Neon** (https://neon.tech) - Free tier available
- **Supabase** (https://supabase.com) - Free tier available
- **Railway** (https://railway.app) - Free tier available

### Step 5: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Vercel will show your live URL!

### Step 6: Run Database Migrations

After first deployment, you need to setup the database:

1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Click the **three dots** next to `DATABASE_URL` → **Copy Value**
3. On your local machine:

```bash
# Set DATABASE_URL temporarily
$env:DATABASE_URL="paste-your-vercel-database-url-here"

# Run migrations
npx prisma migrate deploy

# Seed data (optional)
npx prisma db seed

# Create admin user
node scripts/create-admin-user.js
```

### Step 7: Update App URL

1. Copy your Vercel deployment URL (e.g., `https://zemo-xyz.vercel.app`)
2. In Vercel dashboard → **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL

## Automatic Deployments

Every time you push to `main` branch on GitHub, Vercel will automatically:
- Build your app
- Run tests
- Deploy to production

No manual deployment needed! 🎉

## Custom Domain (Optional)

### Add Your Own Domain:
1. In Vercel project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `zemo.zm`)
4. Follow DNS configuration instructions

### Update Domain Configuration:
After adding custom domain, update these env vars:
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Environment Variables Checklist

### Production Environment Variables:
```bash
# === REQUIRED ===
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your-production-jwt-secret"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# === OPTIONAL (Payment Providers) ===
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
MTN_MOMO_API_KEY="your-key"
AIRTEL_MONEY_API_KEY="your-key"
ZAMTEL_KWACHA_API_KEY="your-key"
DPO_API_KEY="your-key"
```

## Troubleshooting

### Build Fails
- Check **Build Logs** in Vercel dashboard
- Ensure all required env variables are set
- Verify DATABASE_URL is correct

### Database Connection Issues
- Make sure DATABASE_URL is in **Production** environment
- Check database is publicly accessible (most providers require allowlisting Vercel IPs)
- For Vercel Postgres, connection is automatic

### Service Worker Not Working
- Service workers only work on HTTPS (Vercel provides this automatically)
- Clear browser cache
- Check **Application** tab in DevTools

### Payment Providers Not Working
- Add production API keys (not test keys)
- Verify each provider allows your Vercel domain
- Check webhook URLs are configured

## Post-Deployment Checklist

- [ ] Visit your deployed URL
- [ ] Register a test account
- [ ] Create admin user via migrations
- [ ] Test login redirects (admin → /admin, user → /profile)
- [ ] Test vehicle search
- [ ] Test booking flow
- [ ] Configure payment providers (if ready)
- [ ] Test PWA install on mobile
- [ ] Check Lighthouse scores (should be 90+)

## Monitoring & Analytics

### Vercel Analytics (Built-in):
1. Go to **Analytics** tab in Vercel dashboard
2. View page views, performance metrics
3. Free for personal projects!

### Error Tracking:
Vercel automatically captures:
- Build errors
- Runtime errors
- API errors

Check **Logs** tab for real-time monitoring.

## Scaling

Your app is production-ready and will automatically scale:
- **Serverless Functions**: Auto-scale with traffic
- **Edge Network**: Content served globally via CDN
- **Database**: Scale your PostgreSQL as needed

## Cost Estimate

**Free Tier** (Vercel Hobby):
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Great for demos/testing

**Pro Tier** ($20/month):
- Everything in Free
- Custom domains
- Team collaboration
- Advanced analytics
- Priority support

## Next Steps

1. **Deploy** → Follow steps above
2. **Test** → Verify all features work in production
3. **Configure Payments** → Add real API keys when ready
4. **Add Domain** → Use custom domain for branding
5. **Launch** → Share with users! 🚀

---

**Need help?** 
- Vercel Docs: https://vercel.com/docs
- ZEMO Setup: See `SETUP.md` in repo
- GitHub Repo: https://github.com/drakemacchiko/zemo
