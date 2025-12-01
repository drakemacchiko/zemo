# Phase 2 Testing Walkthrough Guide

> **Complete step-by-step guide for testing all Phase 2 features**  
> Last Updated: November 28, 2025

---

## 🎯 Overview

This guide will walk you through testing all Phase 2 features in the correct order. Each section includes:
- Prerequisites
- Step-by-step instructions
- What to look for
- Common issues
- Screenshots/examples

**Estimated Time:** 2-3 hours  
**Required:** Test user accounts (host and renter)

---

## 📋 Pre-Testing Setup

### Step 1: Start the Development Server

```powershell
# Terminal 1 - Start Next.js dev server
npm run dev
```

**Expected Output:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 2: Check Database Connection

```powershell
# Terminal 2 - Test database connection
node scripts/test-db-connection.js
```

**Expected:** ✅ "Database connection successful!"

### Step 3: Verify Supabase Storage

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to Storage > Buckets
4. Verify `documents` bucket exists
5. Check bucket policies allow authenticated uploads

### Step 4: Create Test Accounts

```powershell
# Create test host account
node scripts/create-admin-user.js
```

**You'll need:**
- 1 Host account (vehicle owner)
- 1 Renter account (customer)

**Save credentials:**
```
Host Email: ____________________
Host Password: _________________

Renter Email: __________________
Renter Password: _______________
```

---

## 🏠 Part 1: Host Dashboard & Navigation

### Test 1.1: Access Host Dashboard

**Steps:**
1. Open browser to `http://localhost:3000`
2. Click **"Login"** in header
3. Enter host credentials
4. Click **"Sign In"**

**✅ Success Criteria:**
- Redirected to `/host/dashboard`
- Dashboard shows stats cards (Total Vehicles, Active Bookings, etc.)
- Sidebar navigation visible on left
- No console errors

**📸 What You Should See:**
```
┌─────────────────────────────────────────┐
│ [≡] ZEMO          [Profile] [Logout]    │
├──────┬──────────────────────────────────┤
│ 🏠   │  Dashboard                        │
│ 🚗   │  ┌─────────┐ ┌─────────┐        │
│ 📅   │  │ Total   │ │ Active  │        │
│ 📊   │  │ Vehicles│ │ Bookings│        │
│ 📝   │  │    5    │ │    3    │        │
│ ✓    │  └─────────┘ └─────────┘        │
│ 📧   │                                   │
│      │  Recent Activity                  │
└──────┴──────────────────────────────────┘
```

### Test 1.2: Navigate Sidebar Menu

**Steps:**
1. From dashboard, click each sidebar item:
   - **Dashboard** → `/host/dashboard`
   - **Vehicles** → `/host/vehicles`
   - **Bookings** → opens submenu
     - Requests → `/host/bookings/requests`
     - Upcoming → `/host/bookings/upcoming`
     - Active → `/host/bookings/active`
     - **Completed** → `/host/bookings/completed` ✨ NEW
     - **Cancelled** → `/host/bookings/cancelled` ✨ NEW
   - **Earnings** → `/host/earnings`
   - **Calendar** → `/host/calendar`
   - **Reviews** → `/host/reviews`
   - **Verification** → `/host/verification` ✨ NEW
   - **Messages** → `/host/messages`

**✅ Success Criteria:**
- Each page loads without errors
- Active menu item highlighted
- Mobile: Hamburger menu works
- URLs update correctly

---

## 📚 Part 2: Document Verification System ✨ NEW

### Test 2.1: Access Verification Page

**Steps:**
1. Click **"Verification"** in sidebar
2. URL should be `/host/verification`

**✅ Success Criteria:**
- Page title: "Host Verification"
- Progress bar at top (0% initially)
- 6 document cards visible
- Each card shows upload button

