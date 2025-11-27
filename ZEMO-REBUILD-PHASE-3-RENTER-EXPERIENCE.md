# ZEMO REBUILD - PHASE 3: RENTER EXPERIENCE & BOOKING SYSTEM

## Overview
This phase creates a seamless renter experience including search, booking flow, payment processing, messaging, and reviews - all matching Turo's industry standards.

---

## 1. ADVANCED SEARCH SYSTEM

### Goal
Powerful, fast search with filters matching Turo's search capabilities.

### Implementation Steps

#### 1.1 Search Interface Enhancement
```
PROMPT: Create an advanced search system for ZEMO:

1. **Main Search Component** (/src/components/search/SearchBar.tsx):
   
   **Search Bar** (used on homepage and header):
   - Three-section pill design:
     * Section 1: Location
       - Input with autocomplete
       - Detect current location option
       - Popular locations dropdown
       - Show: "Lusaka, Zambia" format
     
     * Section 2: Dates
       - Date range picker
       - Show: "Dec 1 - Dec 5"
       - Calendar dropdown
       - Quick options: "Today", "Tomorrow", "This weekend", "Next week"
       - Min/max date validation
     
     * Section 3: Time
       - Pickup time
       - Return time
       - Default: 10:00 AM
       - Dropdown with 30-min intervals
   
   - Large "Search" button (yellow/primary)
   - Click any section to expand and edit
   - Show errors inline (e.g., "Return must be after pickup")

2. **Search Results Page** (/src/app/search/page.tsx):
   
   **Layout**:
   - Sidebar filters (left, 320px wide)
   - Results grid (right, remaining space)
   - Top bar: search summary + sort options + map view toggle
   - Mobile: filters in drawer/modal

   **Search Summary Bar**:
   - "150 cars available in Lusaka"
   - "Dec 1, 10:00 AM - Dec 5, 10:00 AM"
   - Edit search button
   - View mode: Grid | List | Map

   **Filters Sidebar**:
   - Price Range:
     * Slider: ZMW 0 - ZMW 5000/day
     * Show number of cars at current range
   
   - Vehicle Type (checkboxes with counts):
     * Economy (45)
     * Compact (38)
     * Midsize (52)
     * SUV (67)
     * Luxury (23)
     * Sports (12)
     * Van (15)
     * Truck (8)
   
   - Make (searchable dropdown):
     * Toyota (89)
     * Honda (45)
     * Nissan (34)
     * etc.
   
   - Year Range:
     * Slider: 2000 - 2024
   
   - Features (checkboxes):
     * Air conditioning
     * Bluetooth
     * Backup camera
     * GPS
     * All-wheel drive
     * Automatic transmission
     * Manual transmission
   
   - Instant Booking:
     * Toggle to show only instant book vehicles
   
   - Host Rating:
     * Slider: 4.0★ - 5.0★
   
   - Delivery Available:
     * Checkbox for vehicles with delivery
   
   - Seating Capacity:
     * 2, 4, 5, 7, 9 seats (checkboxes)
   
   - Fuel Type:
     * Petrol, Diesel, Electric, Hybrid
   
   - Clear all filters button

   **Results Grid**:
   - 3 columns on desktop, 2 on tablet, 1 on mobile
   - Each vehicle card:
     * Main photo (hover to see more photos carousel)
     * Instant book badge (if applicable)
     * Host verification badge
     * Vehicle name: "2020 Toyota Corolla"
     * Rating: 4.8★ (125 trips)
     * Price: "ZMW 350/day"
     * Location: "Lusaka, 2.5 km away"
     * Key features icons: Auto, AC, 5 seats
     * "Superhost" badge (if applicable)
     * Heart icon to add to favorites
   
   - Pagination: 24 vehicles per page
   - Infinite scroll option
   - Load more button

   **Sort Options** (dropdown):
   - Recommended (default - by relevance + rating)
   - Lowest price
   - Highest price
   - Distance (nearest first)
   - Highest rated
   - Most popular (most booked)
   - Newest listings

3. **Map View** (/src/components/search/MapView.tsx):
   - Full-screen map with vehicle pins
   - Cluster markers when zoomed out
   - Click marker to show vehicle card popup
   - Filters apply to map view
   - Map updates as you pan/zoom
   - "Search this area" button when map moves
   - Use Google Maps or Mapbox

4. **Search API** (/src/app/api/search/vehicles/route.ts):
   - Query parameters:
     * location (coordinates or city name)
     * startDate, endDate, startTime, endTime
     * minPrice, maxPrice
     * vehicleTypes[] (array)
     * makes[] (array)
     * minYear, maxYear
     * features[] (array)
     * instantBook (boolean)
     * minRating
     * hasDelivery
     * seats
     * fuelType
     * transmission
     * sortBy
     * page, limit
   
   - Response:
     * vehicles[] array
     * totalCount
     * page, totalPages
     * filters (with counts for each option)
   
   - Performance:
     * Use database indexes on commonly filtered fields
     * Cache popular searches for 5 minutes
     * Elasticsearch or similar for full-text search (optional)

5. **Saved Searches**:
   - "Save this search" button
   - Get email alerts when new vehicles match
   - Manage saved searches in profile

6. **Recent Searches**:
   - Store in localStorage
   - Show recent searches when clicking search bar
   - Quick access to past searches
```

