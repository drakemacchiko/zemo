# ZEMO Production Setup Guide

## ✅ Deployment Status: LIVE

Your ZEMO platform is successfully deployed to Vercel!

Build completed: November 13, 2025 at 15:07 UTC

---

## 🚀 Post-Deployment Setup

### Step 1: Get Your Production URL

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your "zemo" project
3. Find the "Domains" section - your URL will be something like:
   ```
   https://zemo-xyz123.vercel.app
   ```
4. **Copy this URL** - you'll need it for the next steps

### Step 2: Test Database Connection

Visit your health check endpoint to verify the database is accessible:

```
https://YOUR-URL.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-13T15:07:00.000Z",
  "responseTime": 120
}
```

**If you get "unhealthy" or database errors:**

The Supabase database connection might still have issues. Check:

1. **Verify Supabase Database is Running**
   - Go to https://supabase.com/dashboard
   - Navigate to your "zemo production" project
   - Check Project Settings → Database
   - Ensure the database status is "Active"

2. **Verify Connection String in Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Check DATABASE_URL is set to:
     ```
     postgresql://postgres:%40421ForLife%40@db.mydudeietjwoubzmmngz.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
     ```
   - If you need to update it, redeploy after changing

### Step 3: Run Database Migrations

Your database is empty - you need to create the tables!

**Option A: Using Local Machine with Production Database**

1. Open PowerShell in your project folder (`F:\zemo`)

2. Pull production environment variables:
   ```powershell
   npx vercel env pull .env.production
   ```

3. Run migrations against production database:
   ```powershell
   npx dotenv -e .env.production -- npx prisma migrate deploy
   ```

4. Verify tables were created:
   ```powershell
   npx dotenv -e .env.production -- npx prisma studio
   ```

**Option B: Using Vercel CLI (Recommended for Security)**

1. Install Vercel CLI globally:
   ```powershell
   npm install -g vercel
   ```

2. Login to Vercel:
   ```powershell
   vercel login
   ```

3. Link your local project:
   ```powershell
   vercel link
   ```

4. Run migration via Vercel function:
   ```powershell
   vercel env pull
   npx prisma migrate deploy
   ```

### Step 4: Seed Initial Data

After migrations succeed, seed insurance provider data:

```powershell
# Using production environment
npx dotenv -e .env.production -- node scripts/seed-insurance-data.js
```

**Expected Output:**
```
✓ Successfully seeded 3 insurance providers
✓ Successfully seeded 9 insurance options
✓ Seed completed successfully!
```

### Step 5: Create Admin User

Create your first admin account to access the admin dashboard:

```powershell
# Using production environment
npx dotenv -e .env.production -- node scripts/create-admin-user.js
```

**Follow the prompts:**
- Email: your-email@example.com
- Password: [create a strong password]
- Full Name: Your Name
- Phone: +260XXXXXXXXX

**Expected Output:**
```
✓ Admin user created successfully!
  ID: clxxxxxxxxxxxxxx
  Email: your-email@example.com
  Role: ADMIN
```

### Step 6: Test Your Production Platform

#### 6.1 Homepage
Visit: `https://YOUR-URL.vercel.app`

**Expected:** ZEMO landing page with hero section and vehicle search

#### 6.2 User Registration
Visit: `https://YOUR-URL.vercel.app/register`

**Test:**
1. Create a new user account
2. Verify you receive success message
3. Check you can log in at `/login`

#### 6.3 Admin Dashboard
Visit: `https://YOUR-URL.vercel.app/admin`

**Test:**
1. Log in with your admin credentials
2. Verify dashboard shows analytics cards
3. Check all admin tabs work:
   - Bookings
   - Vehicles
   - Users
   - Payments
   - Claims

#### 6.4 Vehicle Search
Visit: `https://YOUR-URL.vercel.app/search`

**Test:**
1. Search form loads correctly
2. Try searching (will return empty results until vehicles are added)

#### 6.5 Health Check
Visit: `https://YOUR-URL.vercel.app/api/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-11-13T...",
  "uptime": 123.45,
  "responseTime": 85,
  "environment": "production"
}
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Database Connection Timeout

**Symptoms:** Health check returns `"database": "disconnected"` or timeout errors

**Solutions:**

1. **Check Supabase Database Status**
   - Login to Supabase Dashboard
   - Verify project is "Active" (not paused)
   - Free tier databases pause after 7 days of inactivity

2. **Verify Connection Pooler Port**
   - Ensure DATABASE_URL uses port `6543` (Session Pooler)
   - NOT port `5432` (Direct connection)

3. **Test Connection Locally**
   ```powershell
   # Test if you can connect from your machine
   npx dotenv -e .env.production -- npx prisma db push --preview-feature
   ```

4. **Check Supabase Network Settings**
   - Go to Supabase → Project Settings → Database
   - Under "Connection Pooling", ensure Session Pooler is enabled
   - Verify "IPv4 Add-on" if on IPv4 network (may require upgrade from free tier)

### Issue 2: Prisma Migration Fails

**Symptoms:** `Error: P1001: Can't reach database server`

**Solutions:**

1. **Verify DATABASE_URL is correct**
   ```powershell
   # Check the environment variable
   vercel env ls
   ```

2. **Re-run migration with verbose output**
   ```powershell
   npx dotenv -e .env.production -- npx prisma migrate deploy --schema=./prisma/schema.prisma
   ```