**📸 Expected Layout:**
```
┌─────────────────────────────────────────┐
│ Host Verification                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 0% Complete (0 of 6 verified)           │
│                                          │
│ ┌──────────────┐  ┌──────────────┐     │
│ │ 🪪 National  │  │ 🚗 Driver's  │     │
│ │    ID        │  │    License   │     │
│ │ Required     │  │ Required     │     │
│ │ [Upload Doc] │  │ [Upload Doc] │     │
│ └──────────────┘  └──────────────┘     │
│                                          │
│ ┌──────────────┐  ┌──────────────┐     │
│ │ 📋 Vehicle   │  │ 🛡️ Insurance│     │
│ │Registration  │  │   Policy     │     │
│ │ Required     │  │ Required     │     │
│ │ [Upload Doc] │  │ [Upload Doc] │     │
│ └──────────────┘  └──────────────┘     │
│                                          │
│ ┌──────────────┐  ┌──────────────┐     │
│ │ 📄 Proof of  │  │ 🏦 Bank      │     │
│ │  Ownership   │  │   Details    │     │
│ │ Required     │  │ Optional     │     │
│ │ [Upload Doc] │  │ [Upload Doc] │     │
│ └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────┘
```

### Test 2.2: Upload National ID

**Steps:**
1. Find **National ID** card
2. Click **"Upload Document"** button
3. Select a test image file (JPG/PNG) or PDF
4. Wait for upload to complete

**✅ Success Criteria:**
- File input opens
- Progress bar shows (0% → 100%)
- Success message appears
- Card updates to show:
  - **Status badge:** "Pending" (yellow)
  - **View button** replaces upload button
  - **Replace button** appears
- Progress bar updates: "17% Complete (1 of 6)"

**🐛 Common Issues:**
- **File too large:** Max 10MB per file
- **Wrong format:** Only JPEG, PNG, PDF allowed
- **Upload fails:** Check Supabase Storage bucket permissions

### Test 2.3: Upload All Required Documents

**Repeat Test 2.2 for:**
1. ✅ National ID
2. ✅ Driver's License
3. ✅ Vehicle Registration
4. ✅ Insurance Policy
5. ✅ Proof of Ownership
6. ⬜ Bank Details (optional - skip for now)

**✅ Success Criteria:**
- All 5 required documents uploaded
- Progress bar: "83% Complete (5 of 6 verified)"
- Each card shows "Pending" status
- No console errors

### Test 2.4: View Uploaded Document

**Steps:**
1. Click **"View"** button on any uploaded document
2. New browser tab should open

**✅ Success Criteria:**
- Document opens in new tab
- URL is a Supabase Storage signed URL
- Document displays correctly
- URL expires after ~1 year (check URL contains `&t=` token)

### Test 2.5: Replace Document

**Steps:**
1. Click **"Replace"** button on any document
2. Select a different file
3. Wait for upload

**✅ Success Criteria:**
- New file uploads successfully
- Old file is replaced
- Progress stays the same
- View button still works with new file

---

## 📝 Part 3: Completed Bookings ✨ NEW

### Test 3.1: Access Completed Bookings Page

**Steps:**
1. Click **"Bookings"** in sidebar
2. Click **"Completed"** submenu item
3. URL: `/host/bookings/completed`

**✅ Success Criteria:**
- Page title: "Completed Trips"
- 3 stat cards at top (Total Trips, Total Earnings, Average Rating)
- Filter section visible
- Booking grid/list view

