# ZEMO REBUILD - PHASE 2: BOOKING FLOW & VEHICLE PAGES

## Overview
This phase fixes critical issues with booking functionality, vehicle detail pages, and information display. Focus is on eliminating sample data, fixing 404 errors, and creating accordion-based information architecture for mobile.

---

## 1. BOOKING FLOW 404 FIX & COMPLETE REDESIGN

### Problem Analysis
Current issues:
- "Book Now" button leads to 404 page
- Route mismatch between vehicle detail and booking pages
- Missing booking confirmation page
- Sample data throughout booking flow
- No proper error handling

### Implementation Steps

#### 1.1 Fix Routing & Create Missing Pages
```
PROMPT: Fix all booking-related routing issues and create missing pages:

1. **Route Analysis & Fixes**:
   Current structure has conflicts:
   - Vehicle detail: `/vehicles/[id]/page.tsx`
   - Booking:Human: `/booking/[vehicleId]/page.tsx`
   
   The system should work, but check:
   - Vehicle detail page BookingWidget component
   - Verify router.push paths are correct
   - Ensure [vehicleId] param matches vehicle id format

2. **Fix BookingWidget** (/src/components/vehicles/BookingWidget.tsx):
   Update handleBookNow function:
   ```typescript
   const handleBookNow = () => {
     if (!startDate || !endDate) {
       // Show friendly modal, not alert()
       return;
     }
     
     // Correct route format
     const bookingUrl = `/booking/${vehicleId}?start=${startDate}&end=${endDate}&startTime=${startTime}&endTime=${endTime}`;
     router.push(bookingUrl);
   };
   ```

3. **Create Missing Confirmation Page** (/src/app/booking/[id]/confirmation/page.tsx):
   - Booking success page after payment
   - Show booking details
   - QR code for check-in
   - Download trip details (PDF)
   - "Message host" button
   - Add to calendar button
   - What's next section
   - Clear navigation to trip details

4. **Error Page for Invalid Bookings** (/src/app/booking/error.tsx):
   - Friendly error message
   - Reason for failure
   - "Try again" or "Contact support" buttons
   - Link back to vehicle or search

5. **API Route Verification**:
   - Ensure `/api/bookings` POST route exists and works
   - Validate request body properly
   - Return proper error codes (400, 401, 404, 500)
   - Log errors for debugging
```

#### 1.2 Complete Booking Flow Overhaul
```
PROMPT: Redesign the entire booking flow for exceptional UX:

1. **Booking Page Structure** (/src/app/booking/[vehicleId]/page.tsx):
   
   **Remove all sample/mock data:**
   - Fetch real vehicle data from API
   - Get real user data from session
   - Pull actual extras from database
   - Use real pricing calculations
   - No hardcoded values anywhere

   **Desktop Layout** (Current is good, enhance):
   - Left: Form in steps (2/3 width)
   - Right: Sticky booking summary (1/3 width)
   - Progress bar at top
   
   **Mobile Layout** (Needs complete redesign):
   - Full-screen steps (one per screen)
   - Fixed bottom bar with total + "Continue" button
   - Swipe between steps
   - Progress dots at top
   - Summary on final step only

2. **Step-by-Step Enhancement**:

   **Step 1: Trip Details**
   - Use the NEW calendar from Phase 1 (drag-select)
   - Don't make user re-enter dates (pre-fill from URL params)
   - Show unavailable dates from vehicle calendar
   - Real-time price calculation as dates change
   - Delivery options with real addresses
   - GPS location for delivery address
   - Saved addresses dropdown

   **Step 2: Protection & Extras**
   - Fetch real protection plans from database
   - Show actual coverage details (not sample data)
   - Fetch vehicle-specific extras from database
   - Allow quantity selection for extras
   - Show pricing for each extra
   - "Recommended" badge on popular items
   - Comparison table for protection plans
   - Modal with full T&C for each plan

   **Step 3: Driver Information**
   - Pre-fill from user profile if exists
   - License upload with preview
   - OCR scan of license for auto-fill
   - Expiry validation (must be > 6 months)
   - Age verification (must meet minimum)
   - Additional driver support
   - Save to profile checkbox

   **Step 4: Review & Payment**
   - Complete booking summary with all details
   - Editable (can go back to any step)
   - Terms acceptance with expandable sections
   - Payment method selection
   - "Book now" or "Request booking" button
   - Host response time indicator
   - Cancellation policy summary

3. **Real-Time Validation**:
   - Validate each field on blur
   - Show inline errors immediately
   - Prevent advancing with errors
   - Highlight required fields
   - API validation before payment
   - Check vehicle availability before proceeding

4. **Mobile-Specific Booking Flow**:
   - Each step takes full screen
   - Large touch targets (min 48px)
   - Bottom sticky bar always visible:
     * Left: Total price
     * Right: "Continue" button
   - Swipe or button navigation
   - Auto-save progress to localStorage
   - Resume from where left off
   - Exit confirmation if incomplete
   - Vertical progress indicator

5. **Error Handling**:
   - API failures: Show retry option
   - Network offline: Queue booking, sync later
   - Vehicle unavailable: Show similar vehicles
   - Payment failed: Allow different payment method
   - Validation errors: Clear, actionable messages
   - Timeout: Save progress, allow resume
```

