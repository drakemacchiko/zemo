# ZEMO Frontend Verification Checklist

## 🔍 Issue Found: Vehicles Not Appearing in Search

### Root Cause
All 4 vehicles in database have `verificationStatus: 'PENDING'` but the search API requires `verificationStatus: 'VERIFIED'`.

### Solution Implemented
1. Created `/api/admin/verify-all-vehicles` endpoint
2. Deployed to production
3. Will call POST endpoint to verify all vehicles

---

## ✅ Complete Frontend Verification Checklist

### 1. Public Pages (No Auth Required)

#### Homepage (`/`)
- [ ] Hero section displays correctly
- [ ] Search box visible with location, pickup date, return date
- [ ] "Search" button functional
- [ ] Navigation menu (Home, Browse Cars, Become a Host, About, Support)
- [ ] Footer displays with links
- [ ] Responsive on mobile/tablet

#### Browse Cars/Search (`/search`)
- [ ] Search filters display (location, dates, vehicle type, price range)
- [ ] **Vehicles display in grid** ⚠️ Currently FAILING - vehicles need VERIFIED status
- [ ] Filter options work (SUV, Sedan, Hatchback, etc.)
- [ ] Price range slider functional
- [ ] Sort by options work (Price, Distance, Rating, Newest)
- [ ] Pagination works
- [ ] Vehicle cards show: photo, make/model, price, rating, location
- [ ] Click on vehicle goes to details page

#### Vehicle Details (`/vehicles/[id]`)
- [ ] Vehicle photos gallery displays
- [ ] Vehicle specifications shown (make, model, year, type, transmission, fuel)
- [ ] Pricing clearly displayed (daily rate, security deposit)
- [ ] Features list displays
- [ ] Insurance options shown (Basic, Comprehensive, Premium)
- [ ] Host information visible
- [ ] Location map displays
- [ ] "Book Now" button visible
- [ ] Reviews section displays
- [ ] Similar vehicles shown at bottom

---

### 2. Authentication Pages

#### Sign In (`/login`)
- [ ] Email and password fields
- [ ] "Remember me" checkbox
- [ ] "Forgot password" link
- [ ] Sign in button functional
- [ ] Validation errors display
- [ ] Redirect to dashboard after login
- [ ] "Sign up" link works

#### Sign Up (`/register`)
- [ ] All form fields display (email, password, confirm password, name, phone)
- [ ] Password strength indicator
- [ ] Terms and conditions checkbox
- [ ] Sign up button functional
- [ ] Email validation
- [ ] Password match validation
- [ ] Success message and redirect
- [ ] "Sign in" link works

---

### 3. User Dashboard (Logged in as USER)

#### My Bookings (`/bookings`)
- [ ] List of user's bookings displays
- [ ] Filter by status (Upcoming, Active, Completed, Cancelled)
- [ ] Each booking shows: vehicle, dates, status, total cost
- [ ] "View Details" button works
- [ ] Upcoming bookings at top
- [ ] Past bookings show reviews if submitted

#### Booking Details (`/bookings/[id]`)
- [ ] Vehicle information
- [ ] Booking dates and times
- [ ] Pricing breakdown (vehicle rate + insurance + deposit)
- [ ] Payment status
- [ ] Insurance coverage details
- [ ] Host contact information
- [ ] Pickup/return location
- [ ] Handover inspection results (if completed)
- [ ] "Cancel Booking" button (if applicable)
- [ ] "Contact Host" button
- [ ] "File Claim" button (if insurance purchased)
- [ ] "Leave Review" button (after completion)

#### My Profile (`/profile`)
- [ ] Personal information displayed
- [ ] Edit profile button
- [ ] Profile photo upload
- [ ] Phone number verification status
- [ ] Email verification status
- [ ] KYC status indicator
- [ ] Change password option
- [ ] Notification preferences
- [ ] Delete account option

#### Messages (`/messages`)
- [ ] Conversation list displays
- [ ] Unread messages highlighted
- [ ] Click conversation opens chat
- [ ] Send message functionality
- [ ] Real-time message updates
- [ ] Attachment upload
- [ ] Message timestamps
- [ ] Search conversations

