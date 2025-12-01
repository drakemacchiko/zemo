# ZEMO Test User Credentials

**Production URL:** https://zemo-lime.vercel.app

---

## 🔐 Test User Accounts

All test users have the same password: **`Test@123`**

### 1️⃣ Regular User (Renter)
- **Email:** `john.renter@test.com`
- **Password:** `Test@123`
- **Role:** USER
- **Name:** John Renter
- **Phone:** +260971111111
- **Use For:** 
  - Searching for vehicles
  - Making bookings
  - Viewing rental history
  - Messaging hosts

---

### 2️⃣ Premium User (Frequent Renter)
- **Email:** `lisa.premium@test.com`
- **Password:** `Test@123`
- **Role:** USER
- **Name:** Lisa Premium Customer
- **Phone:** +260974444444
- **Use For:**
  - Testing customer dashboard
  - Multiple bookings
  - Reviews and ratings

---

### 3️⃣ Vehicle Host (Single Vehicle)
- **Email:** `sarah.host@test.com`
- **Password:** `Test@123`
- **Role:** HOST
- **Name:** Sarah Vehicle Owner
- **Phone:** +260972222222
- **Use For:**
  - Listing vehicles
  - Managing bookings
  - Viewing earnings
  - Communicating with renters

---

### 4️⃣ Fleet Owner (Multiple Vehicles)
- **Email:** `david.host@test.com`
- **Password:** `Test@123`
- **Role:** HOST
- **Name:** David Fleet Owner
- **Phone:** +260975555555
- **Use For:**
  - Managing multiple vehicles
  - Fleet operations
  - Bulk availability management

---

### 5️⃣ Admin User
- **Email:** `mike.admin@test.com`
- **Password:** `Test@123`
- **Role:** ADMIN
- **Name:** Mike Support
- **Phone:** +260973333333
- **Use For:**
  - Platform management
  - User verification
  - Vehicle approval
  - Booking oversight
  - Claims management
  - Payment monitoring
  - Analytics access

---

## 🚗 Test Vehicles Available

### Toyota Corolla 2022
- **Type:** SEDAN
- **Plate:** BAZ 2022
- **Rate:** ZMW 350/day
- **Deposit:** ZMW 500
- **Location:** Lusaka CBD
- **Features:** AC, Power Windows, Bluetooth, USB, Central Lock
- **Status:** AVAILABLE

### Honda CR-V 2023
- **Type:** SUV
- **Rate:** ZMW 550/day (estimated from test data)
- **Location:** Lusaka
- **Status:** AVAILABLE

### Nissan Patrol 2019
- **Type:** SUV
- **Rate:** ZMW 800/day (estimated)
- **Location:** Lusaka
- **Status:** AVAILABLE

### Mazda Demio 2018
- **Type:** HATCHBACK
- **Rate:** ZMW 300/day (estimated)
- **Location:** Lusaka
- **Status:** AVAILABLE

---

## 🏥 Insurance Options

### Basic Coverage
- **Daily Rate:** ZMW 12/day
- **Weekly:** ZMW 75
- **Monthly:** ZMW 300
- **Max Coverage:** ZMW 25,000
- **Deductible:** ZMW 2,000
- **Includes:** Third-party liability, basic accident coverage
- **Provider:** Madison Insurance

### Comprehensive Coverage
- **Daily Rate:** ZMW 25/day
- **Weekly:** ZMW 160
- **Monthly:** ZMW 650
- **Max Coverage:** ZMW 75,000
- **Deductible:** ZMW 1,000
- **Includes:** Theft, vandalism, accidents, natural disasters, third-party
- **Provider:** Professional Insurance

### Premium Coverage
- **Daily Rate:** ZMW 45/day
- **Weekly:** ZMW 280
- **Monthly:** ZMW 1,100
- **Max Coverage:** ZMW 150,000
- **Deductible:** ZMW 0 (Zero!)
- **Includes:** Full coverage + roadside assistance
- **Provider:** ZEMO Premium Partners

---

## 🧪 Quick Test Scenarios

### Scenario 1: Basic Rental
1. Login as **john.renter@test.com**
2. Search for vehicles in Lusaka
3. Select Toyota Corolla
4. Choose dates (tomorrow to next week)
5. Skip insurance
6. Complete booking
7. Pay with test payment method

### Scenario 2: Premium Rental with Insurance
1. Login as **lisa.premium@test.com**
2. Search for SUVs
3. Select Honda CR-V
4. Choose dates (this weekend)
5. Select **Comprehensive Coverage**
6. Add special requests
7. Complete booking with payment

### Scenario 3: Host Management
1. Login as **sarah.host@test.com**
2. Go to Host Dashboard
3. View your vehicles
4. Check booking requests
5. Update vehicle availability
6. Respond to messages

### Scenario 4: Admin Operations
1. Login as **mike.admin@test.com**
2. Access Admin Dashboard
3. View pending vehicle verifications
4. Approve/reject vehicles
5. Monitor active bookings
6. Review payment transactions
7. Handle support claims

---

## 💳 Payment Testing

**Test Mode:** All payments are in test mode - no real charges

**Supported Methods:**
- Stripe (test cards)
- MTN Mobile Money (test numbers)
- Airtel Money (test)
- Zamtel Kwacha (test)

**Test Card (Stripe):**
- Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

---

## 📝 Important Notes

1. **All accounts are pre-verified** (KYC status: APPROVED)
2. **Vehicles are in PENDING status** but visible in search for testing
3. **Test data is shared** across all testers
4. **Passwords are simple** for testing only (would be stronger in production)
5. **Phone numbers** are Zambian format (+260...)

---

## 🔄 Reset Test Environment

If you need to reset all test data:

```bash
cd f:\zemo
node scripts/setup-test-environment.js
```

This will recreate:
- All 5 test users
- 4 sample vehicles
- 3 insurance products
- Sample bookings (if configured)

---

## 🚀 Login URL

**Direct Login:** https://zemo-lime.vercel.app/login

**Registration:** https://zemo-lime.vercel.app/register

---

## 🎯 Recommended Test Flow

1. **Start as Renter** (john.renter@test.com)
   - Browse vehicles
   - Complete a booking
   - Test messaging

2. **Switch to Host** (sarah.host@test.com)
   - View booking request
   - Accept/manage booking
   - Check earnings

3. **Check Admin** (mike.admin@test.com)
   - Monitor platform activity
   - Verify vehicles
   - Review transactions

---

**Need Help?**
- Support: support@zemo.zm
- Docs: See COMPLETE-BOOKING-GUIDE.md
- Verification: See FRONTEND-COMPLETE-VERIFICATION.md