#### 1.2 Search Autocomplete & Location Services
```
PROMPT: Implement location search and autocomplete:

1. **Location Autocomplete**:
   - Integrate Google Places API or similar
   - As user types, show suggestions:
     * Cities
     * Neighborhoods
     * Landmarks
     * Airports
   - Select location to get coordinates
   - Geocode coordinates for search

2. **Detect Current Location**:
   - "Use current location" button
   - Request browser geolocation permission
   - Convert coordinates to readable address
   - Auto-populate search

3. **Popular Locations**:
   - Hardcoded list of popular areas:
     * Lusaka City Center
     * Lusaka Airport
     * Kitwe
     * Ndola
     * Livingstone
   - Quick select these locations
```

---

## 2. VEHICLE DETAIL PAGE

### Goal
Comprehensive vehicle detail page that helps renters make informed decisions.

### Implementation Steps

#### 2.1 Vehicle Detail Page Structure
```
PROMPT: Create a detailed vehicle page matching Turo's design:

1. **Vehicle Detail Page** (/src/app/vehicles/[id]/page.tsx):

   **Hero Section** (top):
   - Large photo gallery:
     * Main photo (large, 70% width)
     * Grid of 4 smaller photos (30% width, 2x2)
     * "View all photos" button overlay on last photo (shows count)
     * Click to open full-screen gallery with navigation
   - Sticky sidebar (on desktop):
     * Daily rate (large): "ZMW 350/day"
     * Total cost calculator
     * Dates selector (pre-filled from search)
     * Guests counter (not applicable for cars, maybe passengers)
     * "Request to book" or "Book instantly" button
     * "This car is usually booked"notification (if popular)
     * Free cancellation notice

   **Vehicle Title & Quick Info**:
   - Vehicle name: "2020 Toyota Corolla"
   - Rating: 4.8★ (125 trips)
   - Location: "Lusaka, Zambia"
   - Instant book badge (if applicable)
   - Share button (copy link, Facebook, Twitter)
   - Save to favorites (heart icon)

   **Tabs/Sections**:
   
   **Section 1: Overview**
   - Description (from host)
   - Key details grid:
     * Vehicle type: SUV
     * Transmission: Automatic
     * Fuel type: Petrol
     * Seats: 5
     * Doors: 4
     * MPG: 35 (if available)
   - Guidelines:
     * Mileage: 200 km/day included
     * Extra mileage: ZMW 5/km
     * Fuel policy: Return with same level
   
   **Section 2: Features**
   - All features with icons:
     * Air conditioning
     * Bluetooth/AUX
     * Backup camera
     * GPS
     * USB charger
     * All-wheel drive
     * etc.
   - Grouped by category:
     * Convenience
     * Safety
     * Entertainment
     * Other

   **Section 3: Insurance & Protection**
   - Available protection plans:
     * Basic (included)
     * Standard (+ZMW 50/day)
     * Premium (+ZMW 100/day)
   - What's covered in each plan
   - Security deposit amount: ZMW 2000

   **Section 4: Extras Available**
   - List of extras host offers:
     * GPS Device: +ZMW 20/day
     * Child seat: +ZMW 30/day
     * Additional driver: +ZMW 40/day
     * etc.
   - Selected during booking

   **Section 5: Hosted by [Name]**
   - Host profile section:
     * Photo
     * Name
     * "Joined in [Year]"
     * Rating: 4.9★ (345 reviews)
     * Response time: "Within 1 hour"
     * Response rate: 95%
     * "Superhost" badge (if applicable)
   - Host stats:
     * 127 vehicles
     * 1,234 trips
     * Typical response time
   - "Message host" button
   - "View profile" link
   - Languages spoken
   - Host verification badges

   **Section 6: Location**
   - Map showing general area (not exact address)
   - "Exact location provided after booking"
   - Nearby landmarks
   - Distance from popular locations:
     * Lusaka Airport: 12 km
     * City Center: 5 km

   **Section 7: Availability**
   - Calendar showing available/unavailable dates
   - Min/max trip duration
   - Advance notice required
   - Custom pricing by date (if host set)

   **Section 8: Rules & Requirements**
   - Minimum age: 25
   - Minimum driving experience: 3 years
   - Valid driver's license required
   - Additional driver fees
   - No smoking policy
   - Pet policy
   - Host's custom rules

   **Section 9: Cancellation Policy**
   - Explanation of cancellation terms:
     * Free cancellation up to 24 hours before trip
     * 50% refund if cancelled within 24 hours
     * No refund if cancelled after trip starts
   - Link to full cancellation policy

   **Section 10: Reviews** (if reviews exist)
   - Overall rating breakdown:
     * Cleanliness: 4.9★
     * Communication: 4.8★
     * Convenience: 4.7★
     * Accuracy: 4.9★
   - Review cards (show 6, paginated):
     * Renter photo and name
     * Rating (stars)
     * Date of trip
     * Review text
     * Host response (if any)
   - "Show all reviews" button

   **Section 11: Similar Vehicles**
   - Carousel of similar vehicles:
     * Same location
     * Similar price
     * Similar type
   - "See more like this" link

   **Bottom CTA**:
   - Sticky mobile booking bar:
     * Price + "Request to book" button
     * Always visible when scrolling

2. **Photo Gallery Modal**:
   - Full-screen lightbox
   - Navigate with arrows or swipe
   - Show photo captions
   - Thumbnail strip at bottom
   - Close button (X)
   - Zoom option
   - Photo counter: "3 of 15"

3. **Booking Widget (Sidebar)**:
   - Price: ZMW 350/day
   - Dates input (with calendar popup)
   - Time selectors
   - Trip calculator:
     * X days at ZMW 350: ZMW 2,450
     * Weekly discount (20%): -ZMW 490
     * Service fee: ZMW 245
     * Total: ZMW 2,205
   - "Request to book" button (if manual approval)
   - "Book instantly" button (if instant booking)
   - "Free cancellation for 48 hours"
   - "Report this listing" link

4. **Mobile Optimization**:
   - Single column layout
   - Booking widget moves to bottom (sticky)
   - Collapsible sections
   - Touch-friendly buttons
   - Swipeable photo gallery
```