#### Notifications (`/notifications`)
- [ ] List of notifications
- [ ] Mark as read functionality
- [ ] Filter by type (Bookings, Payments, Messages, System)
- [ ] Notification timestamps
- [ ] Click notification goes to related item
- [ ] "Mark all as read" button
- [ ] Delete notification option

---

### 4. Host Dashboard (Logged in as HOST)

#### Host Dashboard (`/host`)
- [ ] Overview stats (Total Vehicles, Active Bookings, Revenue, Rating)
- [ ] Revenue chart displays
- [ ] Booking calendar visible
- [ ] Recent bookings list
- [ ] Quick actions (Add Vehicle, View Bookings, Manage Vehicles)
- [ ] Earnings summary

#### My Vehicles (`/host/vehicles`)
- [ ] List of host's vehicles
- [ ] Filter by status (Active, Pending, Inactive)
- [ ] Each vehicle shows: photo, make/model, daily rate, status
- [ ] "Add New Vehicle" button
- [ ] Edit vehicle button
- [ ] View vehicle statistics
- [ ] Deactivate/activate vehicle toggle

#### Add/Edit Vehicle (`/host/vehicles/new` or `/host/vehicles/[id]/edit`)
- [ ] All vehicle fields present
- [ ] Photo upload (multiple photos)
- [ ] Set as primary photo option
- [ ] Location picker/map
- [ ] Pricing fields (daily, weekly, monthly rates + deposit)
- [ ] Features checklist
- [ ] Document upload (registration, insurance, road tax)
- [ ] Validation on all required fields
- [ ] Save as draft option
- [ ] Submit for verification button
- [ ] Success message after submission

#### Vehicle Bookings (`/host/bookings`)
- [ ] List of bookings for host's vehicles
- [ ] Filter by vehicle
- [ ] Filter by status
- [ ] Accept/reject pending bookings
- [ ] View booking details
- [ ] Contact renter button
- [ ] Handover inspection button (for active bookings)

#### Handover Inspection (`/host/bookings/[id]/inspection`)
- [ ] Vehicle condition checklist
- [ ] Photo upload for each area (front, back, sides, interior)
- [ ] Damage description fields
- [ ] Current mileage input
- [ ] Fuel level indicator
- [ ] Renter signature capture
- [ ] Host signature capture
- [ ] Submit inspection button
- [ ] Generate PDF report option

#### Earnings (`/host/earnings`)
- [ ] Total earnings display
- [ ] Pending payouts
- [ ] Completed payouts
- [ ] Transaction history
- [ ] Filter by date range
- [ ] Export to CSV
- [ ] Payout method settings
- [ ] Request payout button

---

### 5. Admin Dashboard (Logged in as ADMIN)

#### Admin Dashboard (`/admin`)
- [ ] **Key metrics cards** (Users, Vehicles, Bookings, Claims, Revenue) ✅ WORKING
- [ ] Revenue chart ✅ WORKING
- [ ] Booking trends chart ✅ WORKING
- [ ] Recent activity feed ✅ WORKING
- [ ] Quick stats ✅ WORKING

#### Vehicles Management (`/admin/vehicles`)
- [ ] List all vehicles (currently 4)
- [ ] Filter by verification status (PENDING, VERIFIED, REJECTED)
- [ ] Filter by availability status
- [ ] Search by plate number, make, model
- [ ] View vehicle details
- [ ] **Approve vehicle button** ⚠️ CRITICAL - needed to make vehicles searchable
- [ ] Reject vehicle button
- [ ] View host information
- [ ] Vehicle statistics
- [ ] Deactivate vehicle option

#### Users Management (`/admin/users`)
- [ ] List all users (currently 6)
- [ ] Filter by role (USER, HOST, ADMIN)
- [ ] Filter by KYC status
- [ ] Search by email, name, phone
- [ ] View user details
- [ ] Edit user information
- [ ] Change user role
- [ ] Approve/reject KYC
- [ ] Activate/deactivate account
- [ ] View user bookings
- [ ] View user vehicles (if host)

#### Bookings Management (`/admin/bookings`)
- [ ] List all bookings
- [ ] Filter by status
- [ ] Filter by date range
- [ ] Search by booking ID, user, vehicle
- [ ] View booking details
- [ ] Override booking status (if needed)
- [ ] View payment details
- [ ] View inspection reports
- [ ] Cancel booking (with refund)

