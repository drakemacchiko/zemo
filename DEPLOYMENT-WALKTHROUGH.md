# 🚀 ZEMO Deployment Guide - Step by Step

**Let's deploy ZEMO to production!**

Follow these steps carefully to deploy your platform to Vercel with full CI/CD automation.

---

## 📋 Prerequisites Checklist

Before we begin, ensure you have:
- ✅ GitHub account (you have this)
- ✅ Vercel account (you have this)
- ✅ Git installed locally
- ✅ Vercel CLI installed (we'll do this first)

---

## Step 1: Install Vercel CLI

Open your PowerShell terminal and run:

```powershell
npm install -g vercel

# Verify installation
vercel --version
```

---

## Step 2: Link Your Project to Vercel

```powershell
# Navigate to your project (you're already there)
cd F:\zemo

# Login to Vercel
vercel login

# This will open your browser - select your Vercel account
# Follow the prompts to authenticate
```

---

## Step 3: Link the Project

```powershell
# Link project to Vercel
vercel link

# Answer the prompts:
# ? Set up and deploy "F:\zemo"? [Y/n] Y
# ? Which scope do you want to deploy to? [Select your account]
# ? Link to existing project? [N] (press N for new project)
# ? What's your project's name? zemo
# ? In which directory is your code located? ./ (press Enter)

# This creates a .vercel folder with project configuration
```

---

## Step 4: Get Vercel Project IDs

```powershell
# Display your Vercel configuration
Get-Content .vercel/project.json | ConvertFrom-Json | Format-List

# You should see:
# - orgId: team_xxxxx or user_xxxxx
# - projectId: prj_xxxxx

# IMPORTANT: Copy these values - you'll need them for GitHub secrets
```

---

## Step 5: Generate Vercel Token

1. Go to: https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name: `ZEMO GitHub Actions`
4. Scope: **Full Account**
5. Expiration: **No Expiration** (or 1 year)
6. Click **"Create"**
7. **COPY THE TOKEN** - you won't see it again!

---

## Step 6: Set Up PostgreSQL Database

You have two options:

### Option A: Vercel Postgres (Recommended - Easy)

```powershell
# In your Vercel dashboard:
# 1. Go to https://vercel.com/dashboard
# 2. Select your "zemo" project
# 3. Go to "Storage" tab
# 4. Click "Create Database"
# 5. Select "Postgres"
# 6. Choose region (closest to your users - Africa/Europe)
# 7. Click "Create"

# Vercel will automatically add DATABASE_URL to your environment variables
```

### Option B: External PostgreSQL (Supabase/Neon/Railway)

If you prefer external hosting:
- **Supabase**: https://supabase.com (Free tier available)
- **Neon**: https://neon.tech (Generous free tier)
- **Railway**: https://railway.app (Free tier)

---

## Step 7: Configure Vercel Environment Variables

Go to: https://vercel.com/[your-account]/zemo/settings/environment-variables

Add these variables for **Production** environment:

### Critical Variables (Required):

```bash
# Database (auto-added if using Vercel Postgres)
DATABASE_URL=postgresql://user:pass@host:5432/zemo?sslmode=require

# Authentication (generate these)
JWT_SECRET=[run in terminal: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_REFRESH_SECRET=[run again for different value]

# App Configuration
NEXT_PUBLIC_APP_NAME=ZEMO
NEXT_PUBLIC_APP_URL=https://zemo.vercel.app
```

### Generate JWT Secrets:

```powershell
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output

# Generate JWT_REFRESH_SECRET (different value)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output
```

### Optional (For Full Functionality):

```bash
# Payment Providers (use sandbox for testing)
STRIPE_SECRET_KEY=sk_test_... (get from https://dashboard.stripe.com)
STRIPE_PUBLISHABLE_KEY=pk_test_...

# SMS Provider (for OTP)
AFRICASTALKING_API_KEY=your_api_key
AFRICASTALKING_USERNAME=sandbox

# Email Provider
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@zemo.vercel.app

# Monitoring
SENTRY_DSN=https://...@sentry.io/... (create free account at sentry.io)
```

---

## Step 8: Push to GitHub

```powershell
# Initialize git repository (if not already done)
git init

# Check current status
git status

# Add all files
git add .

# Commit
git commit -m "feat: phase 12 complete - production ready deployment"

# Create GitHub repository:
# 1. Go to https://github.com/new
# 2. Repository name: zemo
# 3. Description: "Car Rental Marketplace PWA for Zambia"
# 4. Private/Public: Your choice
# 5. Do NOT initialize with README (we have one)
# 6. Click "Create repository"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/zemo.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 9: Configure GitHub Secrets

Go to: https://github.com/YOUR_USERNAME/zemo/settings/secrets/actions

Click **"New repository secret"** and add:

### Required Secrets:

1. **VERCEL_TOKEN**
   - Value: The token you created in Step 5

2. **VERCEL_ORG_ID**
   - Value: The `orgId` from `.vercel/project.json` (Step 4)

3. **VERCEL_PROJECT_ID**
   - Value: The `projectId` from `.vercel/project.json` (Step 4)

### Optional Secrets (for enhanced features):

4. **SNYK_TOKEN** (security scanning)
   - Sign up at https://snyk.io
   - Get token from: https://app.snyk.io/account

5. **CODECOV_TOKEN** (code coverage)
   - Sign up at https://codecov.io
   - Add your repository and get token

---

## Step 10: Run Database Migrations

```powershell
# First, deploy to Vercel to get the database URL
vercel --prod

# Wait for deployment to complete...
# Vercel will output: https://zemo-xxxxx.vercel.app

# Now run migrations on production database
# Set the production DATABASE_URL temporarily
$env:DATABASE_URL = "your-production-database-url-from-vercel"

# Generate Prisma client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

# Verify
npx prisma db pull
```

---

## Step 11: Create Admin User

```powershell
# Create your first admin user
node scripts/create-admin-user.js

# Follow the prompts or edit the script to set your email
# Default: drakemacchiko@gmail.com
```

---

## Step 12: Verify Deployment

1. **Check Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - You should see your "zemo" project
   - Status should be "Ready"

2. **Visit Your Site**
   ```
   https://zemo.vercel.app (or your custom domain)
   ```

3. **Test Critical Flows**
   - ✅ Homepage loads
   - ✅ User registration works
   - ✅ Login works
   - ✅ Search vehicles
   - ✅ Admin dashboard (login with your admin account)

4. **Check Health Endpoint**
   ```
   https://zemo.vercel.app/api/health
   ```
   Should return: `{"status":"healthy",...}`

---

## Step 13: Set Up Custom Domain (Optional)

If you have a custom domain:

1. Go to: https://vercel.com/YOUR_USERNAME/zemo/settings/domains
2. Click **"Add Domain"**
3. Enter your domain: `zemo.zm` or `www.zemo.com`
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-30 minutes)

---

## Step 14: Monitor First Deployment

### Check GitHub Actions:
- Go to: https://github.com/YOUR_USERNAME/zemo/actions
- You should see the CI/CD pipeline running
- All checks should pass ✅

### Check Vercel Logs:
```powershell
# Stream production logs
vercel logs --prod --follow
```

### Check Sentry (if configured):
- Go to https://sentry.io
- Monitor for any errors

---

## 🎉 You're Live!

Congratulations! ZEMO is now deployed to production!

### What Just Happened:

✅ Code pushed to GitHub  
✅ GitHub Actions ran CI/CD pipeline  
✅ Tests passed  
✅ Security scans completed  
✅ Automatically deployed to Vercel  
✅ Database migrations applied  
✅ Admin user created  
✅ Site is live!  

---

## 🔄 Future Deployments

From now on, deploying is automatic:

```powershell
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# That's it! GitHub Actions will:
# 1. Run tests
# 2. Run security scans
# 3. Build the app
# 4. Deploy to Vercel
# 5. Notify you of success/failure
```

---

## 🐛 Troubleshooting

### Issue: Database connection fails

```powershell
# Check DATABASE_URL is set in Vercel
vercel env ls

# Test connection locally
$env:DATABASE_URL = "your-production-url"
npx prisma db pull
```

### Issue: Build fails on Vercel

Check build logs:
```powershell
vercel logs --prod
```

Common fixes:
- Ensure all environment variables are set
- Check DATABASE_URL format includes `?sslmode=require`
- Verify Node.js version (should be 18.x)

### Issue: GitHub Actions fails

- Check GitHub Secrets are set correctly
- Verify VERCEL_TOKEN is valid
- Check workflow logs at: https://github.com/YOUR_USERNAME/zemo/actions

---

## 📞 Next Steps

1. **Test the platform thoroughly**
   - Create test accounts
   - List a test vehicle
   - Make a test booking
   - Test payment flow (use sandbox/test mode)

2. **Set up monitoring**
   - Configure Sentry alerts
   - Set up Uptime Robot: https://uptimerobot.com
   - Monitor Vercel Analytics

3. **Configure payment providers**
   - Get production API keys from payment providers
   - Test in sandbox mode first
   - Switch to production when ready

4. **Invite beta testers**
   - Start with friends/family
   - Gather feedback
   - Fix issues before public launch

---

## 🚀 Ready for Production?

Follow the **Production Launch Checklist**: `docs/PRODUCTION-LAUNCH-CHECKLIST.md`

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- GitHub Actions: https://docs.github.com/en/actions
- ZEMO Docs: Check `/docs` folder

**Happy Deploying! 🎉**