---

## 3. BOOKING FLOW

### Goal
Seamless, secure booking process from selection to confirmation.

### Implementation Steps

#### 3.1 Request to Book / Book Instantly
```
PROMPT: Implement complete booking flow:

1. **Booking Flow Start** (/src/app/vehicles/[id]/book/page.tsx):
   
   **Step 1: Confirm Details**
   - Show vehicle summary card:
     * Photo
     * Name
     * Location
     * Dates and times
     * Pickup location
   - Edit dates/times if needed
   - Delivery option:
     * Pick up at host location (free)
     * Delivery to your location (+ZMW X)
     * Airport delivery (+ZMW Y)
     * Enter delivery address if selected
   
   **Step 2: Select Extras**
   - List all available extras (from Phase 2)
   - Checkboxes to add/remove
   - Quantity selectors where applicable
   - Running total updates

   **Step 3: Select Protection Plan**
   - Show available insurance options:
     * Basic (included): Coverage up to ZMW 50,000
     * Standard (+ZMW 50/day): Coverage up to ZMW 200,000
     * Premium (+ZMW 100/day): Full coverage
   - Details of what each plan covers
   - Radio button selection
   - Security deposit amount shown

   **Step 4: Verify Your Profile**
   - Must be logged in (redirect to login if not)
   - Show verification status:
     * Driver's license: ✅ Verified or ⚠️ Upload required
     * Phone number: ✅ Verified or ⚠️ Verify now
     * Email: ✅ Verified
     * Profile photo: ✅ or ⚠️ Add photo
   - "Add driver's license" button if not verified
   - Quick upload modal

   **Step 5: Payment Method**
   - Select payment method:
     * Credit/Debit Card (Stripe/Flutterwave)
     * Mobile Money (MTN, Airtel)
     * Bank transfer
   - Add new card form:
     * Card number
     * Expiry date
     * CVV
     * Cardholder name
     * Billing address
   - Save card for future bookings (optional)
   - Show saved cards if any
   - Secure payment badges (SSL, PCI compliant)

   **Step 6: Review & Book**
   - Final summary:
     * Vehicle details
     * Dates and times
     * Extras selected
     * Protection plan
     * Price breakdown:
       - Base price (X days × ZMW Y)
       - Extras: ZMW Z
       - Protection plan: ZMW A
       - Delivery fee: ZMW B
       - Service fee (10%): ZMW C
       - Tax: ZMW D
       - Total: ZMW XXXX
     * Security deposit: ZMW 2000 (held, released after trip)
   
   - Message to host (optional):
     * "Tell the host about your trip"
     * Textarea (500 char limit)
   
   - Cancellation policy reminder
   
   - Agreements:
     * ☐ I agree to the Terms of Service
     * ☐ I agree to the Cancellation Policy
     * ☐ I acknowledge the vehicle rules
   
   - "Request to Book" button (if manual approval)
     * OR "Confirm and Pay" button (if instant booking)
   
   - "By clicking [button], you agree to pay the total amount shown"

2. **Payment Processing**:
   - Show loading spinner
   - Process payment via Stripe or Flutterwave
   - Hold security deposit separately
   - Create booking in database
   - If manual approval: status = PENDING
   - If instant book: status = CONFIRMED
   - Send confirmation emails
   - Redirect to confirmation page

3. **Booking Confirmation Page** (/src/app/bookings/[id]/confirmation/page.tsx):
   - Success message: "Your booking is confirmed!" or "Booking request sent!"
   - Booking details:
     * Confirmation number: #ZEMO-12345
     * Vehicle details
     * Dates and times
     * Pickup location
     * Host contact info
   - Next steps:
     * "The host will respond within 24 hours" (if pending)
     * "Check your email for confirmation" (if confirmed)
     * "Download the ZEMO app to stay updated"
   - Actions:
     * "Message host"
     * "Add to calendar" (iCal export)
     * "View booking details"
     * "Continue browsing"
   - Booking receipt (printable/downloadable PDF)
```

