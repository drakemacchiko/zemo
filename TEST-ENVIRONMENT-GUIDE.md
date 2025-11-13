# ZEMO Test Environment Guide

## ✅ Setup Complete

Your ZEMO platform is now fully set up with a complete test environment including multiple user roles, sample vehicles, and insurance products.

## 🌐 Production URL

**https://zemo-bannyh0ir-zed-designs-dev-team.vercel.app**

---

## 👥 Test Accounts

All test accounts use the password: **Test@123**

| Role | Email | Description |
|------|-------|-------------|
| **USER** | john.renter@test.com | Regular customer - books vehicles |
| **HOST** | sarah.host@test.com | Vehicle owner - 2 vehicles listed |
| **ADMIN** | mike.admin@test.com | Platform admin with management permissions |
| **USER** | lisa.premium@test.com | Premium customer - frequent renter |
| **HOST** | david.host@test.com | Fleet owner - 2 vehicles listed |

### Admin Accounts

| Email | Password | Role |
|-------|----------|------|
| drakemacchiko@gmail.com | password123 | SUPER_ADMIN (main) |
| mike.admin@test.com | Test@123 | ADMIN (test) |

---

## 🚗 Sample Vehicles

**Sarah's Vehicles** (sarah.host@test.com):
1. **2022 Toyota Corolla** (BAZ 2022) - ZMW 350/day - SEDAN
   - Features: Air Conditioning, Power Windows, Bluetooth, USB Charging, Central Locking
   
2. **2023 Honda CR-V** (BAZ 3023) - ZMW 550/day - SUV
   - Features: AWD, Leather Seats, Sunroof, Reverse Camera, Cruise Control, Apple CarPlay

**David's Vehicles** (david.host@test.com):
3. **2021 Nissan Patrol** (BAZ 1021) - ZMW 750/day - SUV
   - Features: 4WD, Leather Interior, Parking Sensors, Hill Assist, Climate Control
   
4. **2020 Mazda Demio** (BAZ 5020) - ZMW 250/day - HATCHBACK
   - Features: Air Conditioning, Power Steering, Radio/CD, Central Locking

---

## 🏥 Insurance Products

Three insurance coverage options are available for all bookings:

| Coverage | Provider | Daily Rate | Max Coverage | Features |
|----------|----------|------------|--------------|----------|
| **Basic** | Madison Insurance | ZMW 15,000 | ZMW 500,000 | Third-party coverage, accident protection |
| **Comprehensive** | Professional Insurance | ZMW 25,000 | ZMW 1,000,000 | Theft, vandalism, accidents, third-party |
| **Premium** | ZSIC Insurance | ZMW 45,000 | ZMW 2,000,000 | Full coverage + natural disasters + roadside assistance |

---

## 🧪 Complete Testing Workflow

### 1. 🔐 Test User Booking Flow

**Login as:** john.renter@test.com (Test@123)

**Steps:**
1. Navigate to `/search` page
2. Search for available vehicles
3. Select a vehicle (e.g., Toyota Corolla)
4. Fill in booking details:
   - Pick-up date & time
   - Return date & time
   - Select insurance option
5. Review pricing (vehicle rate + insurance)
6. Proceed to payment
7. Complete booking
8. View booking in `/bookings` page

**Expected Results:**
- Vehicle search displays 4 available vehicles
- Booking form calculates total correctly
- Payment processes successfully
- Booking appears in user's bookings list
- Admin dashboard shows booking in stats

---

### 2. 🚗 Test Host Management

**Login as:** sarah.host@test.com (Test@123)

**Steps:**
1. Navigate to `/host` dashboard
2. View your listed vehicles (2 vehicles)
3. Add a new vehicle:
   - Fill in vehicle details
   - Upload photos
   - Set pricing
   - Submit for verification
4. Manage incoming bookings
5. Process handover inspection:
   - Document vehicle condition
   - Upload photos
   - Record mileage
   - Confirm pickup

**Expected Results:**
- Host sees 2 existing vehicles
- Can add new vehicles (pending verification)
- Receives booking notifications
- Can conduct pickup/return inspections

---

### 3. 🛡️ Test Insurance Claims Workflow

**Steps:**
1. **Create booking with insurance** (as john.renter@test.com)
   - Book vehicle with COMPREHENSIVE or PREMIUM insurance
   - Complete payment

2. **File insurance claim** (during active rental)
   - Navigate to booking details
   - Click "File Claim"
   - Describe incident
   - Upload damage photos/documents
   - Submit claim

3. **Review claim** (as admin - mike.admin@test.com)
   - Navigate to `/admin/claims`
   - View claim details
   - Review uploaded documents
   - Approve/reject claim
   - Process settlement if approved

**Expected Results:**
- Claim appears in `/admin/claims`
- Documents are viewable
- Claim status updates correctly
- Payout calculated based on coverage

---

### 4. 👑 Test Admin Dashboard

**Login as:** mike.admin@test.com (Test@123) or drakemacchiko@gmail.com (password123)

**Admin Panel Sections:**

#### **Dashboard** (`/admin`)
- View key metrics:
  - Total Users: 6 (1 super admin + 5 test users)
  - Total Vehicles: 4
  - Active Bookings
  - Claims count
  - Total Revenue
- Charts showing booking trends
- Recent activity feed

#### **Vehicles** (`/admin/vehicles`)
- View all 4 vehicles
- Filter by status (AVAILABLE, BOOKED, etc.)
- Approve/reject new vehicle listings
- Update verification status
- View vehicle details & photos

#### **Bookings** (`/admin/bookings`)
- View all bookings
- Filter by status (PENDING, CONFIRMED, ACTIVE, COMPLETED)
- View booking details
- Manage booking lifecycle

