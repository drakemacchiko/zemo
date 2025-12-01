# ZEMO REBUILD - PHASE 2: HOST EXPERIENCE & VEHICLE MANAGEMENT

## Overview
This phase focuses on creating a world-class host experience, including vehicle listing, photo management, document handling, and host dashboard functionality matching Turo's standards.

---

## 1. HOST DASHBOARD REDESIGN

### Goal
Create a comprehensive, intuitive host dashboard that provides all necessary tools and insights.

### Implementation Steps

#### 1.1 Dashboard Overview
```
PROMPT: Create a modern host dashboard for ZEMO matching Turo's host interface:

1. **Dashboard Landing** (/src/app/host/dashboard/page.tsx):
   
   **Top Stats Bar** (4 cards):
   - Card 1: "Active Bookings"
     * Large number
     * Trend indicator (up/down from last month)
     * "View all" link
   
   - Card 2: "Monthly Earnings"
     * Amount in ZMW
     * Percentage change
     * "View details" link
   
   - Card 3: "Your Vehicles"
     * Number of active listings
     * "Manage vehicles" link
   
   - Card 4: "Average Rating"
     * Star rating (4.8★)
     * Number of reviews
     * "View reviews" link

   **Upcoming Bookings Section**:
   - List of next 5 upcoming bookings
   - Show: vehicle, renter name, dates, status
   - Quick actions: Message renter, View details
   - "See all bookings" button

   **Recent Activity Feed**:
   - New booking requests
   - Completed trips
   - Reviews received
   - Messages
   - Payout notifications
   - Timestamps (e.g., "2 hours ago")

   **Vehicle Performance**:
   - Bar chart showing trips per vehicle
   - Earnings per vehicle
   - Utilization rate

   **Quick Actions Card**:
   - "List a new vehicle" button
   - "Respond to booking requests" (with count badge)
   - "Update your calendar"
   - "View earnings report"

   **Tips & Resources**:
   - "Increase your bookings" tips
   - Link to host guide
   - Success stories

2. **Responsive Design**:
   - Desktop: 3-column grid for cards
   - Tablet: 2-column grid
   - Mobile: Single column, stacked layout

3. **Real-time Updates**:
   - Use WebSocket or polling for new booking requests
   - Show toast notification for new messages
   - Update earnings in real-time

Implement with proper loading states and error handling.
```

#### 1.2 Host Sidebar Navigation
```
PROMPT: Create a dedicated host navigation sidebar:

1. **Sidebar Items** (/src/components/host/HostSidebar.tsx):
   - Dashboard (home icon) - highlighted when active
   - Your Vehicles
     * All Vehicles
     * Add New Vehicle
     * Vehicle Performance
   - Bookings
     * Booking Requests (badge with count)
     * Upcoming
     * Active
     * Completed
     * Cancelled
   - Calendar
     * Availability Calendar
     * Blocked Dates
   - Earnings
     * Overview
     * Transaction History
     * Payout Methods
     * Tax Documents
   - Messages (badge with unread count)
   - Reviews
   - Insurance & Protection
   - Help & Resources

2. **Mobile Navigation**:
   - Bottom tab bar for mobile
   - Key items: Dashboard, Vehicles, Bookings, Messages
   - "More" menu for additional items

3. **Visual Design**:
   - Highlight active route
   - Icons for each item
   - Collapsible sections
   - Badge indicators for notifications
```

---

## 2. VEHICLE LISTING CREATION - TURO STANDARD

### Goal
Create a comprehensive, user-friendly vehicle listing process that covers all industry standards.

### Implementation Steps