#### 3.2 Payment Integration
```
PROMPT: Implement secure payment processing:

1. **Payment Provider Integration**:
   - PRIMARY: Flutterwave (for Zambian payments)
     * Install: npm install flutterwave-node-v3
     * Support: Cards, Mobile Money (MTN, Airtel), Bank transfer
   - SECONDARY: Stripe (for international payments)
     * Install: npm install @stripe/stripe-js stripe
     * Support: International credit/debit cards

2. **Payment API Routes**:
   
   **/api/payments/create-payment-intent** (POST):
   - Input: bookingId, paymentMethodType
   - Create payment intent with Flutterwave/Stripe
   - Amount: total booking cost
   - Store payment intent ID with booking
   - Return: clientSecret for frontend

   **/api/payments/create-deposit-intent** (POST):
   - Separate payment for security deposit
   - Hold amount (not charge)
   - Release after 7 days or after trip inspection

   **/api/payments/confirm** (POST):
   - Input: bookingId, paymentIntentId
   - Verify payment successful
   - Update booking status to PAID
   - Trigger confirmation emails
   - Start escrow hold (don't pay host yet)

   **/api/payments/refund** (POST):
   - Handle cancellations
   - Calculate refund amount based on cancellation policy
   - Process refund via payment provider
   - Update booking status

3. **Escrow System**:
   - Hold payment for 24 hours after trip starts
   - Release to host after:
     * Trip completed successfully
     * Post-trip inspection shows no issues
     * No disputes filed
   - Automatic payout on day after trip ends
   - Manual hold if dispute raised

4. **Security Deposit**:
   - Pre-authorize (hold) security deposit
   - Don't charge unless damage occurs
   - Release hold after:
     * Post-trip inspection passed
     * No damage claims
     * 48 hours after trip ends (buffer)
   - If damage claim: charge full or partial amount

5. **Payment Webhooks**:
   - Listen for payment events from providers
   - Handle: payment.succeeded, payment.failed, refund.processed
   - Update booking status accordingly
   - Send notifications to users

6. **Mobile Money Integration**:
   - Flutterwave mobile money for Zambian users
   - Support MTN and Airtel
   - User enters phone number
   - Receives prompt to complete payment
   - Webhook confirms payment

7. **Payment Security**:
   - Never store credit card details (use tokenization)
   - PCI DSS compliance
   - Secure webhooks (verify signatures)
   - Fraud detection (flag suspicious transactions)
   - 3D Secure for card payments
```

---

## 4. MESSAGING SYSTEM

### Goal
Real-time messaging between hosts and renters, similar to Turo's inbox.

### Implementation Steps

#### 4.1 Messaging Architecture
```
PROMPT: Build a comprehensive messaging system:

1. **Database Schema**:
   ```prisma
   model Conversation {
     id          String    @id @default(cuid())
     bookingId   String    @unique
     booking     Booking   @relation(fields: [bookingId], references: [id])
     hostId      String
     host        User      @relation("HostConversations", fields: [hostId], references: [id])
     renterId    String
     renter      User      @relation("RenterConversations", fields: [renterId], references: [id])
     messages    Message[]
     createdAt   DateTime  @default(now())
     updatedAt   DateTime  @updatedAt
   }

   model Message {
     id              String       @id @default(cuid())
     conversationId  String
     conversation    Conversation @relation(fields: [conversationId], references: [id])
     senderId        String
     sender          User         @relation(fields: [senderId], references: [id])
     content         String       @db.Text
     type            MessageType  @default(TEXT)
     attachments     String[]     // URLs to images/files
     readAt          DateTime?
     createdAt       DateTime     @default(now())
   }

   enum MessageType {
     TEXT
     IMAGE
     DOCUMENT
     SYSTEM  // Auto-generated messages (booking confirmed, etc.)
   }
   ```

2. **Messages Inbox** (/src/app/messages/page.tsx):
   
   **Layout**:
   - Two-column layout (desktop)
     * Left: Conversations list (320px)
     * Right: Active conversation (remaining width)
   - Mobile: Show one at a time

   **Conversations List** (left column):
   - Search conversations
   - Filter: All, Unread, Hosts, Renters
   - Each conversation item:
     * Other party's avatar
     * Name
     * Vehicle name (small text)
     * Last message preview (truncated)
     * Timestamp: "2h ago" or date
     * Unread badge (number of unread messages)
     * Highlighted if unread
   - Sort by: Most recent first
   - Load more on scroll

   **Conversation View** (right column):
   - Header:
     * Other party's avatar and name
     * Vehicle name and photo (small)
     * "View booking details" button
     * Options menu (mute, report, block)
   
   - Message thread:
     * Messages in chronological order
     * Own messages: right side, yellow background
     * Other party's messages: left side, gray background
     * Message bubbles with:
       - Content
       - Attachments (images inline, files as links)
       - Timestamp
       - Read status (checkmarks)
     * System messages: centered, gray text
       - "Booking confirmed"
       - "Trip started"
       - "Trip ended"
     * Date dividers: "Today", "Yesterday", "Dec 15"
   
   - Message input (bottom):
     * Textarea with auto-grow
     * Placeholder: "Send a message..."
     * Attachment button (image, document)
     * Send button
     * Character counter (max 2000 chars)
     * "Press Enter to send, Shift+Enter for new line"

3. **Real-Time Messaging**:
   - Use WebSocket or Server-Sent Events
   - Or use polling (every 5 seconds) as fallback
   - New message appears instantly in thread
   - Conversation moves to top of list
   - Show typing indicator: "[Name] is typing..."
   - Sound notification on new message
   - Browser notification if tab not focused

4. **Message Composer** (/src/components/messaging/MessageComposer.tsx):
   - Rich text input (basic formatting)
   - Emoji picker
   - File upload:
     * Click to upload or drag and drop
     * Image preview before sending
     * Max 10MB per file
     * Accept: images, PDFs
   - Quick replies (for hosts):
     * "Thanks for booking!"
     * "Pickup at [location]"
     * "Available anytime"
   - Voice message (optional, future feature)

5. **Messaging API Routes**:
   
   **/api/messages/conversations** (GET):
   - List all conversations for current user
   - Include: last message, unread count, participants

   **/api/messages/conversations/[id]** (GET):
   - Get all messages in a conversation
   - Paginated (50 messages per page)
   - Mark messages as read when fetched

   **/api/messages** (POST):
   - Send new message
   - Input: conversationId, content, type, attachments
   - Create message in database
   - Send push notification to recipient
   - Send email if recipient not active

   **/api/messages/[id]/read** (PUT):
   - Mark message(s) as read
   - Update readAt timestamp

6. **Message Notifications**:
   - Browser push notification
   - Email notification (if not read within 1 hour)
   - SMS notification (optional, for urgent messages)
   - In-app notification badge (unread count)
```