3. **Check Prisma schema provider**
   - Open `prisma/schema.prisma`
   - Ensure line 9 shows: `provider = "postgresql"`

### Issue 3: Admin User Creation Fails

**Symptoms:** Error creating admin user

**Solutions:**

1. **Ensure migrations ran successfully first**
   ```powershell
   npx dotenv -e .env.production -- npx prisma migrate status
   ```

2. **Check User table exists**
   ```powershell
   npx dotenv -e .env.production -- npx prisma studio
   ```
   - Navigate to "User" table
   - Should see table structure even if empty

3. **Verify script is using production DB**
   - Check `scripts/create-admin-user.js` imports from `@/lib/db`
   - Ensure `.env.production` is loaded

### Issue 4: Pages Show 500 Errors

**Symptoms:** White screen or "Internal Server Error"

**Solutions:**

1. **Check Vercel Function Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on failing route to see error logs

2. **Common causes:**
   - Missing environment variables → Add to Vercel settings
   - Database not initialized → Run migrations
   - JWT secrets not set → Check JWT_SECRET and JWT_REFRESH_SECRET

3. **Verify all environment variables are set:**
   ```
   Required Variables in Vercel:
   ✓ DATABASE_URL
   ✓ JWT_SECRET
   ✓ JWT_REFRESH_SECRET
   ✓ NEXT_PUBLIC_APP_NAME
   ✓ NEXT_PUBLIC_APP_URL
   ```

### Issue 5: Login/Register Not Working

**Symptoms:** Can't create accounts or log in

**Solutions:**

1. **Check API routes are deployed**
   - Visit: `https://YOUR-URL.vercel.app/api/auth/register`
   - Should return 405 Method Not Allowed (means route exists)

2. **Verify JWT secrets are set in Vercel**
   - Dashboard → Settings → Environment Variables
   - Both JWT_SECRET and JWT_REFRESH_SECRET must exist

3. **Check browser console for errors**
   - Open DevTools (F12)
   - Look for API request failures
   - Check Network tab for 401/403/500 errors

---

## 📊 Monitoring Your Production App

### Health Monitoring

Set up uptime monitoring with free services:

1. **UptimeRobot** (https://uptimerobot.com)
   - Monitor: `https://YOUR-URL.vercel.app/api/health`
   - Check interval: 5 minutes
   - Alert via: Email or SMS

2. **Pingdom** (https://pingdom.com)
   - Free tier: 1 check
   - Monitor same health endpoint

### Vercel Analytics

Enable free analytics in Vercel dashboard:
1. Go to your project
2. Click "Analytics" tab
3. Enable Web Analytics
4. View real-time traffic and performance

### Database Monitoring

Check Supabase Dashboard:
1. Navigate to "Database" → "Roles"
2. View connection statistics
3. Monitor query performance
4. Check disk usage (free tier: 500MB)

---

## 🎯 Post-Launch Checklist

- [ ] Health check returns "healthy"
- [ ] Database migrations completed
- [ ] Insurance data seeded
- [ ] Admin user created and can log in
- [ ] Test user registration works
- [ ] Test user login works
- [ ] Admin dashboard accessible
- [ ] Vehicle search page loads
- [ ] All environment variables set in Vercel
- [ ] Uptime monitoring configured
- [ ] Custom domain configured (optional)

---

## 🌐 Optional: Add Custom Domain

Want to use your own domain instead of `vercel.app`?

1. **Buy a domain** (Namecheap, GoDaddy, etc.)

2. **Add to Vercel:**
   - Dashboard → Your Project → Settings → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `zemo.com`)
   - Follow DNS configuration instructions

3. **Update environment variables:**
   - Change `NEXT_PUBLIC_APP_URL` to your custom domain
   - Redeploy for changes to take effect

---

## 🔐 Security Reminders

### Production Environment Variables

**Never commit these to Git:**
- `.env.production`
- `.env.local`
- Any file containing DATABASE_URL or JWT secrets

### Rotate Secrets Periodically

Every 90 days:
1. Generate new JWT secrets
2. Update in Vercel environment variables
3. Redeploy application

### Monitor for Suspicious Activity

Check Vercel logs regularly for:
- Unusual API request patterns
- Failed authentication attempts
- Database query errors

---

## 📞 Need Help?

If you encounter issues:

1. **Check Vercel Function Logs:**
   - Dashboard → Functions → Select failing route

2. **Check Supabase Logs:**
   - Supabase Dashboard → Logs → Database logs

3. **Review Build Logs:**
   - Vercel Dashboard → Deployments → Click deployment → View logs

4. **Test Locally with Production DB:**
   ```powershell
   # Pull production env
   vercel env pull .env.production
   
   # Run dev server with production DB
   npx dotenv -e .env.production -- npm run dev
   ```

---

## 🎉 Congratulations!

Your ZEMO platform is now live in production! Users can:
- Register accounts
- Search for vehicles
- Make bookings
- Process payments
- File insurance claims
- Manage their rentals

**Your deployment URL:** https://[YOUR-PROJECT].vercel.app

**Admin access:** https://[YOUR-PROJECT].vercel.app/admin

---

*Generated: November 13, 2025*
*Build: db683cc*
*Deployment: Vercel (Washington D.C. - iad1)*