#### 2.1 Multi-Step Listing Wizard
```
PROMPT: Create a professional vehicle listing wizard following Turo's best practices:

1. **Listing Wizard Structure** (/src/app/host/vehicles/new/page.tsx):

   **Step 1: Vehicle Details**
   - VIN number input (with validation)
   - "Find my car" button (auto-populate from VIN)
   - Manual entry fields:
     * Year (dropdown: current year back to 2000)
     * Make (dropdown with popular makes)
     * Model (dependent dropdown based on make)
     * Trim (optional)
     * License plate number
     * Registration number
   - Odometer reading (with unit: km)
   - Transmission type: Automatic/Manual
   - Fuel type: Petrol/Diesel/Electric/Hybrid
   - Seating capacity (dropdown: 2-9)
   - Number of doors (2, 4, 5)
   - Color (dropdown + custom)
   - Save and continue

   **Step 2: Vehicle Category & Features**
   - Vehicle category/class:
     * Economy
     * Compact
     * Midsize
     * Full-size
     * SUV
     * Luxury
     * Sports
     * Van
     * Truck
     * Electric
   - Features checklist (multi-select):
     * Air conditioning
     * Bluetooth/AUX
     * Backup camera
     * Parking sensors
     * GPS/Navigation
     * USB charger
     * Heated seats
     * Sunroof/Moonroof
     * Leather seats
     * All-wheel drive
     * Keyless entry
     * Apple CarPlay/Android Auto
     * Bike rack
     * Ski rack
     * Toll pass
     * Dash cam
     * Child seat available
   - Add custom features (text input)

   **Step 3: Location & Delivery**
   - Primary location (where car is usually parked):
     * Street address
     * City
     * Province
     * Postal code
     * Google Maps integration for pin drop
   - Is exact address hidden until booking? (toggle - recommended: Yes)
   - Delivery options:
     * Pickup only (free)
     * Delivery available (set radius and fee)
     * Airport delivery (with fee)
     * Custom delivery radius (km) and price per km
   - Pickup instructions (textarea):
     * "Where to meet, what to bring, etc."

   **Step 4: Availability & Scheduling**
   - Calendar integration
   - Availability type:
     * Always available (except blocked dates)
     * Limited availability (select specific dates)
   - Advance notice required:
     * Same day (instant)
     * 1 day
     * 2 days
     * 3 days
     * 7 days
   - Shortest trip duration:
     * 1 hour (hourly rental)
     * 1 day (daily rental)
     * 2 days minimum
     * 3 days minimum
     * 1 week minimum
   - Longest trip duration:
     * No limit
     * 1 week
     * 2 weeks
     * 1 month
   - Booking preferences:
     * Instant booking (auto-approve)
     * Manual approval required

   **Step 5: Pricing**
   - Daily rate (ZMW)
   - Hourly rate (optional)
   - Weekly discount (percentage or amount)
   - Monthly discount (percentage or amount)
   - Weekend pricing (optional premium/discount)
   - Security deposit amount
   - Mileage allowance per day (km)
   - Extra mileage fee (ZMW per km)
   - Fuel policy:
     * Same as pickup
     * Prepaid full tank
     * Pay for what you use
   - Late return fee (per hour)
   - Cleaning fee (optional)
   - Price comparison widget: "Similar cars in your area rent for ZMW X - ZMW Y"

   **Step 6: Insurance & Protection**
   - Choose insurance plan offered:
     * Basic (included free)
     * Standard (+ ZMW X)
     * Premium (+ ZMW Y)
   - Your insurance coverage details
   - Policy number
   - Upload insurance certificate (PDF/image)

   **Step 7: Rules & Requirements**
   - Minimum driver age (18-30)
   - Minimum driving experience (years)
   - Driver's license requirements:
     * Valid Zambian license
     * International license accepted
   - Additional driver fees
   - Smoking policy:
     * No smoking
     * Smoking allowed (with fee)
   - Pet policy:
     * No pets
     * Pets allowed (with fee)
   - Usage restrictions:
     * No off-road driving
     * No racing/competitions
     * No commercial use
     * Country restrictions (stay in Zambia)
   - Custom rules (textarea)

   **Step 8: Documents Required**
   - Documents host must upload:
     * Vehicle registration (front & back)
     * Insurance certificate
     * Roadworthiness certificate
     * Owner's ID (for verification)
     * Vehicle inspection photos (optional but recommended)
   - Document upload interface with:
     * Drag and drop
     * File type validation
     * Preview
     * Re-upload option

   **Step 9: Photos** (Redirect to photo upload)
   - Professional photo guide
   - Minimum 6 photos required
   - Photo checklist:
     * Front
     * Back
     * Both sides
     * Interior dashboard
     * Back seats
     * Trunk/boot
     * Engine bay (optional)
     * Wheels/tires
     * Any damage (required if exists)
   - Photo tips overlay:
     * "Clean your car first"
     * "Good lighting"
     * "No filters"
     * "Show actual condition"
   - Reorder photos (first = main listing image)

   **Step 10: Vehicle Description**
   - Title (auto-generated but editable): "2020 Toyota Corolla"
   - Description (textarea with character limit):
     * Encourage hosts to mention unique features
     * Driving experience
     * Best uses for the vehicle
     * Any quirks or special instructions
   - Template suggestions:
     * "Perfect for [city trips/road trips/family travel]"
     * "Recent upgrades include..."
     * "Great fuel economy"

   **Step 11: Review & Publish**
   - Summary of all information
   - Preview how listing will appear to renters
   - Edit any section
   - Checklist:
     * ✅ Vehicle details complete
     * ✅ Photos uploaded (min 6)
     * ✅ Documents uploaded
     * ✅ Pricing set
     * ✅ Availability configured
   - "Submit for Review" button (if approval required)
   - "Publish Listing" button (if instant)

2. **Progress Indicator**:
   - Visual stepper at top showing 11 steps
   - Current step highlighted
   - Completed steps with checkmarks
   - Click to navigate to any completed step

3. **Save & Continue**:
   - Auto-save draft every 30 seconds
   - "Save and exit" button on each step
   - Resume later from where you left off

4. **Validation**:
   - Client-side validation for each step
   - Server-side validation before saving
   - Clear error messages
   - Prevent advancing to next step if current is incomplete

5. **Help & Guidance**:
   - Info tooltips next to confusing fields
   - "Why we ask this" explanations
   - Photo tips modal
   - Pricing calculator help

Implement with proper TypeScript types and comprehensive error handling.
Create API routes for each step to save progress.
```