#### 4.2 Pre-Booking Inquiries
```
PROMPT: Allow renters to message hosts before booking:

1. **Contact Host Button**:
   - On vehicle detail page
   - "Message host" button
   - Opens message modal if not logged in → prompt to login
   - Opens conversation if logged in

2. **Inquiry Message**:
   - Pre-filled message template:
     * "Hi [Host Name], I'm interested in renting your [Vehicle] for [Dates]."
     * Renter can edit before sending
   - Creates conversation but no booking yet
   - Host responds with availability confirmation

3. **Convert Inquiry to Booking**:
   - In message thread, show "Book this vehicle" button
   - Clicking starts booking flow with pre-filled dates
```

---

## 5. NOTIFICATIONS SYSTEM

### Goal
Industry-grade, real-time notification system for all user actions.

### Implementation Steps

#### 5.1 Notification Infrastructure
```
PROMPT: Build comprehensive notification system:

1. **Database Schema**:
   ```prisma
   model Notification {
     id          String           @id @default(cuid())
     userId      String
     user        User             @relation(fields: [userId], references: [id])
     type        NotificationType
     title       String
     message     String           @db.Text
     link        String?          // URL to relevant page
     read        Boolean          @default(false)
     actionTaken Boolean          @default(false)  // If notification requires action
     metadata    Json?            // Additional data
     createdAt   DateTime         @default(now())
   }

   enum NotificationType {
     BOOKING_REQUEST      // Host: New booking request
     BOOKING_CONFIRMED    // Renter: Booking confirmed
     BOOKING_CANCELLED    // Both: Booking cancelled
     BOOKING_MODIFIED     // Both: Booking dates changed
     PAYMENT_RECEIVED     // Host: Payment received
     PAYOUT_PROCESSED     // Host: Payout sent
     MESSAGE_RECEIVED     // Both: New message
     REVIEW_RECEIVED      // Both: New review
     TRIP_STARTING_SOON   // Both: Trip starts in 24h
     TRIP_ENDING_SOON     // Both: Trip ends in 2h
     TRIP_STARTED         // Both: Trip started
     TRIP_ENDED           // Both: Trip ended
     DOCUMENT_REQUIRED    // Renter: Upload documents
     DOCUMENT_VERIFIED    // Renter: Documents approved
     DOCUMENT_REJECTED    // Renter: Documents rejected
     VEHICLE_APPROVED     // Host: Vehicle listing approved
     VEHICLE_REJECTED     // Host: Vehicle listing rejected
     PRICE_DROP           // Renter: Saved vehicle price dropped
     EXTENSION_REQUESTED  // Host: Renter wants to extend trip
     EARLY_RETURN         // Host: Renter returning early
     LATE_RETURN          // Host: Renter is late
     DAMAGE_REPORTED      // Both: Damage claim filed
     DISPUTE_OPENED       // Both: Dispute opened
     SYSTEM_ANNOUNCEMENT  // All: Platform updates
   }
   ```

2. **Notifications Center** (/src/app/notifications/page.tsx):
   
   **Layout**:
   - Header with "Notifications" title
   - Tabs:
     * All (default)
     * Unread
     * Bookings
     * Messages
     * Reviews
     * Account
   
   **Notification List**:
   - Grouped by date: Today, Yesterday, This Week, Earlier
   - Each notification card:
     * Icon (based on type)
     * Title (bold if unread)
     * Message
     * Timestamp: "2 hours ago"
     * Action button (if actionable):
       - "View booking"
       - "Respond"
       - "Review"
       - "Upload document"
     * Mark as read (checkmark icon)
     * Delete (X icon)
   - Infinite scroll or pagination
   - Empty state: "No notifications"

   **Bulk Actions**:
   - "Mark all as read" button
   - "Clear all" button (with confirmation)

3. **Notification Bell** (in header):
   - Bell icon with red badge showing unread count
   - Click to open notifications dropdown:
     * Show last 5 notifications
     * "View all" link to notifications page
     * "Mark all as read" link
   - Auto-update count in real-time

4. **Notification Channels**:
   
   **In-App Notifications**:
   - Always show in notifications center
   - Badge on bell icon
   - Toast popup for urgent notifications

   **Push Notifications** (PWA):
   - Request permission on first visit (or after login)
   - Send push for:
     * New booking requests (hosts)
     * Booking confirmations (renters)
     * New messages
     * Trip starting soon
     * Payment received
   - Click notification to open relevant page in app

   **Email Notifications**:
   - Send email for important events:
     * Booking confirmed
     * Payment received
     * Trip reminders
     * Documents required
   - User can configure email preferences
   - Beautiful HTML email templates

   **SMS Notifications** (optional):
   - Send SMS for critical alerts:
     * Booking confirmed
     * Trip starting in 1 hour
     * Late return
   - User provides phone number and opts in

5. **Notification Preferences** (/src/app/profile/notifications/page.tsx):
   - Settings for each notification type:
     * Booking updates: [ ] In-app [ ] Email [ ] Push [ ] SMS
     * Messages: [ ] In-app [ ] Email [ ] Push [ ] SMS
     * Trip reminders: [ ] In-app [ ] Email [ ] Push [ ] SMS
     * Reviews: [ ] In-app [ ] Email [ ] Push [ ] SMS
     * Promotions: [ ] In-app [ ] Email [ ] Push [ ] SMS
   - "Pause all notifications" toggle (snooze)
   - Save preferences

6. **Notification API Routes**:
   
   **/api/notifications** (GET):
   - Fetch all notifications for user
   - Paginated
   - Filter by read/unread, type

   **/api/notifications/unread-count** (GET):
   - Return count of unread notifications
   - Used for bell badge

   **/api/notifications/[id]/read** (PUT):
   - Mark notification as read

   **/api/notifications/mark-all-read** (PUT):
   - Mark all notifications as read

   **/api/notifications/[id]** (DELETE):
   - Delete notification

   **/api/notifications/send** (POST - internal):
   - Create notification for user
   - Called from other services (booking, messaging, etc.)
   - Triggers push/email based on preferences

7. **Push Notification Implementation**:
   - Use Web Push API for PWA
   - Generate VAPID keys
   - Store push subscription in database
   - Send push via service worker
   - Handle notification clicks to open app
```