**📸 Expected Layout:**
```
┌─────────────────────────────────────────┐
│ Completed Trips                          │
│                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ 12 Trips │ │ K15,400  │ │ 4.8 ⭐   │ │
│ │ Total    │ │ Earned   │ │ Rating   │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                          │
│ Filters: [Date Range] [Min Rating] 🔍   │
│                                          │
│ ┌──────────────────────────────────────┐│
│ │ 🚗 2023 Toyota Corolla              ││
│ │ Rented by: John Doe                 ││
│ │ Nov 15-18, 2025 • K450/day          ││
│ │ Total: K1,350 • You earned: K1,215  ││
│ │ ⭐⭐⭐⭐⭐ 5.0 • "Great car!"        ││
│ │ [Download Receipt] [Report Issue]   ││
│ └──────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Test 3.2: Filter by Date Range

**Steps:**
1. Click **"Start Date"** input
2. Select a date (e.g., 30 days ago)
3. Click **"End Date"** input
4. Select today's date
5. Click **"Apply Filters"** or wait for auto-update

**✅ Success Criteria:**
- Booking list updates
- Only bookings within date range shown
- Stats cards update with filtered data
- URL updates with query params: `?startDate=...&endDate=...`

### Test 3.3: Filter by Minimum Rating

**Steps:**
1. Use rating slider or dropdown
2. Set minimum rating (e.g., 4.0)
3. View updated results

**✅ Success Criteria:**
- Only bookings with rating ≥ 4.0 shown
- Bookings without ratings hidden
- Count updates

### Test 3.4: Report Issue (Within 48 Hours)

**Steps:**
1. Find a booking completed less than 48 hours ago
2. Look for **"Report Issue"** button
3. Check countdown timer: "You have X hours to report issues"
4. Click **"Report Issue"**

**✅ Success Criteria:**
- Button only visible if booking ended < 48 hours ago
- Countdown shows remaining time
- Button opens issue reporting form (TODO: implement)
- After 48 hours, button disappears

**🐛 To Test 48-Hour Window:**
- Create a test booking with `endDate = new Date()` (ended now)
- Should show ~48 hours remaining
- Change `endDate` to 3 days ago → button disappears

### Test 3.5: Download Receipt

**Steps:**
1. Click **"Download Receipt"** button
2. (Currently shows alert - implementation pending)

**✅ Success Criteria:**
- Button exists on all bookings
- Click triggers action
- **TODO:** Should generate and download PDF receipt

### Test 3.6: Pagination

**Steps:**
1. If more than 10 bookings, pagination appears
2. Click **"Next"** button
3. Click **"Previous"** button
4. Click page number

**✅ Success Criteria:**
- 10 bookings per page (default)
- Page numbers update
- URL updates: `?page=2`
- Smooth transitions

---

## 🚫 Part 4: Cancelled Bookings ✨ NEW

### Test 4.1: Access Cancelled Bookings Page

**Steps:**
1. Click **"Bookings"** → **"Cancelled"**
2. URL: `/host/bookings/cancelled`

**✅ Success Criteria:**
- Page title: "Cancelled Bookings"
- 3 stat cards (Total Cancellations, Lost Revenue, Host Cancellations)
- Info banner about cancellation policy
- Cancelled booking cards with red left border

**📸 Expected Layout:**
```
┌─────────────────────────────────────────┐
│ Cancelled Bookings                       │
│                                          │
│ ⓘ Cancellation Policy Information...    │
│                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ 3 Total  │ │ K2,100   │ │ 1 Host   │ │
│ │Cancelled │ │ Lost Rev │ │Cancelled │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                          │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓│
│ ┃ 🚗 2023 Toyota Corolla              ┃│
│ ┃ Rented by: Jane Smith               ┃│
│ ┃ Nov 20-23, 2025 • K450/day          ┃│
│ ┃ 🔴 Cancelled by Renter              ┃│
│ ┃ Reason: Schedule conflict           ┃│
│ ┃ Refund: K1,350 • Penalty: K0        ┃│
│ ┃ Cancelled on: Nov 18, 2025          ┃│
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛│
└─────────────────────────────────────────┘
```

### Test 4.2: Identify Cancellation Source

**Steps:**
1. Look at each cancelled booking card
2. Check badge color:
   - 🔴 **Red "Cancelled by Renter"**
   - 🟡 **Yellow "Cancelled by Host"**
   - 🔵 **Blue "Mutual Cancellation"** (if applicable)

**✅ Success Criteria:**
- Badge clearly shows who cancelled
- Color coding consistent
- Reason displayed below badge

### Test 4.3: View Refund Details

**Steps:**
1. Find cancellation with refund
2. Check refund information:
   - Original amount
   - Refund amount
   - Penalty (if any)
   - Cancellation date

**✅ Success Criteria:**
- Refund amount shown in Zambian Kwacha (K)
- Penalty calculated correctly (e.g., 50% for late cancellation)
- Dates formatted properly

### Test 4.4: Filter Cancelled Bookings

**Steps:**
1. Use vehicle filter dropdown
2. Select specific vehicle
3. View filtered results

**✅ Success Criteria:**
- Only cancellations for selected vehicle shown
- Stats update
- Clear filter option available

---

## 📄 Part 5: Rental Agreement System ✨ NEW

### Test 5.1: Create a Test Booking

**Prerequisites:**
- Have at least 1 active booking in system
- Or create one manually in database

**Steps:**
1. Note booking ID (e.g., from `/host/bookings/upcoming`)
2. Keep booking ID for next tests

### Test 5.2: Generate Rental Agreement

**Steps:**
1. Open Postman/Insomnia or use terminal:

```powershell
# Get your access token first
$token = "your_jwt_token_here"