#### 2.2 Simplified Quick List Option
```
PROMPT: In addition to the comprehensive wizard, create a "Quick List" option:

1. **Quick List Form** (/src/app/host/vehicles/quick-list/page.tsx):
   - Single page form with essential fields only:
     * Year, Make, Model
     * License plate
     * Daily price
     * Location (city)
     * Upload 3+ photos
   - "You can add details later" note
   - "Quick publish" button
   - After publishing, prompt to complete full details

2. **Purpose**:
   - Lower barrier to entry for new hosts
   - Get listing live faster
   - Can be enhanced later with full details

This gives hosts flexibility in how they want to list.
```

---

## 3. VEHICLE EDITING & MANAGEMENT

### Goal
Allow hosts to easily view and edit their vehicle listings.

### Implementation Steps

#### 3.1 View All Vehicles
```
PROMPT: Create a vehicle management interface for hosts:

1. **Vehicles List Page** (/src/app/host/vehicles/page.tsx):
   - Grid or list view toggle
   - Each vehicle card shows:
     * Main photo
     * Vehicle name (2020 Toyota Corolla)
     * Status badge (Active, Pending Review, Paused, Inactive)
     * Stats: 
       - Total trips
       - Rating (4.8★)
       - Monthly earnings
     * Quick actions:
       - Edit
       - View listing (as renter sees it)
       - Manage photos
       - Pause listing
       - Delete
       - View bookings
   - Filters:
     * All vehicles
     * Active
     * Paused
     * Pending approval
   - Search vehicles (by name/plate)
   - Sort by: Recently added, Most popular, Highest earning

2. **Empty State**:
   - If no vehicles: 
     * Illustration
     * "You haven't listed any vehicles yet"
     * "List your first vehicle" button
     * Benefits reminder

3. **Bulk Actions**:
   - Select multiple vehicles
   - Pause all selected
   - Delete all selected
   - Update pricing for selected
```

