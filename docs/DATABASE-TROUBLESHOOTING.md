# Database Connection Troubleshooting Guide

## ❌ Current Issue

All database connection attempts are failing:
```
Can't reach database server at db.mydudeietjwoubzmmngz.supabase.co
```

---

## 🔍 Step 1: Check Supabase Dashboard

### Visit Your Project Dashboard
```
https://supabase.com/dashboard/project/mydudeietjwoubzmmngz
```

### What to Check:

1. **Database Status** (Top of dashboard)
   - ✅ **Active/Healthy** - Database is running
   - ⏸️ **Paused** - Free tier database auto-pauses after inactivity
   - 🔄 **Provisioning** - Still setting up (wait 5-10 min)
   - ⚠️ **Unhealthy** - Database has issues

2. **Resume Database** (If Paused)
   - Click **"Resume Database"** or **"Restore"** button
   - Wait 30-60 seconds for database to wake up
   - Try connection test again

---

## 🔧 Step 2: Verify Environment Variables

Check your `.env.local` file has correct credentials:

```bash
# Open .env.local
notepad .env.local
```

### Required Variables:

```env
# Database URLs (from Supabase Dashboard → Settings → Database)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.mydudeietjwoubzmmngz.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.mydudeietjwoubzmmngz.supabase.co:5432/postgres"

# Supabase Keys (from Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL="https://mydudeietjwoubzmmngz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
```

### Get Credentials:

1. **Go to:** Settings → Database → Connection String
2. **Copy** the connection pooler URL (Port 6543)
3. **Copy** the direct connection URL (Port 5432)
4. **Important:** Replace `[YOUR-PASSWORD]` with your actual database password

---

## 🔑 Step 3: Reset Database Password (If Needed)

If you forgot your password:

1. Go to: **Settings → Database → Database Password**
2. Click **"Reset Database Password"**
3. Copy the new password
4. Update `.env.local` with new password
5. Restart dev server: `npm run dev`

---

## 🌐 Step 4: Test Network Connection

### Check if Supabase is reachable:

```powershell
# Test network connectivity
Test-NetConnection -ComputerName db.mydudeietjwoubzmmngz.supabase.co -Port 5432
```

**Expected Output:**
```
TcpTestSucceeded : True  ✅ Good - Can reach Supabase
TcpTestSucceeded : False ❌ Bad - Network/firewall blocking
```

### If Blocked:
- Check Windows Firewall
- Check antivirus software
- Try different network (mobile hotspot)
- Check corporate firewall/VPN

---

## 🔄 Step 5: Quick Fix - Resume & Test

### Option A: Via Dashboard (Recommended)

1. **Open:** https://supabase.com/dashboard/project/mydudeietjwoubzmmngz
2. **Look for:** "Your project is paused" banner
3. **Click:** "Resume database" or "Restore project"
4. **Wait:** 30-60 seconds
5. **Test:** Run `node scripts/test-db-connection.js` again

### Option B: Via Supabase CLI

```powershell
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref mydudeietjwoubzmmngz

# Check status
supabase db status
```

---

## ✅ Step 6: Verify Connection Success

After resuming database, test again:

```powershell
node scripts/test-db-connection.js
```

**Expected Success Output:**
```
✅ Session Pooler (Port 6543) with pgbouncer - SUCCESS
✅ Direct Connection (Port 5432) - SUCCESS
Total: 2/5 successful
```

---

## 🎯 Quick Checklist

- [ ] 1. Check Supabase dashboard - is database paused?
- [ ] 2. Resume database if paused
- [ ] 3. Wait 30-60 seconds for database to wake up
- [ ] 4. Verify `.env.local` has correct password
- [ ] 5. Test connection again: `node scripts/test-db-connection.js`
- [ ] 6. If still fails, check firewall/network
- [ ] 7. Consider upgrading from free tier if frequent pausing

---

## 💡 Common Issues & Solutions

### Issue 1: "Database Paused" (Most Common)
**Cause:** Free tier auto-pauses after 7 days inactivity  
**Solution:** Click "Resume" in dashboard, wait 60 seconds

### Issue 2: "Invalid Password"
**Cause:** Password changed or incorrect  
**Solution:** Reset password in dashboard, update `.env.local`

### Issue 3: "Connection Timeout"
**Cause:** Firewall/network blocking  
**Solution:** Check Windows Firewall, try different network

### Issue 4: "Too Many Connections"
**Cause:** Connection limit reached (rare on free tier)  
**Solution:** Close other database connections, use pooler

### Issue 5: "Database Provisioning"
**Cause:** New project still setting up  
**Solution:** Wait 5-10 minutes, refresh dashboard

---

## 🚀 After Connection Success

Once database connects successfully:

### 1. Run Migrations (If Needed)
```powershell
npx prisma db push
```

### 2. Generate Prisma Client
```powershell
npx prisma generate
```

### 3. Verify Schema
```powershell
npx prisma studio
```
Opens browser at `http://localhost:5555` to view database

### 4. Continue Testing
Return to `PHASE-2-TESTING-WALKTHROUGH.md` and continue from Step 3

---

## 📞 Still Having Issues?

### Check Supabase Status
Visit: https://status.supabase.com

### Supabase Support
- Documentation: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

### Alternative: Use Local PostgreSQL

If Supabase continues to fail, you can use local PostgreSQL:

```powershell
# Install PostgreSQL locally
# Download from: https://www.postgresql.org/download/windows/

# Update .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/zemo"
DIRECT_URL="postgresql://postgres:password@localhost:5432/zemo"

# Create database
psql -U postgres -c "CREATE DATABASE zemo;"

# Run migrations
npx prisma db push
```

---

## 📋 Next Steps

1. ✅ Fix database connection (follow steps above)
2. ✅ Test connection succeeds
3. ✅ Run migrations if needed
4. ✅ Continue with Phase 2 testing walkthrough
5. ✅ Start from Part 1: Host Dashboard

**File to return to:** `PHASE-2-TESTING-WALKTHROUGH.md`  
**Section:** Part 1, Test 1.1

---

**Last Updated:** November 28, 2025