#### 5.2 Automated Reminders & Alerts
```
PROMPT: Implement scheduled notifications:

1. **Cron Jobs / Scheduled Tasks**:
   - Check every hour for upcoming events
   - Send reminders at:
     * 24 hours before trip starts
     * 2 hours before trip starts
     * At trip start time (if host/renter haven't checked in)
     * 2 hours before trip ends
     * At trip end time
     * 1 hour after trip end time (if not returned)

2. **Trip Reminders**:
   - 24h before pickup:
     * To renter: "Your trip starts tomorrow! Prepare documents."
     * To host: "Prepare [Vehicle] for pickup tomorrow."
   - 2h before pickup:
     * To both: "Trip starts in 2 hours. Pickup at [Location]."
   - At pickup time (if not checked in):
     * "Don't forget to start your trip!"
   - Before return:
     * "Trip ends in 2 hours. Prepare for return."
   - After return (if overdue):
     * To renter: "Your trip has ended. Please return the vehicle."
     * To host: "Renter is late returning [Vehicle]."

3. **Payment Reminders**:
   - If payment pending after 1 hour:
     * "Complete your payment to confirm booking"
   - If payout processing:
     * "Your payout of ZMW X is being processed"

4. **Action Reminders**:
   - If booking request not responded to within 12 hours:
     * To host: "You have a booking request awaiting response"
   - If documents not uploaded after booking:
     * To renter: "Upload your documents to proceed"
   - If unread messages for 24 hours:
     * "You have unread messages from [Name]"

5. **Review Reminders**:
   - 24 hours after trip ends:
     * To both: "How was your experience? Leave a review."
   - 5 days after trip (if no review):
     * "Last chance to review your trip with [Name]"
```

---

## 6. REVIEWS & RATINGS SYSTEM

### Goal
Transparent, two-way review system building trust and accountability.

### Implementation Steps