# Generate agreement PDF
curl -X POST http://localhost:3000/api/bookings/YOUR_BOOKING_ID/agreement `
  -H "Authorization: Bearer $token" `
  --output rental-agreement.pdf
```

**Or visit in browser:**
```
http://localhost:3000/api/bookings/[BOOKING_ID]/agreement
```

**✅ Success Criteria:**
- PDF file downloads automatically
- Filename: `rental-agreement-ZEMO-[timestamp]-[bookingId].pdf`
- PDF opens correctly
- Contains:
  - Agreement number
  - Host details (name, email, phone)
  - Renter details (name, email, phone)
  - Vehicle information (make, model, year, plate)
  - Rental period and dates
  - Pricing breakdown
  - 13 Terms & Conditions clauses
  - Signature boxes (empty - to be signed digitally)
  - Professional formatting

**📸 PDF Structure:**
```
┌────────────────────────────────────┐
│ VEHICLE RENTAL AGREEMENT           │
│ Republic of Zambia                 │
│                                    │
│ Agreement No: ZEMO-1234567890-ABC  │
│ Date: November 28, 2025            │
│                                    │
│ 1. PARTIES                         │
│    Host: John Doe                  │
│    Email: john@example.com         │
│    Phone: +260 XXX XXX XXX         │
│                                    │
│    Renter: Jane Smith              │
│    Email: jane@example.com         │
│    Phone: +260 XXX XXX XXX         │
│                                    │
│ 2. VEHICLE INFORMATION             │
│    Make/Model: Toyota Corolla      │
│    Year: 2023                      │
│    Plate: ABC-1234                 │
│                                    │
│ 3. RENTAL PERIOD                   │
│    From: Nov 20, 2025 10:00 AM    │
│    To: Nov 25, 2025 10:00 AM      │
│    Duration: 5 days                │
│                                    │
│ 4. CHARGES                         │
│    Daily Rate: K450                │
│    Total Days: 5                   │
│    Subtotal: K2,250                │
│    Service Fee: K225               │
│    Total: K2,475                   │
│                                    │
│ 5. TERMS AND CONDITIONS            │
│    5.1 Use of Vehicle...           │
│    5.2 Fuel Policy...              │
│    5.3 Mileage Limits...           │
│    ... (13 total clauses)          │
│                                    │
│ SIGNATURES                         │
│ Host: _______  Date: _______       │
│ Renter: _____  Date: _______       │
└────────────────────────────────────┘
```

### Test 5.3: Digital Signature - Host Signs

**Steps:**
1. Create a simple test page or use API directly
2. Send POST request:

```javascript
// In browser console or API client
fetch('http://localhost:3000/api/bookings/YOUR_BOOKING_ID/agreement/sign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_HOST_TOKEN'
  },
  body: JSON.stringify({
    signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANS...', // Canvas signature
    signerType: 'host'
  })
})
```