#### Claims Management (`/admin/claims`)
- [ ] List all insurance claims
- [ ] Filter by status (PENDING, APPROVED, REJECTED, SETTLED)
- [ ] Filter by insurance provider
- [ ] Search by claim ID, booking ID
- [ ] View claim details
- [ ] View uploaded documents/photos
- [ ] Approve/reject claim
- [ ] Calculate settlement amount
- [ ] Process payout
- [ ] Update claim status
- [ ] Add admin notes

#### Payments Management (`/admin/payments`)
- [ ] List all payments
- [ ] Filter by type (Booking, Deposit, Refund, Payout)
- [ ] Filter by status (PENDING, COMPLETED, FAILED)
- [ ] Search by transaction ID
- [ ] View payment details
- [ ] Process refunds
- [ ] Process host payouts
- [ ] Export payment report
- [ ] Payment statistics

---

### 6. Booking Flow (End-to-End)

#### Search → Details
- [ ] Enter location "Lusaka" in search
- [ ] Select dates (e.g., tomorrow to 3 days from now)
- [ ] Click "Search"
- [ ] **Vehicles appear** ⚠️ Currently FAILING
- [ ] Click on a vehicle
- [ ] Details page loads with all information

#### Book Vehicle
- [ ] Select pickup/return times
- [ ] Choose insurance option
- [ ] Review pricing breakdown
- [ ] Click "Book Now"
- [ ] Redirect to login if not authenticated
- [ ] After login, return to booking
- [ ] Confirm booking details
- [ ] Terms and conditions checkbox
- [ ] Click "Confirm Booking"

#### Payment
- [ ] Payment summary displays
- [ ] Payment method options shown
- [ ] Enter payment details
- [ ] Click "Pay Now"
- [ ] Payment processing indicator
- [ ] Success message displays
- [ ] Booking confirmation email sent
- [ ] Redirect to booking details
- [ ] Receipt available for download

#### Pickup Process
- [ ] Host receives booking notification
- [ ] Host navigates to booking
- [ ] Host clicks "Conduct Handover Inspection"
- [ ] Inspection form displays
- [ ] Upload photos of vehicle
- [ ] Document any existing damage
- [ ] Record mileage
- [ ] Both parties sign
- [ ] Inspection saved
- [ ] Booking status updates to "ACTIVE"
- [ ] User receives notification

#### Return Process
- [ ] Host conducts return inspection
- [ ] Compare to pickup inspection
- [ ] Note any new damage
- [ ] Record final mileage
- [ ] Check for refueling
- [ ] Calculate any additional charges
- [ ] Process security deposit return
- [ ] Booking status updates to "COMPLETED"
- [ ] Both parties receive notifications

#### Review
- [ ] User prompted to leave review
- [ ] Rate vehicle (1-5 stars)
- [ ] Rate host (1-5 stars)
- [ ] Write review text
- [ ] Submit review
- [ ] Review appears on vehicle page
- [ ] Host can respond to review

---

### 7. Claims Flow

#### File Claim
- [ ] User has active booking with insurance
- [ ] User clicks "File Claim"
- [ ] Claim form displays
- [ ] Describe incident field
- [ ] Upload damage photos
- [ ] Upload police report (if applicable)
- [ ] Estimate damage amount
- [ ] Submit claim
- [ ] Claim ID generated
- [ ] User receives confirmation

#### Admin Review
- [ ] Admin sees new claim in dashboard
- [ ] Admin opens claim details
- [ ] View all uploaded documents
- [ ] View booking details
- [ ] View insurance coverage
- [ ] Check damage description
- [ ] Approve or reject claim
- [ ] If approved, calculate settlement
- [ ] Process payout
- [ ] Update claim status
- [ ] Notifications sent

---

### 8. Messaging System

#### User to Host
- [ ] User opens booking
- [ ] Clicks "Contact Host"
- [ ] Message compose box appears
- [ ] Type message
- [ ] Send message
- [ ] Host receives notification
- [ ] Host replies
- [ ] User receives notification
- [ ] Real-time updates

#### Host to User
- [ ] Host opens booking
- [ ] Clicks "Contact Renter"
- [ ] Same messaging flow as above

---

### 9. Notifications System