#### 3.2 Edit Vehicle
```
PROMPT: Create vehicle editing interface:

1. **Edit Vehicle Page** (/src/app/host/vehicles/[id]/edit/page.tsx):
   - Same multi-step wizard as creation
   - Pre-populated with existing data
   - "Save changes" button on each step
   - "Cancel" button (confirm before discarding changes)
   - Visual indicator if field was changed
   - "Discard changes" option
   - Change history/audit log (for admin review)

2. **Quick Edit Mode**:
   - All fields on single page (tabbed sections)
   - For experienced hosts who want to edit quickly
   - Toggle between wizard and quick edit

3. **Restricted Edits**:
   - Some fields can't be changed after approval:
     * VIN number
     * License plate (require admin verification)
   - Show explanation if field is locked

4. **Auto-Save**:
   - Draft changes saved automatically
   - "Unsaved changes" warning before leaving page
```

---

## 4. PHOTO MANAGEMENT SYSTEM

### Goal
Comprehensive photo upload, management, and editing system.

### Implementation Steps

#### 4.1 Enhanced Photo Upload
```
PROMPT: Create a professional photo management system:

1. **Photo Upload Page** (/src/app/host/vehicles/[id]/photos/page.tsx):
   
   **Upload Interface**:
   - Drag and drop zone (large, prominent)
   - "Select photos" button as alternative
   - Multiple file selection
   - Show upload progress for each file
   - Pause/cancel upload option
   - Maximum 30 photos per vehicle
   - File requirements displayed:
     * JPEG, PNG, WebP
     * Max 10MB per photo
     * Minimum 1200x800px resolution

   **Photo Grid** (existing photos):
   - Grid layout showing all uploaded photos
   - First photo highlighted as "Main listing photo"
   - Drag to reorder photos
   - Hover actions on each photo:
     * Set as main
     * Rotate
     * Crop
     * Delete
     * Add caption
   - Photo info overlay:
     * File size
     * Dimensions
     * Upload date

   **Photo Guidelines Panel**:
   - Checklist of required photos:
     * ✅ Front view
     * ✅ Back view
     * ✅ Driver side
     * ✅ Passenger side
     * ✅ Interior front
     * ✅ Interior back
     * ⬜ Trunk/boot
     * ⬜ Engine
   - Tips for great photos:
     * "Clean your car before photographing"
     * "Take photos in good natural light"
     * "Avoid filters or heavy editing"
     * "Show any damage honestly"
     * "Use landscape orientation"

2. **Photo Editor**:
   - Click photo to open editor modal
   - Basic editing tools:
     * Crop (with preset ratios)
     * Rotate (90° increments)
     * Brightness/contrast adjustment
     * Straighten
   - Save edits
   - Revert to original option

3. **Damage Documentation**:
   - Special section for damage photos
   - "Document existing damage" button
   - For each damage photo:
     * Photo upload
     * Description of damage
     * Location on vehicle (visual diagram)
     * Severity (minor/moderate/major)
   - These photos not shown in main listing
   - Shared with renter only after booking confirmed

4. **Professional Photos Option**:
   - "Get professional photos" CTA
   - Link to partner photographers
   - "Schedule a shoot" booking
   - Show examples of professional vs amateur photos

Ensure photo upload uses the robust system from Phase 1.
Implement proper loading states and error handling.
Allow retry for failed uploads.
```

---

## 5. DOCUMENT UPLOAD & VERIFICATION

### Goal
Industry-standard document handling for hosts and renters, matching Turo's approach.

### Implementation Steps