**✅ Success Criteria:**
- Request returns 200 OK
- Response includes:
  ```json
  {
    "success": true,
    "agreement": {
      "id": "...",
      "hostSigned": true,
      "hostSignedAt": "2025-11-28T10:30:00Z",
      "renterSigned": false,
      "fullyExecuted": false
    }
  }
  ```
- Signature data stored
- IP address captured
- Timestamp recorded

### Test 5.4: Digital Signature - Renter Signs

**Steps:**
1. Switch to renter account (get renter JWT token)
2. Send POST request with `signerType: 'renter'`

**✅ Success Criteria:**
- Request succeeds
- `renterSigned: true`
- `renterSignedAt` populated
- **`fullyExecuted: true`** (both parties signed)
- `fullyExecutedAt` timestamp set

### Test 5.5: Signature Modal Component (UI)

**Steps:**
1. Navigate to a page with signature modal
2. Click **"Sign Agreement"** button
3. Signature modal appears

**✅ Success Criteria:**
- Modal overlays page
- Canvas is 600x200px, white background
- Instructions visible
- Mouse/touch drawing works:
  - Mouse: Click and drag to draw
  - Touch: Touch and drag to draw
- **"Clear"** button erases signature
- **"Submit"** button disabled until drawn
- Legal acknowledgment checkboxes
- Shows signer name, date, IP notice

**📸 Signature Modal:**
```
┌──────────────────────────────────────┐
│ Sign Rental Agreement           [X]  │
├──────────────────────────────────────┤
│                                      │
│ Please sign below:                   │
│ ┌──────────────────────────────────┐│
│ │                                  ││
│ │     [Canvas - Draw signature]    ││
│ │                                  ││
│ └──────────────────────────────────┘│
│                                      │
│ ☑ I agree to the terms              │
│ ☑ Signature is legally binding      │
│                                      │
│ Name: John Doe                       │
│ Date: November 28, 2025              │
│ IP: XXX.XXX.XXX.XXX (recorded)       │
│                                      │
│ [Clear] [Submit Signature]           │
└──────────────────────────────────────┘
```

---

## 🔍 Part 6: Trip Inspection System ✨ NEW

### Test 6.1: Access Pre-Trip Inspection

**Steps:**
1. Navigate to:
   ```
   http://localhost:3000/bookings/[BOOKING_ID]/pre-trip-inspection
   ```
2. Replace `[BOOKING_ID]` with actual booking ID

**✅ Success Criteria:**
- Page loads successfully
- Title: "Pre-Trip Vehicle Inspection"
- Progress bar at top (0% initially)
- 3 info cards: Fuel Level, Odometer, Overall Condition
- Vehicle photo section
- Checklist sections visible

**📸 Expected Layout:**
```
┌─────────────────────────────────────────┐
│ Pre-Trip Vehicle Inspection             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 0% Complete                              │
│                                          │
│ ┌──────┐  ┌──────┐  ┌──────┐           │
│ │ Fuel │  │ Odo  │  │Overall│           │
│ │  0%  │  │ 0 km │  │ N/A  │           │
│ └──────┘  └──────┘  └──────┘           │
│                                          │
│ 📷 Vehicle Photos (All Angles)          │
│ [Upload Photos]                          │
│                                          │
│ ✓ EXTERIOR (15 items)                   │
│   ⭕ Front Bumper  [Good][Fair][Poor]   │
│   ⭕ Rear Bumper   [Good][Fair][Poor]   │
│   ... (15 total)                         │
│                                          │
│ ✓ INTERIOR (13 items)                   │
│   ⭕ Dashboard     [Good][Fair][Poor]   │
│   ... (13 total)                         │
│                                          │
│ ✓ FUNCTIONAL (13 items)                 │
│   ⭕ Engine Start  [Good][Fair][Poor]   │
│   ... (13 total)                         │
│                                          │
│ ✓ SAFETY & EQUIPMENT (8 items)          │
│   ⭕ Spare Tire    [Good][Fair][Poor]   │
│   ... (8 total)                          │
│                                          │
│ 💬 General Damage Notes                 │
│ [Text area]                              │
│                                          │
│ [Submit Inspection] (disabled)           │
└─────────────────────────────────────────┘
```