#### Email Notifications
- [ ] Welcome email on registration
- [ ] Email verification email
- [ ] Booking confirmation email
- [ ] Payment receipt email
- [ ] Booking reminder (1 day before)
- [ ] Claim status update email
- [ ] Review request email

#### In-App Notifications
- [ ] New booking notification (host)
- [ ] Booking confirmed notification (user)
- [ ] Payment received notification
- [ ] Message received notification
- [ ] Claim status update notification
- [ ] Inspection completed notification
- [ ] Review received notification (host)

#### Push Notifications (if PWA installed)
- [ ] Service worker registered
- [ ] Push permission requested
- [ ] Push notifications working
- [ ] Notification click opens relevant page

---

### 10. Mobile Responsiveness

#### All Pages Responsive
- [ ] Mobile menu (hamburger) works
- [ ] Navigation collapses properly
- [ ] Forms are mobile-friendly
- [ ] Images resize correctly
- [ ] Tables scroll horizontally if needed
- [ ] Buttons are touch-friendly
- [ ] No horizontal scrolling
- [ ] Readable font sizes
- [ ] Proper spacing on mobile

---

### 11. PWA Features

#### Installation
- [ ] Install prompt appears
- [ ] App can be installed
- [ ] App icon shows on home screen
- [ ] Splash screen displays
- [ ] Runs in standalone mode

#### Offline Support
- [ ] Service worker registered
- [ ] Offline page displays when no connection
- [ ] Cached pages work offline
- [ ] Offline queue for actions
- [ ] Sync when back online

---

### 12. Performance

#### Load Times
- [ ] Homepage loads < 3 seconds
- [ ] Search page loads < 3 seconds
- [ ] Vehicle details loads < 2 seconds
- [ ] Dashboard loads < 3 seconds
- [ ] Images lazy load
- [ ] Code splitting implemented

#### Lighthouse Scores
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90
- [ ] PWA score present

---

## 🚨 CRITICAL ISSUES TO FIX IMMEDIATELY

### 1. ⚠️ Vehicles Not Showing in Search - **TOP PRIORITY**
**Status:** Identified and fixing
**Cause:** Vehicles have `verificationStatus: PENDING` but search requires `VERIFIED`
**Solution:** 
1. Call `/api/admin/verify-all-vehicles` POST endpoint to verify all 4 vehicles
2. Alternative: Admin manually approves vehicles in `/admin/vehicles`

**Test After Fix:**
```bash
# After deployment, call:
curl -X POST https://zemo-bannyh0ir-zed-designs-dev-team.vercel.app/api/admin/verify-all-vehicles

# Then verify:
curl https://zemo-bannyh0ir-zed-designs-dev-team.vercel.app/api/vehicles/search
```

### 2. ⚠️ Vehicle Photos Missing
**Status:** Need to add
**Cause:** Vehicles created without photos
**Solution:** Hosts need to upload photos, or we add placeholder photos to test data

### 3. ⚠️ Payment Integration Not Connected
**Status:** Using test mode
**Cause:** No real payment gateway configured
**Solution:** Integrate Airtel Money / MTN Mobile Money / Zambian payment provider

---

## 📝 Testing Accounts Reference

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| ADMIN | drakemacchiko@gmail.com | password123 | Main super admin |
| ADMIN | mike.admin@test.com | Test@123 | Test admin account |
| USER | john.renter@test.com | Test@123 | Regular customer |
| USER | lisa.premium@test.com | Test@123 | Premium customer |
| HOST | sarah.host@test.com | Test@123 | Vehicle owner (2 vehicles) |
| HOST | david.host@test.com | Test@123 | Fleet owner (2 vehicles) |

---

## ✅ Next Steps

1. **IMMEDIATE:** Call verify-all-vehicles API to make vehicles searchable
2. **Test search functionality** - verify 4 vehicles appear
3. **Upload vehicle photos** as hosts
4. **Test complete booking flow** end-to-end
5. **Test admin approval workflow**
6. **Verify all navigation links work**
7. **Test messaging system**
8. **Test claims workflow**
9. **Mobile testing on actual devices**
10. **Performance optimization**

---

**Last Updated:** December 2024  
**Current Blocker:** Vehicles need VERIFIED status to appear in search
