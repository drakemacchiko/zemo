# ZEMO Complete Booking Flow - User Guide

## 🎯 How to Complete a Full Booking (End-to-End)

### Prerequisites
- Deployment URL: `https://zemo-bannyh0ir-zed-designs-dev-team.vercel.app`
- Test User Credentials:
  - Email: `testuser1@example.com` - `testuser5@example.com`
  - Password: `Test123!@#`

---

## Step 1: Create an Account or Login

### New Users (Registration)
1. Go to `https://zemo-bannyh0ir-zed-designs-dev-team.vercel.app/register`
2. Fill in the registration form:
   - First Name
   - Last Name
   - Email (must be valid)
   - Phone Number (Zambian format: +260... or 0...)
   - Password (min 8 characters)
   - Confirm Password
3. Click **"Create Account"**
4. Enter OTP code sent to your email
5. You'll be redirected to your profile

### Existing Users (Login)
1. Go to `https://zemo-bannyh0ir-zed-designs-dev-team.vercel.app/login`
2. Enter email and password
3. Click **"Sign In"**
4. You'll be redirected based on your role:
   - Admin → `/admin`
   - Host → `/host`
   - User → `/profile`

---

## Step 2: Search for Vehicles

1. Click **"Browse Cars"** on homepage OR go to `/search`
2. Enter search criteria:
   - **Location**: e.g., "Lusaka"
   - **Pickup Date**: Select future date
   - **Return Date**: Select date after pickup
3. (Optional) Click **"Advanced Filters"** to add:
   - Vehicle Type (SEDAN, SUV, TRUCK, etc.)
   - Transmission (AUTOMATIC, MANUAL)
   - Fuel Type (PETROL, DIESEL, ELECTRIC, HYBRID)
   - Price Range (min/max)
   - Seating Capacity
4. Click **"Search"**

### Expected Results
You should see **4 test vehicles**:
- ✅ Toyota Corolla 2020 (ZMW 400/day)
- ✅ Honda CR-V 2021 (ZMW 550/day)
- ✅ Nissan Patrol 2019 (ZMW 800/day)
- ✅ Mazda Demio 2018 (ZMW 300/day)

> ⚠️ **KNOWN ISSUE**: If you see "Failed to search vehicles" error, the search API has a 500 error. Check Vercel deployment logs.

---

## Step 3: View Vehicle Details

1. Click **"View Details"** on any vehicle card
2. You'll see:
   - ✅ Vehicle photos (carousel)
   - ✅ Complete specifications (make, model, year, type, transmission, fuel, seats)
   - ✅ Features list
   - ✅ Daily rate and security deposit
   - ✅ Host information
   - ✅ Location
   - ✅ Availability calendar

---

## Step 4: Select Dates & Book

1. On vehicle details page, scroll to **"Book This Vehicle"** section
2. Select:
   - **Pickup Date** (future date)
   - **Return Date** (after pickup)
3. Review the pricing calculation showing:
   - Number of days
   - Daily rate
   - Subtotal
   - Service fee
   - Tax
   - **Total Amount**
4. Click **"Book Now"**

> 📍 If not logged in, you'll be redirected to login page first

---

## Step 5: Review Booking & Select Insurance

You'll be on `/bookings/new?vehicleId=...&start=...&end=...`

### Review Vehicle Summary
- ✅ Vehicle photo and details
- ✅ Rental dates confirmation
- ✅ Duration (number of days)

### Select Insurance (Optional)
Choose from **3 insurance options**:

1. **No Insurance** (Free)
   - You're fully responsible for damages
   
2. **Basic Coverage** (ZMW 50)
   - Coverage: ZMW 50,000
   - Provider: Zambia State Insurance
   
3. **Standard Coverage** (ZMW 100)
   - Coverage: ZMW 100,000
   - Provider: ZSIC
   
4. **Premium Coverage** (ZMW 200)
   - Coverage: ZMW 200,000
   - Provider: Professional Insurance

### Add Special Requests (Optional)
- Enter any special requests or notes for the host

### Review Total Cost
The sidebar shows:
- ✅ Rental Cost: (days × daily rate)
- ✅ Insurance: (selected option premium)
- ✅ Security Deposit: (refundable)
- ✅ **Total Amount**

5. Click **"Proceed to Payment"**

---

## Step 6: Complete Payment

You'll be on `/payments/process?bookingId=...`

### Payment Information
- ✅ Total amount to pay
- ✅ Booking confirmation number

### Select Payment Method

Choose from **4 payment options**:

1. **Stripe**
   - International credit/debit cards
   - Visa, Mastercard, Amex
   
2. **MTN Mobile Money**
   - MTN MoMo wallet
   - Zambian mobile payments
   
3. **Airtel Money**
   - Airtel Money wallet
   - Mobile payments
   
4. **Zamtel Kwacha**
   - Zamtel mobile wallet
   - Mobile payments

> 💳 **NOTE**: Currently in TEST MODE - payments won't charge real money

3. Click **"Pay Now"**

### Payment Processing
- System creates payment record
- Processes with selected provider
- Updates booking status

---

## Step 7: Booking Confirmation