### Test 6.2: Upload Vehicle Photos

**Steps:**
1. Scroll to **"Vehicle Photos"** section
2. Click **"Upload Photos"** or drag-drop
3. Select 4-6 photos (different angles)
4. Wait for upload

**✅ Success Criteria:**
- Multiple file selection works
- Preview thumbnails appear
- Photos convert to base64 (stored in state)
- Can remove individual photos
- Grid layout (2-3 columns)

**🐛 Common Issues:**
- Large files take time to convert to base64
- Browser may freeze with 10+ large images
- Mobile: Camera option appears

### Test 6.3: Complete Exterior Checklist

**Steps:**
1. Scroll to **"EXTERIOR"** section
2. For each of 15 items, click condition:
   - **Good** (green) - No issues
   - **Fair** (yellow) - Minor wear
   - **Poor** (orange) - Needs attention
   - **Damaged** (red) - Significant damage

**Items:**
1. Front Bumper
2. Rear Bumper
3. Hood
4. Roof
5. Left Front Door
6. Left Rear Door
7. Right Front Door
8. Right Rear Door
9. Windshield
10. Rear Window
11. Headlights
12. Taillights
13. Side Mirrors
14. Wheels/Tires
15. Undercarriage

**✅ Success Criteria:**
- Each button toggles condition
- Selected condition highlighted
- Progress bar updates as items completed
- If **Fair/Poor/Damaged** selected:
  - Text input appears for notes
  - Photo upload button appears
- Completion percentage increases

### Test 6.4: Document Damage

**Steps:**
1. Select **"Damaged"** for "Left Front Door"
2. Notes field appears
3. Type: "Deep scratch on door panel, 10cm long"
4. Click **"Upload Photo"** for this item
5. Select close-up photo of damage

**✅ Success Criteria:**
- Notes saved to that checklist item
- Photo thumbnail appears next to item
- Can upload multiple photos per item
- Photo stored in item's `photos` array

### Test 6.5: Complete All Checklists

**Steps:**
1. Complete all 15 Exterior items
2. Complete all 13 Interior items
3. Complete all 13 Functional items
4. Complete all 8 Safety & Equipment items

**Total:** 49 checklist items

**✅ Success Criteria:**
- Progress bar reaches 100%
- All sections show ✅ checkmark
- No red incomplete indicators

### Test 6.6: Set Fuel Level

**Steps:**
1. Scroll to **"Fuel Level"** slider
2. Drag slider (0% → 100%)
3. Watch percentage update

**✅ Success Criteria:**
- Slider moves smoothly
- Percentage displays correctly
- Value saved in state
- Optional: Upload fuel gauge photo

### Test 6.7: Record Odometer Reading

**Steps:**
1. Find **"Odometer Reading"** input
2. Enter current mileage (e.g., `45250`)
3. Optional: Upload odometer photo

**✅ Success Criteria:**
- Number input accepts digits only
- No decimals allowed
- Value displays in info card at top
- Optional photo upload works

### Test 6.8: Set Overall Condition

**Steps:**
1. Find **"Overall Condition"** dropdown
2. Select one:
   - Excellent
   - Good
   - Fair
   - Poor

**✅ Success Criteria:**
- Dropdown shows all 4 options
- Selection updates info card
- Cannot submit without selecting

### Test 6.9: Add General Damage Notes

**Steps:**
1. Scroll to **"General Damage Notes"** textarea
2. Type additional observations:
   ```
   Vehicle is clean. Minor scratches on bumper.
   All lights working. Spare tire present.
   ```

**✅ Success Criteria:**
- Textarea accepts multiline text
- No character limit (or shows limit)
- Text saves correctly

### Test 6.10: Submit Inspection

**Steps:**
1. Ensure 100% complete
2. Click **"Submit Inspection"** button
3. Wait for submission