#### 6.1 Review System Design
```
PROMPT: Implement Turo-style review system:

1. **Database Schema**:
   ```prisma
   model Review {
     id          String   @id @default(cuid())
     bookingId   String
     booking     Booking  @relation(fields: [bookingId], references: [id])
     reviewerId  String
     reviewer    User     @relation("ReviewsGiven", fields: [reviewerId], references: [id])
     revieweeId  String
     reviewee    User     @relation("ReviewsReceived", fields: [revieweeId], references: [id])
     vehicleId   String?
     vehicle     Vehicle? @relation(fields: [vehicleId], references: [id])
     
     // Overall rating
     rating      Float    // 1-5 stars
     
     // Category ratings (for vehicle reviews)
     cleanliness   Float?
     communication Float?
     convenience   Float?
     accuracy      Float?
     
     // Review text
     title       String?
     comment     String   @db.Text
     
     // Host review of renter
     wouldRentAgain Boolean?
     
     // Response
     response    String?  @db.Text
     respondedAt DateTime?
     
     // Moderation
     flagged     Boolean  @default(false)
     approved    Boolean  @default(true)
     
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
   }
   ```

2. **Review Flow**:
   - After trip ends, both parties can leave reviews
   - Reviews are mutual (renter reviews vehicle/host, host reviews renter)
   - Review window: 14 days after trip ends
   - Reviews are blind (not visible until both submit or window closes)
   - After both submit, reviews become visible
   - If only one submits, that review becomes visible after 14 days

3. **Leave a Review Page** (/src/app/bookings/[id]/review/page.tsx):
   
   **For Renter Reviewing Vehicle/Host**:
   - Header: "How was your trip with [Host]'s [Vehicle]?"
   - Star ratings (1-5):
     * Overall experience
     * Cleanliness (how clean was the vehicle?)
     * Communication (host's responsiveness)
     * Convenience (pickup/return process)
     * Accuracy (did vehicle match listing?)
   - Review title (optional): "Great experience!"
   - Review text (required, min 50 chars):
     * Textarea with character counter
     * Prompt: "Share details of your experience"
   - "Would you rent this vehicle again?" Yes/No
   - Private feedback to host (optional, not public):
     * "Any suggestions for improvement?"
   - Submit button

   **For Host Reviewing Renter**:
   - Header: "How was [Renter]'s rental?"
   - Star rating (1-5): Overall experience
   - Review text:
     * "How was the renter? Were they respectful of your vehicle?"
   - "Would you rent to this guest again?" Yes/No
   - Vehicle condition at return:
     * No issues
     * Minor wear
     * Damage (requires details)
   - Private feedback to renter (optional)
   - Submit button

4. **Reviews Display**:
   
   **On Vehicle Page**:
   - Overall rating: 4.8★ (125 reviews)
   - Category ratings:
     * Cleanliness: 4.9★
     * Communication: 4.8★
     * Convenience: 4.7★
     * Accuracy: 4.9★
   - Rating distribution:
     * 5 stars: ████████ 80%
     * 4 stars: ██ 15%
     * 3 stars: █ 3%
     * 2 stars: ▓ 1%
     * 1 star: ▓ 1%
   - Recent reviews (first 6):
     * Renter avatar and name
     * Rating (stars)
     * Date: "December 2024"
     * Review text (truncated if long)
     * "Show more" to expand
     * Host response (if any)
   - "Show all reviews" button → reviews modal/page

   **On User Profile**:
   - Overall rating as host: 4.9★ (345 reviews)
   - Overall rating as renter: 4.7★ (89 reviews)
   - Recent reviews received
   - Filter: As host | As renter
   - Sort: Most recent, Highest rated, Lowest rated

5. **Review Moderation**:
   - Auto-flag reviews with profanity or offensive language
   - Allow users to report reviews
   - Admin can hide inappropriate reviews
   - Can't edit reviews after submission (only delete)

6. **Review Incentives**:
   - Prompt users to leave reviews
   - "Be the first to review!"
   - Show completion percentage: "80% of your trips reviewed"
   - Reward badge: "Thorough Reviewer" for users who review consistently
```

#### 6.2 Review Notifications & Reminders
```
PROMPT: Implement review reminders:

1. **Review Reminders**:
   - 24 hours after trip: "Rate your experience with [Name]"
   - 7 days after trip (if no review): Reminder email
   - 13 days after trip (if no review): Last chance notification

2. **Review Received Notifications**:
   - When other party submits review: "Your trip has been reviewed"
   - When your review becomes visible: "Your review is now live"
   - When someone responds to your review: "[Name] responded to your review"

3. **Review Achievements**:
   - After 10 five-star reviews: "You're a 5-star host!"
   - After 50 reviews received: "Experienced Host" badge
   - Superhost status (after 20 trips with 4.8+ average rating)
```

---

## 7. TRIP MODIFICATIONS

### Goal
Handle trip extensions, early returns, and late returns like Turo does.

### Implementation Steps

#### 7.1 Trip Extensions
```
PROMPT: Implement trip extension functionality:

1. **Extension Request** (/src/app/bookings/[id]/extend/page.tsx):
   - Renter can request extension while trip is active
   - Extension request form:
     * Current end date/time
     * New end date/time (must be after current)
     * Reason (optional): "Need car for longer"
   - Show new pricing:
     * Additional days: X days
     * Daily rate: ZMW Y
     * Extra cost: ZMW Z
     * New total: ZMW A
   - "Request extension" button

2. **Host Extension Approval**:
   - Host receives notification: "Extension requested for [Vehicle]"
   - Extension approval page:
     * Show extension details
     * Check vehicle availability (calendar)
     * If vehicle is booked immediately after: can't approve
     * If available: show expected additional earnings
   - Actions:
     * "Approve" (auto-charge renter)
     * "Decline" (with reason)
     * "Negotiate" (counter-offer with different dates)

3. **Extension Confirmation**:
   - After approval:
     * Update booking end date
     * Charge renter for additional days
     * Send confirmations to both parties
     * Update calendar availability

4. **API Routes**:
   - POST /api/bookings/[id]/extend (renter)
   - PUT /api/bookings/[id]/extension/approve (host)
   - PUT /api/bookings/[id]/extension/decline (host)
```