#### 1.3 Payment Integration Enhancement
```
PROMPT: Create seamless payment experience:

1. **Payment Method Selection**:
   - Cards (Stripe/Flutterwave)
   - Mobile Money (MTN, Airtel, Zamtel)
   - Bank transfer (manual verification)
   - Saved payment methods
   - Add new payment method
   - Default payment method indicator

2. **Flutterwave Integration** (/src/lib/payments/flutterwave.ts):
   ```typescript
   export async function initiateFlutterwavePayment(bookingData) {
     // Create payment link
     // Support mobile money and cards
     // Handle webhooks properly
     // Update booking status
     // Send confirmations
   }
   ```

3. **Payment Flow**:
   - Show payment amount clearly
   - Security deposit separate
   - Itemized breakdown
   - Processing indicator
   - Redirect to provider (Flutterwave)
   - Handle return (success/failure)
   - Webhook confirmation
   - Email receipt
   - SMS confirmation (optional)

4. **Mobile Money Specific**:
   - Phone number input with validation
   - Network selection (MTN, Airtel, Zamtel)
   - Push notification to phone
   - "Complete payment on your phone" message
   - Countdown timer (5 minutes)
   - Manual verification option
   - Cancel and retry

5. **Security Deposit**:
   - Authorize but don't charge
   - Clear explanation of hold
   - Release timeline shown
   - Refund process explained
   - Damage deduction policy link
```

#### 1.4 Booking Confirmation & Post-Booking
```
PROMPT: Create exceptional post-booking experience:

1. **Confirmation Page** (/src/app/booking/[id]/confirmation/page.tsx):
   - Animated success checkmark
   - Booking reference number (large, copyable)
   - "What happens next" timeline
   - Trip details card (collapsible on mobile)
   - Host contact information
   - Message host button (start conversation)
   - Add to calendar (iCal/Google Calendar)
   - Download trip PDF
   - Share trip details
   - Cancellation policy reminder
   - Directions to pickup location (Google Maps link)

2. **Email Confirmation**:
   - Send immediately after booking
   - Include all trip details
   - Payment receipt attached
   - QR code for check-in
   - Host contact info
   - Cancellation link
   - Add to calendar button
   - PDF attachment

3. **Host Notification**:
   - Instant email to host
   - SMS notification (if enabled)
   - In-app notification
   - Booking details
   - Renter profile preview
   - Accept/reject buttons (if instant book off)
   - 24-hour response deadline

4. **Booking Status Tracking** (/src/app/bookings/[id]/page.tsx):
   - Status timeline view
   - Current status highlighted
   - Estimated times for each step
   - Push notifications for status changes
   - Actions available at each status:
     * Pending: Cancel, message host
     * Confirmed: View details, add extras, cancel
     * Active: Contact host, extend trip, report issue
     * Completed: Leave review, request refund

5. **Pre-Trip Reminders**:
   - 7 days before: Trip reminder + preparation checklist
   - 3 days before: Host contact reminder
   - 1 day before: Final reminder with pickup details
   - 3 hours before: "Get ready" notification
   - At pickup time: "Trip starting now"
```