**✅ Success Criteria:**
- Button enabled only at 100%
- Loading spinner shows during submit
- Success message appears
- Redirects to booking details or confirmation
- API POST to `/api/bookings/[id]/inspection`:
  ```json
  {
    "inspectionType": "PRE_TRIP",
    "inspectorRole": "HOST",
    "photos": ["base64...", "base64..."],
    "fuelLevel": 75,
    "odometerReading": 45250,
    "damageNotes": "Vehicle is clean..."
  }
  ```
- Database record created in `trip_inspections` table

### Test 6.11: View Completed Inspection

**Steps:**
1. Navigate back to inspection page
2. Or fetch via API:
   ```
   GET /api/bookings/[id]/inspection?type=PRE_TRIP
   ```

**✅ Success Criteria:**
- Inspection data loads
- All checklist items pre-filled
- Photos display
- Can view but not edit (or shows "View Only" mode)
- Shows who signed and when

---

## 🔄 Part 7: End-to-End Booking Flow

### Test 7.1: Complete Booking Lifecycle

**Steps:**
1. **Create Booking** (as renter)
   - Search for vehicle
   - Select dates
   - Create booking

2. **Host Verifies Documents** (you as host)
   - Upload all 5 required documents
   - Wait for admin approval (or mock approved status)

3. **Generate Agreement**
   - POST `/api/bookings/[id]/agreement`
   - Download and review PDF

4. **Both Parties Sign**
   - Host signs agreement
   - Renter signs agreement
   - Verify `fullyExecuted: true`

5. **Pre-Trip Inspection**
   - Complete 49-item checklist
   - Upload photos
   - Submit inspection

6. **Activate Booking** (manual status update)
   - Update booking status to `ACTIVE`

7. **Post-Trip Inspection** (TODO: build UI)
   - Compare with pre-trip
   - Document new damage
   - Calculate charges

8. **Complete Booking**
   - Update status to `COMPLETED`
   - View in Completed Bookings page

9. **Download Receipt**
   - Click "Download Receipt" (TODO: implement)

**✅ Success Criteria:**
- Entire flow completes without errors
- Data persists at each step
- Status updates correctly
- Pages reflect current state

---

## 🌐 Part 8: Cross-Device Testing

### Test 8.1: Desktop Browsers

**Test on each:**
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest, macOS)
- ✅ Edge (latest)

**Checklist for each browser:**
- [ ] Pages load without errors
- [ ] File uploads work
- [ ] Signature canvas works (mouse)
- [ ] Filters and dropdowns work
- [ ] PDF generation downloads
- [ ] Responsive layouts correct

### Test 8.2: Tablet Devices

**iPad (Safari):**
- [ ] 768px - 1024px breakpoint
- [ ] Sidebar collapses to hamburger
- [ ] Touch interactions work
- [ ] Signature canvas works (touch)
- [ ] File uploads from camera/photos

**Android Tablet:**
- [ ] Similar checklist to iPad
- [ ] Chrome browser

### Test 8.3: Mobile Devices

**iPhone (Safari):**
- [ ] 375px - 414px breakpoint
- [ ] Hamburger menu
- [ ] Bottom navigation (if implemented)
- [ ] Touch gestures
- [ ] Camera access for photos
- [ ] Signature with finger
- [ ] Responsive tables/cards

**Android Phone (Chrome):**
- [ ] Similar checklist to iPhone
- [ ] Back button behavior
- [ ] PWA installation

---

## 🐛 Part 9: Error Handling & Edge Cases

### Test 9.1: Network Errors

**Steps:**
1. Open DevTools → Network tab
2. Throttle to **"Offline"**
3. Try uploading document
4. Try submitting inspection

**✅ Success Criteria:**
- Friendly error message appears
- No cryptic errors
- Retry option available
- Data not lost

### Test 9.2: Invalid File Types

**Steps:**
1. Try uploading `.exe`, `.zip`, `.docx` file
2. Try uploading 20MB file