#### 5.1 Host Document Requirements
```
PROMPT: Research Turo's document requirements and implement similar system for ZEMO:

1. **Host Documents** (/src/app/host/verification/page.tsx):
   
   **Required Documents from Host**:
   - Personal ID/Passport:
     * Front and back photos
     * Must be clear and readable
     * Expiration date validation
     * Auto-extract data with OCR
   
   - Driver's License:
     * For hosts who also drive other vehicles
     * Front and back
   
   - Vehicle Registration:
     * Front and back
     * Must match listed vehicle
     * Verify VIN matches
   
   - Insurance Certificate:
     * Valid policy document
     * Must cover the listing period
     * Verify coverage amount
   
   - Proof of Ownership:
     * Registration in host's name, OR
     * Letter of authorization if not owner
   
   - Bank Account Details:
     * For payouts
     * Bank name
     * Account number
     * Branch code
     * Account holder name (must match ID)
     * Upload voided cheque or bank statement

   **Document Upload Interface**:
   - Card for each document type
   - Status indicator: Not uploaded, Uploaded, Under review, Approved, Rejected
   - Upload button/drag-drop
   - File preview
   - Re-upload option if rejected
   - Rejection reasons displayed
   - Tips for each document type

2. **Document Verification Process**:
   - Auto-verify with OCR where possible
   - Flag for manual review if needed
   - Admin approval workflow
   - Email notification on approval/rejection
   - Host can't list vehicles until documents approved

3. **Verification Badge**:
   - "Verified Host" badge on profile
   - Show in search results
   - Increases trust with renters
```

#### 5.2 Renter Document Requirements
```
PROMPT: Implement renter verification and document submission:

1. **Renter Verification** (/src/app/profile/verification/page.tsx):
   
   **Required from Renter**:
   - Driver's License:
     * Front and back
     * Must be valid (not expired)
     * Verify license number
     * Check against any suspension databases (if available)
   
   - Selfie Verification:
     * Take live photo
     * Compare with license photo (manual or AI)
     * Prevent fake/stolen licenses
   
   - Additional ID:
     * National ID or Passport
     * For international renters
   
   - Proof of Address (optional for higher-tier bookings):
     * Utility bill
     * Bank statement
     * Within last 3 months

   **Upload Interface**:
   - Similar to host interface
   - Real-time validation
   - Instant approval for low-risk renters
   - Manual review for high-value bookings

2. **Booking-Time Documents**:
   - When making a booking, renter must upload:
     * Driver's license (if not already verified)
     * Insurance proof (if bringing own)
   - Host can request additional documents:
     * Second form of ID
     * Employment letter (for long rentals)
     * Previous rental references

3. **Trip-Specific Documents**:
   - Rental agreement (auto-generated, both parties sign)
   - Pre-trip inspection form with photos
   - Post-trip inspection form with photos
```

#### 5.3 Document Storage & Security
```
PROMPT: Implement secure document storage:

1. **Storage Setup**:
   - Use Supabase Storage private bucket: 'documents'
   - Encrypt sensitive documents at rest
   - Signed URLs with expiration (1 hour)
   - Access control: only owner, admins, and counterparty can view

2. **Document API Routes**:
   - POST /api/documents/upload
   - GET /api/documents/[id] (with authorization check)
   - DELETE /api/documents/[id] (soft delete, keep for 90 days)
   - POST /api/documents/verify (for admin verification)

3. **Privacy & Compliance**:
   - Auto-blur sensitive info in thumbnails
   - Data retention policy (delete after X years)
   - User can request document deletion
   - Audit log of who accessed what document

4. **OCR Integration** (optional):
   - Use Tesseract.js or cloud OCR service
   - Extract text from documents
   - Auto-fill form fields
   - Verify information matches
```

---

## 6. RENTAL AGREEMENT & SIGNING PROCESS

### Goal
Digital agreement generation and signing, similar to Turo.

### Implementation Steps