---

## 2. VEHICLE DETAIL PAGE OVERHAUL

### Problem Analysis
Current issues:
- Contains sample/mock data instead of real information
- Too much information displayed without organization
- No accordion system for mobile
- Poor mobile UX
- Missing key information
- Sample reviews and similar vehicles

### Implementation Steps

#### 2.1 Remove All Sample Data
```
PROMPT: Eliminate every piece of sample data from vehicle detail page:

1. **Data Fetching** (/src/app/vehicles/[id]/page.tsx):
   - Fetch complete vehicle data from API
   - Fetch real host information
   - Get actual reviews from database
   - Pull genuine vehicle features
   - Retrieve real availability calendar
   - Get actual similar vehicles (by category + location)
   - Load real extras from database
   - Fetch actual insurance/protection options

2. **Remove Mock Data**:
   - Delete all mockReviews arrays
   - Remove mockSimilarVehicles
   - Eliminate hardcoded host data
   - Remove placeholder values
   - Delete fake availability data
   - Remove test extras
   - Clean up all TODO comments

3. **Empty State Handling**:
   If no data exists:
   - Reviews: "No reviews yet" with friendly message
   - Similar vehicles: Fetch by category, not hardcoded
   - Extras: "No extras available for this vehicle"
   - Photos: Show placeholder with upload prompt
   - Never show fake data

4. **API Endpoints Needed**:
   - GET /api/vehicles/[id] - Enhanced with all relations
   - GET /api/vehicles/[id]/reviews
   - GET /api/vehicles/[id]/availability
   - GET /api/vehicles/[id]/extras
   - GET /api/vehicles/similar?vehicleId=[id]
   - GET /api/vehicles/[id]/host-info
```

#### 2.2 Information Architecture with Accordions
```
PROMPT: Reorganize vehicle information using accordion system for clean mobile UX:

1. **Information Sections** (/src/components/vehicles/):
   
   **Always Visible (Top of Page)**:
   - Hero image gallery
   - Vehicle name and year
   - Star rating + trip count
   - Price per day (prominent)
   - Location (city)
   - Instant booking badge
   - Host avatar and name
   - Quick specs (transmission, fuel, seats)

   **Accordion Sections** (Expandable on mobile, always open on desktop):

   a) **Vehicle Details** (VehicleDetailsAccordion.tsx)
      - Make, model, year
      - Transmission, fuel type
      - Seating capacity, doors
      - Color, plate number
      - Mileage, VIN (if public)
      - Expand/collapse on mobile
      - Always expanded on desktop

   b) **Description** (DescriptionAccordion.tsx)
      - Host's description
      - Read more/less for long text
      - Expandable on all devices
      - Well-formatted with paragraphs

   c) **Features & Amenities** (FeaturesAccordion.tsx)
      - Grid of feature icons
      - Grouped by category:
        * Safety (ABS, airbags, etc.)
        * Comfort (AC, heated seats, etc.)
        * Technology (Bluetooth, GPS, etc.)
        * Convenience (USB ports, etc.)
      - Expandable on mobile

   d) **Location & Delivery** (LocationAccordion.tsx)
      - Map showing approximate location
      - Exact address (after booking)
      - Delivery options and fees
      - Delivery radius
      - Airport pickup available
      - Expandable with map

   e) **Availability** (AvailabilityAccordion.tsx)
      - Calendar showing available dates
      - Minimum/maximum trip length
      - Advance notice required
      - Instant booking availability
      - Expandable calendar view

   f) **Protection & Insurance** (ProtectionAccordion.tsx)
      - Available protection plans
      - Coverage details
      - Deductibles
      - What's included/excluded
      - Comparison table
      - Expandable on all devices

   g) **Extras & Add-ons** (ExtrasAccordion.tsx)
      - Available extras with images
      - Pricing per item
      - Add to booking feature
      - Quantity selectors
      - Expandable list

   h) **Rules & Requirements** (RulesAccordion.tsx)
      - Minimum age
      - License requirements
      - Security deposit
      - Fuel policy
      - Smoking/pets policy
      - Mileage limits
      - Late return fees
      - Expandable list

   i) **Cancellation Policy** (CancellationAccordion.tsx)
      - Policy type (flexible, moderate, strict)
      - Refund schedule
      - Cancellation deadlines
      - Examples with amounts
      - Expandable details

   j) **Reviews & Ratings** (ReviewsAccordion.tsx)
      - Overall rating breakdown
      - Category ratings (cleanliness, communication, etc.)
      - Recent reviews
      - "See all reviews" button
      - Expandable list

   k) **Host Information** (HostAccordion.tsx)
      - Host profile and photo
      - Joined date
      - Response time/rate
      - Total vehicles
      - Total trips
      - Verification badges
      - "Message host" button
      - Expandable on mobile

2. **Accordion Component** (/src/components/ui/Accordion.tsx):
   ```typescript
   interface AccordionProps {
     title: string;
     badge?: string; // e.g., "Required" or count
     icon?: ReactNode;
     children: ReactNode;
     defaultOpen?: boolean;
     alwaysOpen?: boolean; // For desktop
     onToggle?: (isOpen: boolean) => void;
   }
   ```

   Features:
   - Smooth expand/collapse animation
   - Chevron rotation indicator
   - Click anywhere on header to toggle
   - Keyboard accessible (Enter/Space)
   - ARIA attributes for screen readers
   - Remember state in session (optional)

3. **Responsive Behavior**:
   - **Mobile (< 768px)**:
     * All accordions start collapsed
     * User expands what they need
     * Smooth animations
     * Large tap targets
     * Chevron indicates state
   
   - **Desktop (≥ 768px)**:
     * Most accordions start expanded
     * Collapse available but not necessary
     * More comfortable to read
     * Side-by-side layout possible

4. **Implementation**:
   - Replace existing sections with accordion components
   - Group related information logically
   - Use consistent styling
   - Add icons to headers for visual appeal
   - Include badge indicators (e.g., "3 extras")
   - Smooth transitions (300ms)
   - Test on all devices
```