#### 7.2 Early Returns
```
PROMPT: Handle early return scenarios:

1. **Early Return Process**:
   - Renter can end trip early via app
   - Go to booking details
   - "End trip early" button
   - Confirm early return:
     * Current end date
     * Actual return date/time
     * Reason (optional): "Plans changed", "Emergency", etc.
   
2. **Refund Calculation**:
   - Check cancellation policy
   - If trip already started:
     * No refund for past days
     * Partial refund for unused future days (50% or based on policy)
   - If cancellation policy allows:
     * Calculate pro-rated refund
     * Deduct service fee
   - Show refund amount before confirming

3. **Early Return Confirmation**:
   - Update booking end date
   - Process refund (if applicable)
   - Notify host: "Trip ended early"
   - Update vehicle availability (becomes available sooner)
   - Still require post-trip inspection

4. **API Route**:
   - POST /api/bookings/[id]/early-return
```

#### 7.3 Late Returns
```
PROMPT: Handle late return scenarios:

1. **Late Return Detection**:
   - System checks if vehicle not returned by end time
   - After 30 minutes grace period:
     * Send notification to renter: "Your return is overdue"
     * Notify host: "Vehicle not returned on time"

2. **Late Fees**:
   - Charge late fee per hour (defined by host)
   - Auto-charge renter's payment method
   - Cap at 3 hours of late fees, then charge another full day
   - Example:
     * Late fee: ZMW 50/hour
     * 1 hour late: ZMW 50
     * 2 hours late: ZMW 100
     * 4 hours late: ZMW 350 (full day rate)

3. **Late Return Handling**:
   - Renter can:
     * Request extension (retroactive)
     * Return vehicle and accept late fees
     * Explain circumstances (emergency)
   - Host can:
     * Waive late fees (as a courtesy)
     * Report vehicle not returned (after 24 hours)

4. **Automatic Extension**:
   - If renter very late (>4 hours):
     * System can auto-extend for additional day(s)
     * Charge accordingly
     * Notify renter of charges

5. **Unreturned Vehicle Protocol**:
   - After 24 hours overdue:
     * Escalate to support team
     * Contact renter (phone, email, SMS)
     * If no response: report as stolen
     * Involve authorities
   - Insurance claim process
```

---

## TESTING & VALIDATION

### Final Phase 3 Tasks

```
PROMPT: Comprehensive testing of Phase 3:

1. **Search Tests**:
   - Test search with various filters
   - Verify results accuracy
   - Test map view
   - Test on mobile and desktop
   - Performance test with large result sets

2. **Booking Flow Tests**:
   - Complete full booking as renter
   - Test instant booking
   - Test manual approval booking
   - Test with extras and insurance options
   - Verify payment processing
   - Test on different devices

3. **Payment Tests**:
   - Test credit card payment
   - Test mobile money payment
   - Test payment failure scenarios
   - Verify escrow holds correctly
   - Test refund processing
   - Test security deposit hold/release

4. **Messaging Tests**:
   - Send messages between users
   - Test file attachments
   - Verify real-time updates
   - Test on mobile
   - Test notifications trigger

5. **Notifications Tests**:
   - Trigger various notification types
   - Verify delivery (in-app, email, push)
   - Test notification center
   - Test preferences
   - Verify badge counts update

6. **Reviews Tests**:
   - Leave review as renter
   - Leave review as host
   - Test blind review system
   - Verify ratings calculations
   - Test review responses

7. **Trip Modifications Tests**:
   - Request trip extension
   - Host approves extension
   - Payment processes correctly
   - Test early return with refund
   - Test late return with fees

8. **End-to-End Test**:
   - Complete user journey:
     * Register as renter
     * Search for vehicle
     * Book vehicle
     * Message host
     * Receive notifications
     * Complete trip
     * Leave review
   - Repeat as host

Document all issues and fix before Phase 4.
```

---

## SUCCESS CRITERIA

Phase 3 is complete when:

- ✅ Search works with all filters and returns accurate results
- ✅ Vehicle detail pages show all necessary information
- ✅ Booking flow is smooth from start to confirmation
- ✅ Payments process securely with Flutterwave/Stripe
- ✅ Escrow system holds and releases payments correctly
- ✅ Messaging works in real-time between users
- ✅ Notifications deliver via all channels (in-app, email, push)
- ✅ Reviews can be left and displayed properly
- ✅ Trip extensions work with approval workflow
- ✅ Early and late returns handled with proper refunds/charges
- ✅ All features mobile-responsive
- ✅ No critical bugs

---

## NEXT PHASE PREVIEW

Phase 4 will cover:
- Support system (help center, tickets)
- Static pages (About, Legal, Support pages)
- Communication best practices (studying Turo)
- Admin features completion
- Final polish and launch preparation

---

*Continue to Phase 4 document after completing Phase 3.*