#### 6.1 Agreement Templates
```
PROMPT: Create legal agreement system:

1. **Rental Agreement Template** (/src/lib/agreements/rental-agreement-template.ts):
   - Comprehensive terms and conditions:
     * Parties (host and renter details)
     * Vehicle details
     * Rental period and location
     * Pricing breakdown
     * Security deposit terms
     * Insurance coverage
     * Mileage allowance
     * Fuel policy
     * Host rules
     * Damage responsibility
     * Cancellation policy
     * Signatures
   
   - Template variables that get filled in:
     * [HOST_NAME]
     * [RENTER_NAME]
     * [VEHICLE_MAKE_MODEL]
     * [RENTAL_START_DATE]
     * [RENTAL_END_DATE]
     * [DAILY_RATE]
     * [TOTAL_COST]
     * etc.

2. **Agreement Generation** (/src/app/api/bookings/[id]/agreement/route.ts):
   - Triggered when booking is confirmed
   - Fill template with booking data
   - Generate PDF using library (jsPDF or Puppeteer)
   - Store in database and Supabase Storage
   - Send to both host and renter

3. **Digital Signing**:
   - Both parties must sign before trip starts
   - Sign with:
     * Typed name + "I agree" checkbox + timestamp, OR
     * Canvas signature (draw with mouse/touch)
   - IP address logged
   - Timestamp recorded
   - Agreement locked after both signatures
   - Send final signed copy to both parties

4. **Signature UI** (/src/components/agreements/SignatureModal.tsx):
   - Show full agreement text
   - Scrollable agreement with "I've read and agree" checkbox
   - Signature canvas or typed name input
   - "Sign Agreement" button
   - Can't proceed without signing
   - Email confirmation sent after signing
```

#### 6.2 Pre-Trip & Post-Trip Inspection
```
PROMPT: Implement inspection checklist and photo documentation:

1. **Pre-Trip Inspection** (/src/app/bookings/[id]/pre-trip-inspection/page.tsx):
   - Done by host and renter together at pickup
   - Inspection checklist:
     * Exterior condition (select from options: Excellent, Good, Fair, Poor)
       - Front bumper
       - Rear bumper
       - Hood
       - Roof
       - Doors (all)
       - Windows
       - Lights
       - Mirrors
       - Tires
     * Interior condition:
       - Seats
       - Dashboard
       - Steering wheel
       - Floor mats
       - Trunk
     * Functional items:
       - Air conditioning
       - Lights (all)
       - Wipers
       - Horn
       - Locks
     * Fuel level (photo of gauge)
     * Odometer reading (photo)
     * Overall cleanliness (1-5 stars)
   
   - Photo upload for each section
   - Add notes for any issues
   - Both parties review and sign off
   - Creates baseline for damage comparison

2. **Post-Trip Inspection** (/src/app/bookings/[id]/post-trip-inspection/page.tsx):
   - Done at return
   - Same checklist as pre-trip
   - Compare with pre-trip photos
   - Flag any new damage
   - If new damage found:
     * Detailed photos required
     * Description of damage
     * Estimated repair cost
     * Create damage claim
   - Both parties sign off
   - If no issues, security deposit released

3. **Inspection Report PDF**:
   - Generate report with photos
   - Side-by-side comparison (before/after)
   - Stored with booking records
   - Used for insurance claims if needed
```

---

## 7. EXTRAS & ADD-ONS (TURO STYLE)

### Goal
Allow hosts to offer extras and renters to select them at booking.

### Implementation Steps

#### 7.1 Host Extras Configuration
```
PROMPT: Create extras/add-ons system:

1. **Extras Management** (/src/app/host/vehicles/[id]/extras/page.tsx):
   
   **Default Extras** (host can enable/disable and set price):
   - GPS Navigation Device: ZMW [__] per day
   - Child Safety Seat: ZMW [__] per day
   - Booster Seat: ZMW [__] per day
   - Additional Driver: ZMW [__] per day
   - Phone Mount: ZMW [__] per day
   - Phone Charger: ZMW [__] per day
   - Wifi Hotspot: ZMW [__] per day
   - Cooler/Ice Box: ZMW [__] per day
   - Roof Rack: ZMW [__] per day
   - Bike Rack: ZMW [__] per day
   - Snow Chains (seasonal): ZMW [__] per day
   - Toll Pass: ZMW [__] per day
   - Prepaid Fuel: ZMW [__] per tank
   - Airport Delivery: ZMW [__] flat fee
   - Custom Location Delivery: ZMW [__] per km
   
   **Custom Extras**:
   - Host can add custom extras:
     * Name
     * Description
     * Price (per day or flat fee)
     * Quantity available
     * Photo (optional)
   
   **Insurance Options** (if not platform-wide):
   - Basic protection (included)
   - Standard protection: +ZMW [__]
   - Premium protection: +ZMW [__]
   - Coverage details for each tier

2. **Extras Database Schema**:
   ```prisma
   model VehicleExtra {
     id          String   @id @default(cuid())
     vehicleId   String
     vehicle     Vehicle  @relation(fields: [vehicleId], references: [id])
     name        String
     description String?
     priceType   PriceType  // PER_DAY, FLAT_FEE, PER_KM
     price       Float
     available   Boolean  @default(true)
     quantity    Int      @default(1)
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
   }
   
   enum PriceType {
     PER_DAY
     FLAT_FEE
     PER_KM
   }
   ```

3. **API Routes**:
   - GET /api/vehicles/[id]/extras - List all extras for a vehicle
   - POST /api/vehicles/[id]/extras - Add new extra
   - PUT /api/vehicles/[id]/extras/[extraId] - Update extra
   - DELETE /api/vehicles/[id]/extras/[extraId] - Remove extra
```