#### 2.3 Enhanced Photo Gallery
```
PROMPT: Create professional photo gallery for vehicle detail page:

1. **Gallery Features** (/src/components/vehicles/PhotoGallery.tsx):
   - Main image (large, prominent)
   - Thumbnail strip below (horizontal scroll)
   - Click thumbnail to change main image
   - "View all photos" button opens lightbox
   - Photo counter: "3 of 15"
   - Swipe gestures on mobile
   - Zoom on double-tap/click
   - Smooth transitions

2. **Lightbox Mode**:
   - Full-screen overlay
   - Swipe to navigate
   - Arrow keys on desktop
   - Close button (top-right)
   - Photo counter (bottom-center)
   - Download button
   - Share button
   - Thumbnail strip at bottom
   - Zoom in/out controls
   - Dark background with blur

3. **Photo Categories**:
   - Filter by type:
     * All photos
     * Exterior
     * Interior
     * Dashboard
     * Features
   - Tab navigation above thumbnails
   - Badge count for each category

4. **Loading & Performance**:
   - Lazy load thumbnails
   - Progressive loading for main image
   - Blur placeholder
   - Next.js Image optimization
   - Prefetch next image on hover
   - WebP with JPEG fallback

5. **Mobile Optimizations**:
   - Full-width images
   - Snap scrolling for thumbnails
   - Pinch to zoom
   - Double-tap to zoom
   - Momentum scrolling
   - Pull to refresh (exits lightbox)
```