**✅ Success Criteria:**
- Error: "Invalid file type. Please upload JPEG, PNG, or PDF"
- Error: "File too large. Maximum size is 10MB"
- Upload blocked before sending

### Test 9.3: Incomplete Forms

**Steps:**
1. Try submitting inspection at 50% complete
2. Try signing agreement without drawing

**✅ Success Criteria:**
- Submit button disabled
- Helpful message: "Complete all items before submitting"
- Missing fields highlighted

### Test 9.4: Duplicate Signatures

**Steps:**
1. Sign agreement as host
2. Try signing again as host

**✅ Success Criteria:**
- Error: "You have already signed this agreement"
- Or: Signature updates to new one (with timestamp)

### Test 9.5: Unauthorized Access

**Steps:**
1. Log out
2. Try accessing `/host/verification` directly
3. Try POST to agreement API without token

**✅ Success Criteria:**
- Redirected to login page
- API returns 401 Unauthorized
- No data exposed

---

## 📊 Part 10: Performance Testing

### Test 10.1: Large Image Uploads

**Steps:**
1. Upload 10 photos at once (each 5-8MB)
2. Monitor browser performance

**✅ Success Criteria:**
- Browser doesn't freeze
- Progress indicators show
- Uploads complete (may take time)
- Memory usage reasonable

### Test 10.2: Pagination Performance

**Steps:**
1. Create 100+ test bookings
2. Navigate completed bookings page
3. Test pagination

**✅ Success Criteria:**
- Page loads < 3 seconds
- Smooth page transitions
- No lag when filtering

### Test 10.3: PDF Generation Speed

**Steps:**
1. Generate agreement PDF
2. Time the operation

**✅ Success Criteria:**
- PDF generates < 5 seconds
- No timeout errors
- File size < 500KB

---

## ✅ Final Checklist

### Documentation
- [ ] All features tested
- [ ] Issues documented
- [ ] Screenshots captured
- [ ] Test data saved

### Database Verification
```sql
-- Check documents uploaded
SELECT * FROM documents WHERE userId = 'YOUR_USER_ID';

-- Check agreements created
SELECT * FROM rental_agreements WHERE bookingId = 'YOUR_BOOKING_ID';

-- Check inspections saved
SELECT * FROM trip_inspections WHERE agreementId = 'YOUR_AGREEMENT_ID';
```

### API Endpoints Verified
- [ ] GET `/api/host/bookings/completed`
- [ ] GET `/api/host/bookings/cancelled`
- [ ] POST `/api/documents/upload`
- [ ] POST `/api/bookings/[id]/agreement`
- [ ] GET `/api/bookings/[id]/agreement`
- [ ] POST `/api/bookings/[id]/agreement/sign`
- [ ] POST `/api/bookings/[id]/inspection`
- [ ] GET `/api/bookings/[id]/inspection`

### Known Issues Logged
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

### Browser Compatibility
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅
- [ ] Mobile Safari ✅
- [ ] Mobile Chrome ✅

---

## 🎉 Phase 2 Testing Complete!

**Sign-Off:**

Tester: _____________________  
Date: _____________________  
Status: [ ] PASS  [ ] FAIL  

**Notes:**
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## 🆘 Troubleshooting

### Issue: Document upload fails
**Solution:**
- Check Supabase Storage bucket exists
- Verify bucket is public or has proper RLS policies
- Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### Issue: PDF generation fails
**Solution:**
- Verify Puppeteer installed: `npm list puppeteer`
- Check Node.js version ≥ 18
- Increase memory limit: `NODE_OPTIONS=--max-old-space-size=4096`

### Issue: Signature canvas not drawing
**Solution:**
- Check browser console for errors
- Verify canvas dimensions set
- Test mouse vs. touch events separately
- Clear browser cache

### Issue: Inspection won't submit
**Solution:**
- Ensure all 49 items selected
- Check fuel level set (0-100)
- Check odometer reading entered
- Check overall condition selected
- Open console to see validation errors

---

**End of Walkthrough Guide** 🚀