You'll be redirected to `/payments/success?bookingId=...`

### Confirmation Page Shows:
- ✅ Success message with green checkmark
- ✅ "Payment Successful!" heading
- ✅ "Your booking has been confirmed" message
- ✅ Two action buttons:
  - **"View Booking Details"** - Go to specific booking
  - **"View All Bookings"** - See all your bookings

---

## Step 8: Manage Your Booking

### View Booking Details
Click **"View Booking Details"** or go to `/bookings/[id]`

You'll see:
- ✅ Booking status (PENDING → CONFIRMED → ACTIVE → COMPLETED)
- ✅ Confirmation number
- ✅ Vehicle details
- ✅ Rental dates
- ✅ Total cost breakdown
- ✅ Insurance information
- ✅ Host contact info
- ✅ Pickup/dropoff location
- ✅ Special requests

### Available Actions
Depending on booking status:
- **Cancel Booking** (if PENDING)
- **Contact Host** (message system)
- **Start Rental** (on pickup date)
- **Report Issue** (during rental)
- **Complete Return** (on return date)
- **Submit Claim** (if damage occurred)

---

## 📱 Additional Features

### View All Bookings
Go to `/bookings` to see:
- ✅ All your bookings (past and upcoming)
- ✅ Filter by status
- ✅ Quick actions for each booking

### Messages
Go to `/messages` to:
- ✅ Chat with hosts
- ✅ Real-time messaging
- ✅ View conversation history

### Notifications
Go to `/notifications` to:
- ✅ See booking updates
- ✅ Payment confirmations
- ✅ Host messages
- ✅ System alerts

### Profile
Go to `/profile` to:
- ✅ Update personal information
- ✅ Change password
- ✅ Manage payment methods
- ✅ View booking history

---

## 🚗 Host Features (Become a Host)

### List Your Vehicle
1. Go to `/host`
2. Click **"Add Vehicle"**
3. Fill in vehicle details:
   - Make, model, year
   - Vehicle type
   - Photos (upload)
   - Daily rate
   - Location
   - Features
4. Submit for verification

### Manage Bookings
- ✅ Accept/reject booking requests
- ✅ Set calendar availability
- ✅ View earnings
- ✅ Chat with renters

---

## 🔧 Troubleshooting

### "Failed to search vehicles" Error
- **Cause**: Search API returning 500 error
- **Fix**: Check Vercel deployment logs
- **Workaround**: Use direct vehicle links if known

### "No vehicles found" Message
- **Cause 1**: Filters too restrictive
- **Cause 2**: No vehicles match search criteria
- **Fix**: Remove filters or try different location/dates

### Payment Fails
- **Cause**: Test mode limitations
- **Note**: In production, real payment processing will work
- **Current**: Creates booking but doesn't process actual payment

### Can't Login
- **Check**: Email and password are correct
- **Check**: Account is verified (OTP completed)
- **Reset**: Use "Forgot Password" if needed

### Not Receiving OTP
- **Check**: Email spam/junk folder
- **Note**: Currently using test email service
- **Production**: Will use proper SMTP/Twilio

---

## ✅ Complete Flow Checklist

Use this to verify everything works:

- [ ] Can register new account
- [ ] Receive and enter OTP
- [ ] Login successfully
- [ ] Search for vehicles with filters
- [ ] See 4 test vehicles in results
- [ ] View vehicle details
- [ ] Select rental dates
- [ ] Create booking
- [ ] See insurance options
- [ ] Proceed to payment
- [ ] Select payment method
- [ ] Complete payment
- [ ] See success confirmation
- [ ] View booking details
- [ ] See booking in "My Bookings"
- [ ] Send message to host
- [ ] Receive notifications
- [ ] Update profile

---

## 📊 Test Scenarios

### Scenario 1: Budget Rental
1. Search with price filter: ZMW 250-350
2. Should find: Mazda Demio (ZMW 300/day)
3. Book for 3 days
4. Choose no insurance
5. Total: ~ZMW 900 + deposit

### Scenario 2: Family SUV Rental
1. Search for SUV type
2. Should find: Honda CR-V, Nissan Patrol
3. Select Honda CR-V
4. Book for 1 week (7 days)
5. Choose Standard Insurance
6. Total: (7 × 550) + 100 + deposit = ~ZMW 3,950 + deposit

### Scenario 3: Quick Weekend Trip
1. Search with dates: This Friday - Sunday
2. Any sedan type
3. Select Toyota Corolla
4. Book for 2 days
5. Choose Basic Insurance
6. Total: (2 × 400) + 50 + deposit = ~ZMW 850 + deposit

---

## 🎯 Success Criteria

Your booking is successful when you see:
✅ Confirmation number generated
✅ Email confirmation sent (in production)
✅ Booking appears in "My Bookings"
✅ Status shows as "CONFIRMED"
✅ Payment record created
✅ Host receives notification

---

## 📞 Need Help?

- **Support Page**: `/support`
- **Contact**: `/contact`
- **Email**: support@zemo.zm
- **Phone**: +260 XXX XXXXXX

---

**Document Version**: 1.0
**Last Updated**: November 15, 2025
**Deployment**: Production (Vercel)