#### 2.4 Booking Widget Enhancement
```
PROMPT: Redesign the sticky booking widget for better conversion:

1. **Widget Layout** (/src/components/vehicles/BookingWidget.tsx):
   - Card with shadow and border
   - Sticky positioning (stays visible on scroll)
   - Desktop: Right sidebar (1/3 width)
   - Mobile: Fixed bottom bar (compact)

2. **Content Structure**:
   **Desktop Widget**:
   - Price per day (large, bold)
   - Rating + trip count
   - Date inputs (start/end)
   - Time selectors
   - "Calculate total" button
   - Breakdown (if dates selected):
     * Days × daily rate
     * Service fee
     * Taxes
     * Total (bold)
   - Security deposit info
   - "Book now" or "Request to book" button (large)
   - "Message host" link
   - Free cancellation badge

   **Mobile Bottom Bar**:
   - Compact view:
     * Price + "Book now" button only
   - Tap to expand full booking form
   - Full-screen modal with all fields
   - Sticky at bottom always

3. **Smart Features**:
   - Auto-calculate when dates change
   - Show weekly/monthly discounts
   - Highlight instant booking
   - Show "Few left" for high demand
   - "Best price guarantee" badge
   - Real-time availability check
   - Disable book button if unavailable

4. **Mobile Booking Button**:
   - Always visible at bottom
   - Large and colorful (yellow)
   - Shows price dynamically
   - Tap opens booking modal
   - Cannot be missed

5. **Error Handling**:
   - Vehicle unavailable: Show message + similar vehicles
   - Dates invalid: Clear error message
   - Minimum trip not met: Explain minimum
   - Maximum exceeded: Offer to split
```

---

## 3. VEHICLE LISTING & MANAGEMENT FOR HOSTS

### Implementation Steps

#### 3.1 Vehicle Photo Upload Enhancement
```
PROMPT: Create professional photo upload system for hosts:

1. **Photo Upload Page** (/src/app/host/vehicles/[id]/photos/page.tsx):
   - Drag-and-drop area (large)
   - Click to browse
   - Upload up to 20 photos
   - Real-time upload progress
   - Set primary photo
   - Reorder photos by dragging
   - Delete photos
   - Crop and rotate tools
   - Photo guidelines shown:
     * Take photos in good lighting
     * Clean vehicle before photos
     * Show all angles
     * Include interior shots
     * Avoid filters

2. **Photo Categories**:
   - Require specific shots:
     * Front exterior (required)
     * Rear exterior (required)
     * Both sides (required)
     * Interior front
     * Interior rear
     * Dashboard
     * Trunk/boot
   - Guide users to complete all
   - Check marks when category filled
   - Progress indicator

3. **Image Optimization**:
   - Client-side resize (max 2000px)
   - Compress to 85% quality
   - Convert to WebP
   - Maintain EXIF orientation
   - Generate thumbnails
   - Upload to Supabase Storage
   - Store URLs in database

4. **Professional Mode**:
   - "Get professional photos" CTA
   - Connect with photographers
   - Schedule photo session
   - Premium listing benefit
   - Before/after comparison
```

#### 3.2 Extras & Add-ons Management
```
PROMPT: Allow hosts to create and manage vehicle extras:

1. **Extras Management Page** (/src/app/host/vehicles/[id]/extras/page.tsx):
   - List of current extras
   - Add new extra button
   - Edit existing extras
   - Enable/disable extras
   - Set pricing per item
   - Set quantity available
   - Upload extra photo (optional)

2. **Common Extras Library**:
   - Predefined extras with icons:
     * Child seat ($5/day)
     * GPS navigation ($3/day)
     * WiFi hotspot ($4/day)
     * Additional driver ($10/day)
     * Ski rack ($3/day)
     * Bike rack ($3/day)
     * Snow chains ($5/trip)
   - One-click to add
   - Customize pricing

3. **Custom Extras**:
   - Hosts can create custom extras
   - Name, description, price
   - Per-day, per-trip, or per-km pricing
   - Photo upload
   - Quantity limits
   - Approval required for unusual extras

4. **Extras Display**:
   - Show on vehicle detail page
   - Available during booking
   - Icons for common items
   - Photos for custom items
   - Clear pricing
```

---

## 4. DOCUMENTATION & VERIFICATION SYSTEM

### Implementation Steps