#### **Claims** (`/admin/claims`)
- View all insurance claims
- Review claim documents
- Approve/reject claims
- Process payouts
- Track claim status

#### **Payments** (`/admin/payments`)
- View all transactions
- Track payment status
- Process refunds
- Manage host payouts

#### **Users** (`/admin/users`)
- View all 6 users
- Filter by role (USER, HOST, ADMIN)
- View user profiles
- Manage KYC status
- Activate/deactivate accounts

**Expected Results:**
- All sections display data correctly
- Filters work properly
- Charts render with actual data
- Admin actions (approve/reject) function
- Stats reflect real-time data

---

### 5. 🎫 End-to-End Rental Flow

**Complete journey from search to review:**

1. **Search** (as john.renter@test.com)
   - Browse available vehicles
   - Filter by type, price, location

2. **Book**
   - Select Honda CR-V
   - Choose dates (e.g., 3-day rental)
   - Add PREMIUM insurance
   - Proceed to checkout

3. **Pay**
   - Review total: (ZMW 550 × 3 days) + (ZMW 45,000 × 3 days) + security deposit
   - Complete payment
   - Receive booking confirmation

4. **Pickup Inspection** (as sarah.host@test.com)
   - View booking in host dashboard
   - Conduct handover inspection
   - Document condition with photos
   - Record starting mileage
   - Confirm pickup

5. **During Rental** (as john.renter@test.com)
   - View active booking
   - Contact host via messaging
   - File claim if incident occurs

6. **Return Inspection** (as sarah.host@test.com)
   - Conduct return inspection
   - Compare condition to pickup
   - Record ending mileage
   - Check for damage
   - Process security deposit return

7. **Review** (as john.renter@test.com)
   - Rate the vehicle
   - Leave written review
   - Rate the host

**Expected Results:**
- Seamless flow through all stages
- Notifications at each step
- Inspections documented properly
- Payments processed correctly
- Reviews visible on vehicle listing

---

## 🔍 Verification Checklist

### Admin Dashboard Features
- [ ] Dashboard loads with correct stats
- [ ] All 6 navigation links work (Dashboard, Vehicles, Bookings, Claims, Payments, Users)
- [ ] Charts display real data
- [ ] Recent activity shows updates
- [ ] All 4 vehicles appear in Vehicles section
- [ ] User management displays 6 accounts
- [ ] Filters work on each section

### Booking Workflow
- [ ] Search displays 4 vehicles
- [ ] Vehicle details page shows correct info
- [ ] Booking form calculates totals correctly
- [ ] Insurance options appear (3 options)
- [ ] Payment processes successfully
- [ ] Booking confirmation email sent
- [ ] Booking appears in user's bookings
- [ ] Admin sees booking in dashboard

### Host Management
- [ ] Host sees only their vehicles
- [ ] Can add new vehicle
- [ ] Receives booking notifications
- [ ] Can conduct inspections
- [ ] Upload photos for inspections
- [ ] Manage booking requests

### Insurance Claims
- [ ] Can file claim on insured booking
- [ ] Upload documents to claim
- [ ] Admin can view all claims
- [ ] Claim status updates
- [ ] Settlement processes correctly

### Messaging & Notifications
- [ ] Users can message hosts
- [ ] Hosts can message renters
- [ ] Notifications appear for bookings
- [ ] Notifications for claims
- [ ] Notifications for payments

---

## 🚨 Known Limitations

1. **Payment Integration**: Currently using test payment flow - no real payment processor connected
2. **Email Notifications**: Email service needs SMTP configuration for production
3. **Vehicle Photos**: No photos uploaded yet - hosts need to add photos to vehicles
4. **Document Uploads**: Document storage configured but needs testing

---

## 📝 Next Steps

### Immediate Testing
1. **Login to admin dashboard** and verify all 4 vehicles appear
2. **Test search functionality** - ensure vehicles display correctly
3. **Create a booking** as john.renter@test.com
4. **Verify booking appears** in admin dashboard stats

### Feature Testing
1. **Test messaging** between users and hosts
2. **Test notifications** for booking events
3. **Upload vehicle photos** as hosts
4. **Complete full rental cycle** with inspections
5. **File and process a claim** end-to-end

### Production Readiness
1. **Configure payment gateway** (Airtel Money, MTN, etc.)
2. **Set up email service** (SendGrid, AWS SES, etc.)
3. **Add vehicle photos** for all 4 vehicles
4. **Test mobile responsiveness**
5. **Performance testing** with load testing tool
6. **Security audit** of authentication flows

---

## 🆘 Troubleshooting

### Issue: Vehicles not appearing in search
**Solution:** 
- Check vehicle `availabilityStatus` is "AVAILABLE"
- Verify `isActive` is true
- Check `verificationStatus` is "APPROVED" (may need admin approval)

### Issue: Cannot create booking
**Solution:**
- Verify user is logged in
- Check vehicle is available for selected dates
- Ensure insurance product exists in database

### Issue: Admin dashboard shows 0 vehicles
**Solution:**
- Run script again: `node scripts/setup-test-environment.js`
- Check database connection
- Verify vehicles were created (check terminal output)

### Issue: Login not working
**Solution:**
- Verify email is correct (case-sensitive)
- Check password is exactly "Test@123" (case-sensitive)
- Clear browser cache and cookies
- Try different browser

---

## 📞 Support

For issues or questions:
- Check the console for errors (F12 in browser)
- Review API responses in Network tab
- Check database logs in Supabase dashboard
- Review Vercel deployment logs

---

**Last Updated:** December 2024  
**Environment:** Production (Vercel + Supabase PostgreSQL)  
**Database:** PostgreSQL with Session Pooler connection