#### 7.2 Renter Extras Selection
```
PROMPT: Implement extras selection in booking flow:

1. **Extras Selection Page** (part of booking flow):
   - After selecting dates and before payment
   - Show all available extras for the vehicle
   - Each extra as a card:
     * Name and description
     * Price (calculated based on trip duration)
     * Quantity selector (if applicable)
     * Add/remove toggle
   - Running total updates as extras are added
   - "Continue to payment" button

2. **Booking Summary**:
   - Base rental cost
   - Each selected extra with cost
   - Service fee
   - Taxes
   - Total
   - Breakdown by day/week/month if applicable

3. **Confirmation Email**:
   - Include all extras in booking confirmation
   - Remind renter what extras they selected
   - Pickup instructions for extras
```

---

## 8. BOOKING MANAGEMENT FOR HOSTS

### Goal
Comprehensive booking management interface for hosts.

### Implementation Steps

#### 8.1 Booking Requests
```
PROMPT: Create booking request management for hosts:

1. **Booking Requests Page** (/src/app/host/bookings/requests/page.tsx):
   - List all pending booking requests
   - Each request card shows:
     * Renter profile photo and name
     * Verification badges (verified license, etc.)
     * Renter rating and number of trips
     * Vehicle requested
     * Dates and duration
     * Total earning
     * Special requests/message from renter
     * Time remaining to respond (e.g., "18 hours left")
   
   - Actions:
     * "Accept" button (green)
     * "Decline" button (red)
     * "Message renter" button
     * "View renter profile"
   
   - Accept booking:
     * Confirm acceptance modal
     * Auto-send confirmation to renter
     * Block calendar dates
     * Create rental agreement
   
   - Decline booking:
     * Select reason (required):
       - Dates not available
       - Vehicle under maintenance
       - Renter doesn't meet requirements
       - Other (specify)
     * Optional message to renter
     * Suggest alternative dates/vehicles

2. **Auto-Accept Settings**:
   - Toggle instant booking on/off per vehicle
   - Set criteria for auto-accept:
     * Minimum renter rating (e.g., 4.5★)
     * Minimum number of completed trips (e.g., 3)
     * Verified license required
     * Age requirement
   - If criteria met, booking auto-confirmed
```

#### 8.2 Active & Upcoming Bookings
```
PROMPT: Create active bookings management:

1. **Upcoming Bookings** (/src/app/host/bookings/upcoming/page.tsx):
   - List view or calendar view toggle
   - Each booking shows:
     * Countdown to pickup (e.g., "3 days")
     * Renter details
     * Vehicle
     * Pickup/return dates and times
     * Location
     * Status: Confirmed, Awaiting payment, Ready for pickup
   
   - Actions:
     * Message renter
     * Get directions to pickup location
     * Cancel booking (with penalties)
     * Modify booking (if renter agrees)
     * View booking details
     * Start trip (button appears on pickup day)
   
   - Reminders:
     * 24 hours before: "Prepare vehicle for [Renter]"
     * 2 hours before: "Renter will arrive soon"
     * At pickup time: "Renter should be arriving now"

2. **Active Trips** (/src/app/host/bookings/active/page.tsx):
   - Trips currently in progress
   - Show:
     * Days remaining
     * Expected return date/time
     * Current odometer (if renter reports)
     * Any issues reported
   
   - Actions:
     * Contact renter
     * Report issue
     * End trip (when returned)
   
   - Trip tracking (optional):
     * GPS location (with renter consent)
     * Geofencing alerts if vehicle leaves permitted area
```