#### 4.1 Host Document Upload & Verification
```
PROMPT: Streamline document upload for hosts and renters:

1. **Required Documents for Hosts**:
   - Vehicle registration (logbook)
   - Insurance certificate
   - Road tax receipt
   - Vehicle inspection certificate
   - Host ID (national ID or passport)
   - Proof of address

2. **Document Upload Flow** (/src/app/host/verification/page.tsx):
   - Document type selector
   - Upload area (drag-and-drop)
   - Camera capture on mobile
   - OCR scan for auto-extraction
   - Preview before upload
   - Expiry date input
   - Document number input
   - Submit for verification

3. **Verification Process**:
   - Auto-verify with OCR when possible
   - Manual admin review if needed
   - Verification badges on profile
   - Email notification on approval/rejection
   - Resubmit if rejected

4. **Renter Documents**:
   - Driver's license (required)
   - National ID or passport
   - Proof of address
   - Profile photo
   - Upload during onboarding or first booking

5. **Security**:
   - Encrypted storage
   - Access control (only owner and admins)
   - Auto-delete after vehicle delisted
   - Audit log of access
```

---

## 5. BOOKING MODIFICATIONS & FLEXIBILITY

### Implementation Steps

#### 5.1 Trip Extensions
```
PROMPT: Allow renters to extend active trips:

1. **Extension Request** (/src/app/bookings/[id]/extend/page.tsx):
   - Current trip dates shown
   - New end date selector
   - Additional days calculated
   - Updated price breakdown
   - "Request extension" button
   - Message to host (optional)

2. **Host Approval Flow**:
   - Notification to host
   - Accept/decline buttons
   - Check vehicle availability
   - Update booking if approved
   - Charge additional amount
   - Update calendar

3. **Automatic Extension** (if instant book enabled):
   - Check availability automatically
   - Charge card on file
   - Confirm immediately
   - Notify host
```

#### 5.2 Early Returns
```
PROMPT: Handle early trip returns with refund calculation:

1. **Early Return Process**:
   - "End trip early" button
   - Actual return date selector
   - Refund calculation based on policy
   - Submit request
   - Wait for host confirmation

2. **Refund Policy**:
   - Full refund for unused days (if >48h notice)
   - Partial refund (50%) if 24-48h notice
   - No refund if <24h notice
   - Service fee non-refundable
   - Clear explanation shown

3. **Process**:
   - Calculate refund amount
   - Release security deposit
   - Process refund
   - Update booking status
   - Request review from both parties
```

---

## TESTING & VALIDATION

### Phase 2 Checklist

```
1. **Booking Flow**:
   ✅ "Book Now" button works (no 404)
   ✅ All sample data removed
   ✅ Real data displayed throughout
   ✅ Payment integration works
   ✅ Confirmation page functional
   ✅ Email confirmations sent
   ✅ Mobile flow smooth and intuitive

2. **Vehicle Detail Page**:
   ✅ No sample/mock data anywhere
   ✅ Accordion system works on mobile
   ✅ All information organized logically
   ✅ Photo gallery professional
   ✅ Booking widget sticky and functional
   ✅ Similar vehicles are real
   ✅ Reviews are genuine

3. **Vehicle Management**:
   ✅ Photo upload works perfectly
   ✅ Can set primary photo
   ✅ Extras management functional
   ✅ Document upload smooth

4. **Documentation**:
   ✅ Host verification works
   ✅ Renter verification works
   ✅ OCR extraction functional
   ✅ Security measures in place

5. **Modifications**:
   ✅ Trip extensions work
   ✅ Early returns handled
   ✅ Refund calculations correct

Test on:
- Multiple vehicles
- Different user types
- Various payment methods
- Mobile and desktop
- Different network conditions
```

---

## SUCCESS CRITERIA

Phase 2 is complete when:

- ✅ Booking flow works end-to-end (no 404 errors)
- ✅ All sample data removed from vehicle pages
- ✅ Accordion system makes mobile UX clean
- ✅ Payment integration functional
- ✅ Confirmation and email system works
- ✅ Vehicle management streamlined for hosts
- ✅ Documentation system secure and efficient
- ✅ Mobile booking experience exceptional
- ✅ Photo gallery professional quality
- ✅ Information organized and accessible
- ✅ Real-time availability checks working
- ✅ All Phase 2 tests passing

---

*This document builds on Phase 1 and should be given to the AI coding agent section by section.*