#### 8.3 Completed & Cancelled Bookings
```
PROMPT: Create history views:

1. **Completed Bookings** (/src/app/host/bookings/completed/page.tsx):
   - Archive of past trips
   - Filters: date range, vehicle, renter
   - Search by renter name or booking ID
   - Each entry shows:
     * Dates
     * Renter
     * Vehicle
     * Earnings
     * Your rating of renter
     * Renter's rating of experience
   - Actions:
     * View details
     * Leave review (if not done)
     * Report issue (within 48 hours of return)
     * Download receipt

2. **Cancelled Bookings** (/src/app/host/bookings/cancelled/page.tsx):
   - List of cancelled bookings
   - Show:
     * Cancellation reason
     * Who cancelled (host or renter)
     * Cancellation date
     * Refund amount (if applicable)
     * Penalties applied
   - Filter by: cancelled by host, cancelled by renter, mutual cancellation
```

---

## TESTING & VALIDATION

### Final Phase 2 Tasks

```
PROMPT: Comprehensive testing of Phase 2 features:

1. **Vehicle Listing Tests**:
   - Complete full listing wizard from start to finish
   - Test each step's validation
   - Test save and resume later
   - Test quick list option
   - Verify all fields save correctly
   - Test on mobile and desktop

2. **Photo Management Tests**:
   - Upload single photo
   - Upload multiple photos (10+)
   - Test drag and reorder
   - Test photo editor (crop, rotate)
   - Test damage documentation
   - Verify photos display correctly in listing

3. **Document Upload Tests**:
   - Upload all required host documents
   - Upload renter documents
   - Test verification workflow
   - Test document rejection and re-upload
   - Verify secure access to documents

4. **Vehicle Editing Tests**:
   - Edit existing vehicle listing
   - Change pricing
   - Update availability
   - Edit photos
   - Verify changes reflect immediately

5. **Extras Tests**:
   - Host adds extras to vehicle
   - Renter selects extras during booking
   - Verify pricing calculations
   - Test custom extras

6. **Booking Management Tests**:
   - Create booking request
   - Host accepts booking
   - Host declines booking
   - Test instant booking
   - Verify calendar blocks correctly
   - Test booking modifications

7. **Agreement Tests**:
   - Generate rental agreement
   - Both parties sign
   - Verify PDF generation
   - Test pre-trip inspection
   - Test post-trip inspection
   - Compare inspection photos

8. **Host Dashboard Tests**:
   - Verify stats display correctly
   - Test real-time updates
   - Test notifications
   - Navigate all sidebar items
   - Test on mobile

Create detailed test reports and fix any issues before Phase 3.
```

---

## SUCCESS CRITERIA

Phase 2 is complete when:

- ✅ Hosts can list new vehicles through comprehensive wizard
- ✅ All Turo-standard features included in vehicle listing
- ✅ Photo upload and management works flawlessly
- ✅ Hosts can edit existing vehicles without issues
- ✅ Document upload system is secure and functional
- ✅ Rental agreements generate and sign correctly
- ✅ Inspection process works for pre and post-trip
- ✅ Extras system allows hosts to configure and renters to select
- ✅ Host dashboard provides all necessary tools and insights
- ✅ Booking management is intuitive and complete
- ✅ All features work on mobile and desktop
- ✅ No critical bugs or errors

---

## NEXT PHASE PREVIEW

Phase 3 will cover:
- Complete renter experience (search, booking flow)
- Payment processing & escrow
- Messaging system (host-renter communication)
- Notifications system (real-time alerts)
- Review and rating system
- Trip extensions and modifications
- Early returns and late returns

---

*Continue to Phase 3 document after completing and testing all Phase 2 features.*
