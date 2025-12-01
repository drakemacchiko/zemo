# ZEMO REBUILD - PHASE 4: SUPPORT, CONTENT & LAUNCH READINESS

## Overview
This final phase completes all support systems, static pages, platform polishing, and ensures ZEMO is ready for production launch with Turo-level quality.

---

## 1. COMPREHENSIVE SUPPORT SYSTEM

### Goal
Multi-channel support system matching Turo's help infrastructure.

### Implementation Steps

#### 1.1 Help Center
```
PROMPT: Create a comprehensive, searchable help center:

1. **Help Center Home** (/src/app/support/page.tsx):
   
   **Hero Section**:
   - Large search bar: "How can we help you?"
   - Autocomplete suggestions as user types
   - Popular searches displayed

   **Quick Access Categories** (6-8 cards):
   - Getting Started
     * How to book a car
     * How to list your car
     * Creating an account
     * Verification process
   
   - Booking & Trips
     * Changing or canceling bookings
     * What to do at pickup
     * What to do at return
     * Trip extensions
     * Reporting issues during trip
   
   - Payments & Pricing
     * How pricing works
     * Payment methods
     * Security deposits
     * Host payouts
     * Refunds and cancellations
   
   - Insurance & Protection
     * Coverage options
     * What's covered
     * Filing a claim
     * Damage reporting
   
   - Trust & Safety
     * Identity verification
     * Vehicle approval process
     * Reporting unsafe situations
     * Community guidelines
   
   - Host Resources
     * Listing best practices
     * Pricing your vehicle
     * Managing bookings
     * Host protection
     * Tax information

   **Popular Articles**:
   - List of 10-15 most viewed articles
   - Click to view full article

   **Still Need Help?**:
   - "Contact support" button
   - "Submit a request" link
   - "Report a safety issue" (urgent)
   - Live chat option (if available)

2. **Help Article Template** (/src/app/support/articles/[slug]/page.tsx):
   - Article title
   - Last updated date
   - Breadcrumbs: Support > Category > Article
   - Table of contents (for long articles)
   - Article content (formatted markdown)
   - Images and videos embedded
   - "Was this helpful?" feedback buttons (Yes/No)
   - "Related articles" section
   - "Still need help? Contact support"

3. **Search Results** (/src/app/support/search/page.tsx):
   - Search query displayed
   - Number of results
   - Results grouped by category
   - Highlight search terms in results
   - Filters: All, Getting Started, Bookings, etc.
   - "Didn't find what you're looking for? Contact support"

4. **Help Content Database**:
   ```prisma
   model HelpCategory {
     id          String        @id @default(cuid())
     name        String
     slug        String        @unique
     icon        String
     order       Int
     articles    HelpArticle[]
   }

   model HelpArticle {
     id          String       @id @default(cuid())
     categoryId  String
     category    HelpCategory @relation(fields: [categoryId], references: [id])
     title       String
     slug        String       @unique
     content     String       @db.Text
     keywords    String[]
     views       Int          @default(0)
     helpful     Int          @default(0)
     notHelpful  Int          @default(0)
     published   Boolean      @default(true)
     order       Int
     createdAt   DateTime     @default(now())
     updatedAt   DateTime     @updatedAt
   }
   ```

5. **Help Content to Create** (sample articles):
   
   **Getting Started**:
   - How to create a ZEMO account
   - How to verify your identity
   - How to book your first car
   - How to list your first vehicle
   - Understanding the ZEMO app
   
   **Booking & Trips**:
   - How to search for a car
   - Understanding instant book vs. request to book
   - What to bring when picking up a car
   - Pre-trip vehicle inspection guide
   - What to do during your trip
   - Returning a vehicle
   - Post-trip inspection guide
   - How to extend your trip
   - How to end a trip early
   - What to do if you're running late
   
   **Payments**:
   - How ZEMO pricing works
   - Understanding service fees
   - Payment methods accepted
   - What is a security deposit?
   - When will I be charged?
   - How do host payouts work?
   - How do refunds work?
   - Cancellation policy explained
   
   **Insurance**:
   - What insurance coverage is included?
   - Choosing the right protection plan
   - What to do if there's damage
   - How to file an insurance claim
   - Understanding liability coverage
   - Host protection explained
   
   **Trust & Safety**:
   - Why verify your identity?
   - How ZEMO keeps you safe
   - What to do in an emergency
   - Reporting unsafe behavior
   - Community guidelines
   - Privacy and data protection
   
   **Host Guide**:
   - Creating a great listing
   - Taking quality photos
   - Pricing your vehicle competitively
   - Setting availability and rules
   - Managing booking requests
   - Communicating with renters
   - Preparing your car for trips
   - Handling damages and claims
   - Taxes for hosts
   - Becoming a Superhost
   
   **Technical Help**:
   - Troubleshooting login issues
   - How to reset your password
   - Updating your profile
   - Notification settings
   - Installing the ZEMO app
   - Browser compatibility
   - Clearing cache and cookies

Create at minimum 50 comprehensive help articles.
```

#### 1.2 Support Ticket System
```
PROMPT: Implement customer support ticketing system:

1. **Submit Ticket Form** (/src/app/support/contact/page.tsx):
   - "How can we help?" header
   - Issue category (dropdown):
     * Booking issue
     * Payment problem
     * Account issue
     * Vehicle listing
     * Insurance/Damage claim
     * Trust & Safety report
     * Technical problem
     * Other
   - Related booking (if applicable):
     * Search and select from user's bookings
   - Subject (text input)
   - Description (textarea, min 50 chars)
     * "Please provide as much detail as possible"
   - Attachments (images, documents):
     * Drag and drop or browse
     * Max 5 files, 10MB each
   - Priority:
     * Normal (default)
     * Urgent (if safety issue)
   - Submit button

2. **Ticket Database Schema**:
   ```prisma
   model SupportTicket {
     id          String            @id @default(cuid())
     userId      String
     user        User              @relation(fields: [userId], references: [id])
     ticketNumber String           @unique  // ZEMO-T-12345
     category    TicketCategory
     subject     String
     description String            @db.Text
     status      TicketStatus      @default(OPEN)
     priority    TicketPriority    @default(NORMAL)
     bookingId   String?
     booking     Booking?          @relation(fields: [bookingId], references: [id])
     attachments String[]
     messages    TicketMessage[]
     assignedTo  String?
     assignedAdmin User?           @relation("AssignedTickets", fields: [assignedTo], references: [id])
     createdAt   DateTime          @default(now())
     updatedAt   DateTime          @updatedAt
     closedAt    DateTime?
   }

   enum TicketCategory {
     BOOKING_ISSUE
     PAYMENT_PROBLEM
     ACCOUNT_ISSUE
     VEHICLE_LISTING
     INSURANCE_CLAIM
     TRUST_SAFETY
     TECHNICAL
     OTHER
   }

   enum TicketStatus {
     OPEN
     IN_PROGRESS
     WAITING_FOR_USER
     RESOLVED
     CLOSED
   }

   enum TicketPriority {
     LOW
     NORMAL
     HIGH
     URGENT
   }

   model TicketMessage {
     id        String        @id @default(cuid())
     ticketId  String
     ticket    SupportTicket @relation(fields: [ticketId], references: [id])
     senderId  String
     sender    User          @relation(fields: [senderId], references: [id])
     message   String        @db.Text
     attachments String[]
     isStaff   Boolean       @default(false)
     createdAt DateTime      @default(now())
   }
   ```

3. **My Tickets Page** (/src/app/support/tickets/page.tsx):
   - List of user's support tickets
   - Filter: All, Open, In Progress, Resolved
   - Each ticket card:
     * Ticket number: #ZEMO-T-12345
     * Status badge (color-coded)
     * Category
     * Subject
     * Last updated: "2 hours ago"
     * Unread messages indicator
     * "View ticket" button
   - "New ticket" button
   - Empty state: "No support tickets"

4. **Ticket Detail Page** (/src/app/support/tickets/[id]/page.tsx):
   - Ticket header:
     * Ticket number
     * Status
     * Category
     * Created date
     * Last updated
   - Original ticket description
   - Attachments (if any)
   - Related booking info (if applicable)
   - Message thread:
     * Conversation between user and support
     * User messages: right side
     * Support messages: left side, with staff badge
     * Timestamps
   - Reply form:
     * Textarea: "Add a reply..."
     * Attach files
     * "Send" button
   - Actions:
     * "Mark as resolved" (user can close ticket)
     * "Reopen ticket" (if closed but issue persists)

5. **Support Admin Interface** (/src/app/admin/support/page.tsx):
   - Dashboard showing:
     * Open tickets count
     * Average response time
     * Tickets by category
     * Tickets by priority
   - Ticket queue:
     * Filter by status, category, priority
     * Search tickets
     * Sort by: newest, oldest, priority
   - Each ticket shows:
     * Ticket number
     * User name
     * Subject
     * Category, status, priority
     * Time since last activity
     * Assigned admin (if any)
     * "View & Respond" button
   
   **Ticket Management**:
   - Assign to admin
   - Change status
   - Change priority
   - Add internal notes (not visible to user)
   - Respond to user
   - Merge duplicate tickets
   - Close ticket

6. **Auto-Responder**:
   - Immediately send email when ticket submitted:
     * "We received your request"
     * Ticket number for reference
     * Expected response time: 24 hours
   - When ticket status changes: notify user
   - When admin responds: email notification

7. **Ticket Notifications**:
   - In-app notification when admin responds
   - Email notification
   - Badge on support icon in header

8. **API Routes**:
   - POST /api/support/tickets (create ticket)
   - GET /api/support/tickets (list user's tickets)
   - GET /api/support/tickets/[id] (get ticket details)
   - POST /api/support/tickets/[id]/messages (add message)
   - PUT /api/support/tickets/[id]/status (update status)
```

#### 1.3 Live Chat (Optional)
```
PROMPT: Implement live chat for instant support (if resources allow):

1. **Chat Widget**:
   - Floating chat button (bottom right)
   - "Chat with us" text
   - Click to open chat window
   - Show online/offline status

2. **Chat Window**:
   - Header: "ZEMO Support"
   - Status: "Typically replies in minutes"
   - Message thread
   - Input field
   - Attach image button
   - Emoji button
   - Send button

3. **Implementation Options**:
   - OPTION A: Use Intercom or Zendesk Chat (third-party)
   - OPTION B: Build custom with WebSocket
   - OPTION C: Use Tawk.to (free option)

4. **Chat Hours**:
   - Available hours: 8 AM - 8 PM WAT (West Africa Time)
   - Outside hours: "Leave a message" → creates ticket
   - Auto-response with expected reply time

5. **Chat Features**:
   - Send transcripts via email
   - Rate conversation after
   - Pre-chat form (name, email, issue)
   - Transfer to appropriate department
```

---

## 2. STATIC & LEGAL PAGES

### Goal
Complete, professional content for all required pages.

### Implementation Steps

#### 2.1 About Pages
```
PROMPT: Create comprehensive about section:

1. **About Us** (/src/app/about/page.tsx):
   - Hero section:
     * "About ZEMO"
     * "Zambia's trusted car rental marketplace"
   - Our story:
     * When founded
     * Mission statement
     * Vision for the future
   - How it works (visual diagram):
     * For renters
     * For hosts
   - Our values:
     * Trust
     * Safety
     * Community
     * Innovation
   - Team section (optional):
     * Photos and bios of key team members
   - Press mentions (if any)
   - "Join the ZEMO community" CTA

2. **How It Works** (/src/app/about/how-it-works/page.tsx):
   - Two sections: For Renters | For Hosts
   
   **For Renters**:
   - Step 1: Find the perfect car
     * Search thousands of vehicles
     * Filter by type, price, features
     * Read reviews from other renters
   - Step 2: Book securely
     * Request or book instantly
     * Choose protection plan
     * Pay securely online
   - Step 3: Pick up and drive
     * Meet the host
     * Inspect the vehicle together
     * Hit the road!
   - Step 4: Return and review
     * Return on time
     * Final inspection
     * Leave a review

   **For Hosts**:
   - Step 1: List your vehicle
     * Add photos and details
     * Set your price and availability
     * Choose your rules
   - Step 2: Connect with renters
     * Receive booking requests
     * Approve renters you trust
     * Message them directly
   - Step 3: Hand over the keys
     * Meet at your location
     * Complete pre-trip inspection
     * They're off!
   - Step 4: Get paid
     * Automatic payout after trip
     * Earn money while you're not using your car
     * Your vehicle is protected

3. **Trust & Safety** (/src/app/about/trust-and-safety/page.tsx):
   - "Your safety is our priority"
   - Verification process:
     * Driver's license verification
     * Identity verification
     * Vehicle inspection
   - Insurance & protection:
     * All trips include insurance
     * Host protection plans
     * 24/7 roadside assistance
   - Community standards:
     * Zero tolerance for unsafe behavior
     * Rating system
     * Dispute resolution
   - Safety tips:
     * For renters
     * For hosts
   - Emergency contacts

4. **Careers** (/src/app/about/careers/page.tsx):
   - "Join the ZEMO team"
   - Why work at ZEMO
   - Company culture
   - Benefits and perks
   - Open positions:
     * List current job openings
     * Job descriptions
     * Apply button (links to email or form)
   - "Don't see a fit? Send us your resume"

5. **Press & Media** (/src/app/about/press/page.tsx):
   - Press releases
   - Media coverage
   - Press kit download
   - Media contact information

6. **Blog** (/src/app/blog/page.tsx):
   - Latest articles:
     * Travel guides
     * Host success stories
     * Platform updates
     * Tips and tricks
   - Categories:
     * Travel Tips
     * Host Resources
     * Company News
     * Customer Stories
   - Search and filter
   - Subscribe to newsletter
```

#### 2.2 Legal Pages
```
PROMPT: Create comprehensive legal documentation (consult with lawyer for accuracy):

1. **Terms of Service** (/src/app/terms/page.tsx):
   - Last updated date
   - Table of contents (clickable sections)
   - Sections:
     1. Acceptance of Terms
     2. Eligibility
     3. Account Registration
     4. User Responsibilities
     5. Host Responsibilities
     6. Renter Responsibilities
     7. Booking and Cancellation
     8. Payments and Fees
     9. Insurance and Liability
     10. Prohibited Uses
     11. Intellectual Property
     12. Privacy
     13. Dispute Resolution
     14. Limitation of Liability
     15. Indemnification
     16. Governing Law
     17. Changes to Terms
     18. Contact Information
   - Format: clear, readable, with headers
   - "Download PDF" option

2. **Privacy Policy** (/src/app/privacy/page.tsx):
   - Last updated date
   - Sections:
     1. Information We Collect
        * Personal information
        * Usage data
        * Device information
        * Location data
     2. How We Use Your Information
        * Provide services
        * Improve platform
        * Communication
        * Safety and security
     3. Information Sharing
        * With other users (limited)
        * With service providers
        * For legal reasons
        * Business transfers
     4. Data Security
        * Encryption
        * Access controls
        * Security measures
     5. Your Rights
        * Access your data
        * Correct information
        * Delete account
        * Opt-out of marketing
     6. Cookies and Tracking
     7. Third-Party Links
     8. Children's Privacy
     9. International Data Transfers
     10. Changes to Policy
     11. Contact Us
   - GDPR compliance mentions (if applicable)
   - "Download PDF" option

3. **Cookie Policy** (/src/app/cookies/page.tsx):
   - What are cookies
   - Types of cookies we use:
     * Essential cookies
     * Performance cookies
     * Functionality cookies
     * Advertising cookies
   - How to control cookies
   - Cookie consent banner

4. **Community Guidelines** (/src/app/community-guidelines/page.tsx):
   - Respectful behavior
   - Prohibited activities:
     * Fraud or scams
     * Discrimination
     * Harassment
     * Unsafe driving
     * Property damage
     * Illegal activities
   - Consequences of violations:
     * Warnings
     * Suspension
     * Permanent ban
   - Reporting violations

5. **Cancellation Policy** (/src/app/cancellation-policy/page.tsx):
   - Renter cancellations:
     * 48+ hours before: Full refund
     * 24-48 hours: 50% refund
     * Less than 24 hours: No refund
   - Host cancellations:
     * Penalties for cancelling
     * Valid reasons for cancellation
   - Force majeure events
   - How to cancel a booking

6. **Insurance Policy** (/src/app/insurance-policy/page.tsx):
   - What's covered:
     * Collision damage
     * Theft
     * Third-party liability
   - What's not covered:
     * Pre-existing damage
     * Intentional damage
     * Off-road use
     * Racing
   - Deductibles and limits
   - How to file a claim
   - Claims process timeline

7. **Accessibility Statement** (/src/app/accessibility/page.tsx):
   - ZEMO's commitment to accessibility
   - WCAG compliance level
   - Accessible features
   - Known limitations
   - Contact for accessibility issues

8. **Cookie Consent Banner**:
   - Appears on first visit
   - "We use cookies to improve your experience"
   - "Accept All" | "Reject Non-Essential" | "Customize"
   - Link to Cookie Policy

All legal pages should be reviewed by a qualified attorney before launch.
```

#### 2.3 Support & Contact Pages
```
PROMPT: Create contact and support pages:

1. **Contact Us** (/src/app/contact/page.tsx):
   - Multiple contact methods:
     * Email: support@zemo.zm
     * Phone: +260 XXX XXXXXX
     * WhatsApp: +260 XXX XXXXXX
     * Live chat button
     * Submit a ticket button
   - Office address (if applicable)
   - Map showing location
   - Business hours
   - Social media links
   - Contact form:
     * Name
     * Email
     * Subject
     * Message
     * Submit button

2. **Safety & Emergency** (/src/app/support/safety/page.tsx):
   - Emergency contacts:
     * ZEMO 24/7 emergency line: [phone]
     * Police: [local emergency number]
     * Ambulance: [local emergency number]
     * Roadside assistance: [phone]
   - What to do in emergencies:
     * Accident
     * Breakdown
     * Theft
     * Medical emergency
   - Safety resources
   - Report unsafe situation (urgent ticket)

3. **Roadside Assistance** (/src/app/support/roadside-assistance/page.tsx):
   - 24/7 roadside assistance available
   - What's covered:
     * Flat tire
     * Dead battery
     * Lockout
     * Towing (up to X km)
   - How to request assistance:
     * Call hotline
     * Use in-app button
   - Response time
   - Contact number

4. **Insurance Claims** (/src/app/support/claims/page.tsx):
   - When to file a claim
   - Information needed:
     * Booking details
     * Incident description
     * Police report (if applicable)
     * Photos of damage
     * Witness information
   - Claims process:
     * Step 1: Report incident
     * Step 2: Submit documentation
     * Step 3: Assessment
     * Step 4: Resolution
   - Expected timeline
   - "File a claim" button → ticket form
```

---

## 3. COMMUNICATION BEST PRACTICES (TURO ANALYSIS)

### Goal
Ensure all user communications match industry standards.

### Implementation Steps

#### 3.1 Email Templates
```
PROMPT: Create professional email templates for all user interactions:

1. **Email Design System**:
   - Responsive HTML templates
   - ZEMO branding (logo, colors)
   - Clear call-to-action buttons
   - Footer with:
     * Unsubscribe link
     * Contact information
     * Social media links
     * Legal links
   - Mobile-optimized

2. **Email Templates to Create**:

   **Authentication**:
   - Welcome email (new user)
   - Email verification
   - Password reset
   - Password changed confirmation

   **Booking - Renter**:
   - Booking request sent
   - Booking confirmed
   - Booking declined
   - Booking cancelled (by you)
   - Booking cancelled (by host)
   - Trip starting tomorrow (24h reminder)
   - Trip starting soon (2h reminder)
   - Trip started
   - Trip ending soon (2h reminder)
   - Trip ended - leave a review
   - Review received

   **Booking - Host**:
   - New booking request
   - Booking confirmed
   - Booking cancelled by renter
   - Trip starting tomorrow (prepare vehicle)
   - Trip started
   - Trip ending soon
   - Trip ended - leave a review
   - Review received
   - Payment received

   **Payments**:
   - Payment successful
   - Payment failed
   - Refund processed
   - Security deposit held
   - Security deposit released
   - Payout processed (host)

   **Documents**:
   - Documents uploaded for review
   - Documents approved
   - Documents rejected (with reasons)

   **Verification**:
   - Account verified
   - Verification required

   **Vehicle Listing**:
   - Vehicle submitted for approval
   - Vehicle approved
   - Vehicle rejected (with reasons)
   - Vehicle deactivated

   **Messages**:
   - New message from [user]
   - Multiple unread messages

   **Support**:
   - Ticket received
   - Ticket updated
   - Ticket resolved

   **Marketing** (if user opted in):
   - Weekly deals
   - New vehicles in your area
   - Travel inspiration
   - Host tips and success stories

3. **Email Service**:
   - Use SendGrid, Mailgun, or AWS SES
   - Track open rates and click rates
   - Handle bounces and unsubscribes
   - A/B test subject lines

4. **Email Preferences**:
   - User can control:
     * Booking notifications: on/off
     * Message notifications: on/off
     * Marketing emails: on/off
     * Weekly summaries: on/off
   - Save preferences in database
   - Respect unsubscribe requests
```

#### 3.2 In-App Messaging Standards
```
PROMPT: Standardize in-app communication:

1. **Automated Messages**:
   - When booking confirmed:
     * To renter: "Your booking is confirmed! [Host] will meet you at [location] on [date] at [time]."
     * To host: "[Renter] has booked your [vehicle]. Trip starts [date] at [time]."
   
   - 24 hours before trip:
     * System message in conversation: "Trip starts tomorrow at [time]!"
   
   - At trip start:
     * "Time to start your trip! Complete the pre-trip inspection together."
   
   - At trip end:
     * "Trip has ended. Complete the post-trip inspection and leave a review!"

2. **Quick Reply Templates** (for hosts):
   - "Thanks for your interest! The car is available for your dates."
   - "Pickup location is [address]. See you at [time]!"
   - "I've approved your booking. Looking forward to it!"
   - "Sorry, the car isn't available those dates. Try [alternative dates]."

3. **Message Tone Guidelines**:
   - Friendly but professional
   - Clear and concise
   - Action-oriented
   - Avoid jargon
   - Include relevant details (dates, times, locations)
```

#### 3.3 Push Notification Standards
```
PROMPT: Define push notification standards:

1. **Notification Copy**:
   - Short (under 100 characters)
   - Actionable
   - Include emoji where appropriate (subtle)
   - Clear who/what it's about

2. **Examples**:
   - "🚗 New booking request for your Toyota Corolla"
   - "✅ Your booking is confirmed!"
   - "💬 Message from Sarah: 'What time should I pick up?'"
   - "⭐ You received a 5-star review!"
   - "🕐 Reminder: Trip starts in 2 hours"
   - "🏁 Trip ended. How was your experience?"

3. **Notification Timing**:
   - Don't send between 10 PM - 8 AM (unless urgent)
   - Batch non-urgent notifications
   - Immediate for: booking requests, messages, trip reminders

4. **Notification Frequency**:
   - Max 5 notifications per day (unless user takes action)
   - Allow users to snooze notifications
   - Respect user preferences
```

---

## 4. ADMIN FEATURES COMPLETION

### Goal
Complete all admin functionality for platform management.

### Implementation Steps

#### 4.1 Content Management System
```
PROMPT: Build CMS for admin to manage content:

1. **CMS Dashboard** (/src/app/admin/cms/page.tsx):
   - Quick access to:
     * Help articles
     * Blog posts
     * Email templates
     * Static pages
   - Recent edits
   - Drafts awaiting publication

2. **Help Articles Management** (/src/app/admin/cms/help/page.tsx):
   - List all help articles
   - Search and filter by category
   - Create new article:
     * Title
     * Category
     * Content (rich text editor)
     * Keywords (for search)
     * Published status
     * Order (for display)
   - Edit existing articles
   - Preview before publishing
   - View analytics (views, helpfulness rating)

3. **Blog Management** (/src/app/admin/cms/blog/page.tsx):
   - Create and edit blog posts
   - Rich text editor with:
     * Formatting options
     * Image upload
     * Video embed
     * Code blocks
   - SEO settings:
     * Meta title
     * Meta description
     * Slug
     * Featured image
   - Schedule publication
   - Categories and tags
   - Author attribution

4. **Email Templates** (/src/app/admin/cms/emails/page.tsx):
   - List all email templates
   - Edit templates:
     * Subject line
     * Preview text
     * HTML body (visual editor)
     * Variables used
   - Preview and test send
   - A/B test variants

5. **Static Pages** (/src/app/admin/cms/pages/page.tsx):
   - Edit static pages:
     * About
     * How It Works
     * Terms
     * Privacy
     * etc.
   - Version control (save previous versions)
   - Preview changes before publishing
```

#### 4.2 Platform Settings
```
PROMPT: Create admin settings interface:

1. **Platform Settings** (/src/app/admin/settings/page.tsx):
   
   **General Settings**:
   - Platform name
   - Support email
   - Support phone
   - Business address
   - Timezone
   - Currency (ZMW)
   - Language (English)

   **Booking Settings**:
   - Minimum booking duration (hours/days)
   - Maximum booking duration
   - Default advance notice (hours)
   - Instant booking enabled (global toggle)
   - Auto-cancellation timeout (if host doesn't respond)

   **Payment Settings**:
   - Service fee percentage (for renters)
   - Host commission percentage
   - Security deposit default amount
   - Payment providers enabled (Flutterwave, Stripe)
   - Minimum payout amount
   - Payout schedule (daily, weekly)

   **Insurance Settings**:
   - Insurance provider details
   - Coverage amounts for each plan
   - Deductible amounts
   - Claims contact information

   **Fees & Pricing**:
   - Late return fee (per hour)
   - Cancellation fees
   - Additional driver fee
   - Delivery fee (per km)
   - Cleaning fee

   **Verification Settings**:
   - Require phone verification (yes/no)
   - Require driver's license (yes/no)
   - Require ID verification (yes/no)
   - Auto-verify documents (AI-assisted)
   - Manual review required for: high-value vehicles, new users

   **Communication Settings**:
   - Email service provider credentials
   - SMS service provider credentials
   - Push notification service credentials
   - Enable/disable notification types

   **Trust & Safety**:
   - Minimum driver age (global default)
   - Minimum driving experience (years)
   - Background check provider
   - Fraud detection rules

   **Feature Flags**:
   - Enable instant booking
   - Enable trip extensions
   - Enable delivery
   - Enable extras/add-ons
   - Enable reviews
   - Enable messaging
   - Enable live chat
   - Maintenance mode (disable bookings)

2. **Save Settings**:
   - Validate inputs
   - Show success message
   - Log changes (audit trail)
```

#### 4.3 Analytics & Reporting
```
PROMPT: Create admin analytics dashboard:

1. **Analytics Dashboard** (/src/app/admin/analytics/page.tsx):
   
   **Overview Stats** (cards):
   - Total users (change from last month)
   - Total bookings (change)
   - Total revenue (change)
   - Average booking value
   - Active listings
   - Conversion rate (visitors to bookings)

   **Charts**:
   - Revenue over time (line chart)
   - Bookings by month (bar chart)
   - User growth (area chart)
   - Popular vehicle types (pie chart)
   - Bookings by location (map)

   **User Metrics**:
   - New signups (last 30 days)
   - Active users (logged in last 30 days)
   - User retention rate
   - Average session duration
   - Top traffic sources

   **Booking Metrics**:
   - Booking completion rate
   - Average booking value
   - Most booked vehicles
   - Peak booking times
   - Cancellation rate

   **Financial Metrics**:
   - Total revenue (all time)
   - Revenue by month
   - Host payouts
   - Service fees collected
   - Outstanding payments
   - Refunds issued

   **Performance Metrics**:
   - Average response time (hosts)
   - Average time to book (from search to confirmation)
   - Support ticket resolution time
   - Platform uptime

   **Export Options**:
   - Download reports as CSV/PDF
   - Schedule email reports (daily, weekly, monthly)

2. **User Analytics** (/src/app/admin/analytics/users/page.tsx):
   - User demographics
   - User behavior (pages visited, actions taken)
   - Cohort analysis
   - User segmentation

3. **Vehicle Analytics** (/src/app/admin/analytics/vehicles/page.tsx):
   - Most viewed vehicles
   - Most booked vehicles
   - Vehicles by category
   - Average listing price
   - Listing quality scores

4. **Financial Reports** (/src/app/admin/analytics/financial/page.tsx):
   - Income statement
   - Revenue breakdown
   - Payout history
   - Outstanding payouts
   - Tax reports
```

#### 4.4 Moderation & Safety Tools
```
PROMPT: Create moderation tools for admins:

1. **Content Moderation** (/src/app/admin/moderation/page.tsx):
   - Flagged content queue:
     * Flagged reviews
     * Flagged messages
     * Flagged listings
     * Reported users
   - Each item shows:
     * Content
     * Reason for flag
     * Reporter
     * Date reported
   - Actions:
     * Approve (no violation)
     * Remove content
     * Warn user
     * Suspend user
     * Ban user
     * Add to review queue

2. **User Moderation** (/src/app/admin/moderation/users/page.tsx):
   - Search users
   - Filter by: status, role, join date, activity
   - User actions:
     * View full profile
     * View all bookings
     * View all reviews
     * Send warning
     * Temporary suspension (1 day, 7 days, 30 days)
     * Permanent ban
     * Delete account
   - Ban reasons:
     * Fraudulent activity
     * Multiple violations
     * Safety concerns
     * Illegal activity
     * Spam
   - User can appeal bans

3. **Dispute Resolution** (/src/app/admin/disputes/page.tsx):
   - List all disputes
   - Dispute types:
     * Damage claim
     * Refund request
     * Review dispute
     * Payment issue
   - Each dispute shows:
     * Parties involved
     * Booking details
     * Evidence (photos, messages, documents)
     * Claims from each party
   - Admin actions:
     * Request more information
     * Mediate conversation
     * Make ruling
     * Issue refund/payment
     * Update security deposit
   - Communication log
   - Final resolution notes

4. **Fraud Detection** (/src/app/admin/fraud/page.tsx):
   - Suspicious activity alerts:
     * Multiple accounts from same IP
     * Unusual booking patterns
     * High-value bookings from new users
     * Multiple payment failures
     * Fake documents detected
   - Review flagged activities
   - Investigate users
   - Take preventive actions
```

---

## 5. FINAL POLISH & OPTIMIZATION

### Goal
Platform-wide improvements for production readiness.

### Implementation Steps

#### 5.1 Performance Optimization
```
PROMPT: Optimize ZEMO for performance:

1. **Image Optimization**:
   - Use Next.js Image component everywhere
   - Implement lazy loading
   - Generate WebP images with fallbacks
   - Create image thumbnails
   - Use CDN for image delivery

2. **Code Splitting**:
   - Dynamic imports for heavy components
   - Route-based code splitting
   - Lazy load modals and drawers

3. **Database Optimization**:
   - Add indexes on frequently queried fields
   - Optimize complex queries
   - Implement database connection pooling
   - Use read replicas for queries (if needed)

4. **Caching Strategy**:
   - Cache API responses (Redis or similar)
   - Cache static pages
   - Implement stale-while-revalidate
   - Cache search results (short TTL)

5. **Bundle Size**:
   - Analyze bundle size
   - Remove unused dependencies
   - Tree-shake unused code
   - Use lighter alternatives for heavy libraries

6. **Loading States**:
   - Skeleton loaders for all content
   - Optimistic UI updates
   - Smooth transitions
   - Progress indicators

7. **Performance Testing**:
   - Run Lighthouse audits
   - Target scores: Performance >90, Accessibility >90, SEO >90
   - Test on slow 3G network
   - Test on low-end devices
```

#### 5.2 SEO Optimization
```
PROMPT: Optimize ZEMO for search engines:

1. **Meta Tags**:
   - Unique title for each page
   - Meta descriptions (under 160 chars)
   - Open Graph tags for social sharing
   - Twitter Card tags
   - Canonical URLs

2. **Structured Data**:
   - Schema.org markup for:
     * Organization
     * Product (vehicles)
     * Review
     * BreadcrumbList
     * FAQPage
   - JSON-LD format

3. **Sitemap**:
   - Generate XML sitemap
   - Include: static pages, vehicle listings, help articles, blog posts
   - Submit to Google Search Console

4. **Robots.txt**:
   - Allow crawling of public pages
   - Disallow: admin, API routes, user dashboards
   - Link to sitemap

5. **Page Speed**:
   - Optimize Core Web Vitals
   - Fast server response times
   - Minimize render-blocking resources

6. **Content Optimization**:
   - Keyword research for car rental in Zambia
   - Optimize page content with keywords
   - Alt text for all images
   - Descriptive URLs

7. **Internal Linking**:
   - Link related content
   - Breadcrumbs on all pages
   - Clear navigation structure
```

#### 5.3 Accessibility Improvements
```
PROMPT: Ensure ZEMO is accessible to all users:

1. **Keyboard Navigation**:
   - All interactive elements accessible via keyboard
   - Visible focus indicators
   - Skip to main content link
   - Tab order logical

2. **Screen Readers**:
   - Proper ARIA labels
   - ARIA roles for custom components
   - ARIA live regions for dynamic content
   - Descriptive link text (not "click here")

3. **Color Contrast**:
   - WCAG AA compliance minimum
   - Text contrast ratios: 4.5:1 for normal text, 3:1 for large
   - Don't rely on color alone for information

4. **Forms**:
   - Label all form fields
   - Error messages associated with fields
   - Required fields indicated
   - Clear validation messages

5. **Images**:
   - Alt text for all images
   - Decorative images: empty alt
   - Complex images: detailed descriptions

6. **Responsive Design**:
   - Works at any zoom level (up to 200%)
   - No horizontal scrolling
   - Touch targets at least 44x44px

7. **Testing**:
   - Test with screen readers (NVDA, JAWS)
   - Test keyboard-only navigation
   - Use accessibility testing tools (axe, Lighthouse)
```

#### 5.4 Error Handling & Monitoring
```
PROMPT: Implement comprehensive error handling:

1. **Error Boundaries**:
   - React error boundaries for graceful failures
   - User-friendly error messages
   - Option to report errors
   - Fallback UI

2. **API Error Handling**:
   - Consistent error response format
   - Appropriate HTTP status codes
   - Detailed error messages (dev mode)
   - Generic messages (production)

3. **Error Logging**:
   - Use Sentry or similar
   - Log client-side errors
   - Log server-side errors
   - Include context (user, route, action)

4. **User-Friendly Error Pages**:
   - 404 Not Found
   - 500 Internal Server Error
   - 403 Forbidden
   - Maintenance mode page
   - Each with helpful message and navigation

5. **Monitoring**:
   - Uptime monitoring (Pingdom, UptimeRobot)
   - Performance monitoring (Vercel Analytics, Google Analytics)
   - Error tracking (Sentry)
   - User session recording (Hotjar, LogRocket)
   - Real user monitoring (RUM)

6. **Alerts**:
   - Alert team when:
     * Site goes down
     * Error rate spikes
     * Payment processing fails
     * Database connection lost
   - Set up PagerDuty or similar
```

---

## 6. TESTING & LAUNCH PREPARATION

### Goal
Thorough testing before production launch.

### Implementation Steps

#### 6.1 Comprehensive Testing
```
PROMPT: Perform end-to-end testing:

1. **Functional Testing**:
   - Test every user flow:
     * Sign up (renter and host)
     * Search and browse
     * Book a vehicle
     * Host accepts booking
     * Complete trip
     * Leave reviews
     * Message exchange
     * Payment processing
     * Document upload
     * Support ticket
   - Test edge cases
   - Test error scenarios

2. **Cross-Browser Testing**:
   - Chrome (Windows, Mac, Android)
   - Safari (iOS, Mac)
   - Firefox (Windows, Mac)
   - Edge (Windows)
   - Test on latest and previous versions

3. **Device Testing**:
   - iPhone (various models and iOS versions)
   - Android phones (various brands)
   - iPads and tablets
   - Desktop (various screen sizes)
   - Test both portrait and landscape

4. **Payment Testing**:
   - Test with test credit cards
   - Test mobile money (test mode)
   - Test payment failures
   - Test refunds
   - Test security deposit hold/release

5. **Load Testing**:
   - Simulate 100+ concurrent users
   - Test database under load
   - Test API rate limits
   - Identify bottlenecks

6. **Security Testing**:
   - SQL injection tests
   - XSS tests
   - CSRF protection
   - Authentication bypass attempts
   - Authorization checks
   - Sensitive data exposure
   - Run security scan (OWASP ZAP)

7. **User Acceptance Testing (UAT)**:
   - Invite beta testers (real users)
   - Gather feedback
   - Fix critical issues
   - Iterate based on feedback
```

#### 6.2 Launch Checklist
```
PROMPT: Prepare ZEMO for production launch:

1. **Pre-Launch Checklist**:
   
   **Technical**:
   - [ ] All features tested and working
   - [ ] No critical bugs
   - [ ] Performance optimized (Lighthouse scores >90)
   - [ ] SEO optimized
   - [ ] Accessibility compliant (WCAG AA)
   - [ ] SSL certificate installed
   - [ ] Domain configured (zemo.zm)
   - [ ] DNS records set
   - [ ] CDN configured
   - [ ] Database backups automated
   - [ ] Monitoring and alerts set up
   - [ ] Error logging configured
   - [ ] Analytics installed (Google Analytics, etc.)
   
   **Content**:
   - [ ] All static pages complete
   - [ ] All legal pages reviewed by lawyer
   - [ ] Help center articles written (50+)
   - [ ] Email templates created and tested
   - [ ] Blog posts ready (launch announcement)
   
   **Business**:
   - [ ] Payment providers activated (live mode)
   - [ ] Insurance partner confirmed
   - [ ] Bank account for payouts set up
   - [ ] Business licenses obtained
   - [ ] Terms of service finalized
   - [ ] Privacy policy finalized
   - [ ] Refund/cancellation policies clear
   
   **Marketing**:
   - [ ] Social media accounts created
   - [ ] Launch marketing plan ready
   - [ ] Press release prepared
   - [ ] Initial hosts recruited
   - [ ] Initial vehicles listed
   - [ ] Beta testers lined up
   
   **Support**:
   - [ ] Support team trained
   - [ ] Support email active
   - [ ] Support phone line active
   - [ ] Help center live
   - [ ] Ticket system ready
   
   **Testing**:
   - [ ] All user flows tested
   - [ ] Cross-browser testing complete
   - [ ] Mobile app tested
   - [ ] Payment processing tested
   - [ ] Security audit complete
   - [ ] Load testing complete
   - [ ] UAT feedback incorporated

2. **Launch Day**:
   - Deploy to production
   - Monitor errors closely (war room)
   - Be ready to rollback if critical issues
   - Respond to support tickets immediately
   - Monitor server performance
   - Check payment processing
   - Announce launch (social media, press)

3. **Post-Launch**:
   - Gather user feedback
   - Monitor analytics
   - Fix bugs promptly
   - Iterate based on data
   - Plan next features
   - Weekly team reviews
```

---

## 7. TURO FEATURE PARITY CHECK

### Goal
Ensure ZEMO has all critical features that Turo has.

### Implementation Steps

```
PROMPT: Final comparison with Turo to ensure feature parity:

1. **Core Features Checklist**:
   - [ ] Vehicle search with filters
   - [ ] Vehicle detail pages
   - [ ] Instant booking
   - [ ] Manual booking approval
   - [ ] Secure payment processing
   - [ ] Security deposits
   - [ ] Insurance/protection plans
   - [ ] Extras/add-ons
   - [ ] Calendar availability
   - [ ] Trip extensions
   - [ ] Early returns (partial refunds)
   - [ ] Late return fees
   - [ ] Delivery options
   - [ ] Messaging system
   - [ ] Notifications (email, push, SMS)
   - [ ] Reviews and ratings
   - [ ] Pre-trip inspection
   - [ ] Post-trip inspection
   - [ ] Digital rental agreements
   - [ ] Document verification
   - [ ] Host dashboard
   - [ ] Renter dashboard
   - [ ] Admin panel
   - [ ] Help center
   - [ ] Support tickets
   - [ ] PWA (mobile app)
   - [ ] User verification
   - [ ] Payment splitting (future: multiple payment methods)
   - [ ] Favorite vehicles (wishlists)
   - [ ] Price alerts
   - [ ] Host earnings calculator
   - [ ] Referral program (future)
   - [ ] Loyalty program (future)

2. **Advanced Features** (consider for post-launch):
   - Vehicle pickup/dropoff at airport
   - Long-term rental discounts (monthly rates)
   - Commercial vehicle rentals
   - Chauffeur service
   - Multi-vehicle bookings
   - Corporate accounts
   - Gift cards
   - Promotional codes/coupons
   - Seasonal pricing
   - Dynamic pricing (AI-powered)
   - Vehicle telematics integration
   - Advanced fraud detection
   - Video verification
   - Virtual car tours
   - API for third-party integrations

3. **Missing Features to Add**:
   - Identify any gaps compared to Turo
   - Prioritize for future sprints
   - Document as product roadmap
```

---

## FINAL TESTING & VALIDATION

```
PROMPT: Final comprehensive test before launch:

1. **End-to-End User Journeys**:
   - Complete renter journey (sign up to review)
   - Complete host journey (list vehicle to payout)
   - Admin journey (user management, content, support)

2. **Integration Tests**:
   - All payment flows
   - All notification channels
   - All email sends
   - All document uploads
   - All API endpoints

3. **Stress Tests**:
   - 1000+ concurrent users
   - Database query performance
   - Image upload under load
   - Search performance with 10,000+ vehicles

4. **Security Audit**:
   - Penetration testing
   - Vulnerability scanning
   - Code review for security issues
   - Third-party security audit (recommended)

5. **Legal Review**:
   - Terms of service
   - Privacy policy
   - All legal pages
   - Compliance with local laws

6. **Final QA**:
   - No broken links
   - No console errors
   - No missing images
   - All forms work
   - All buttons functional
   - Proper error messages
   - Loading states present
   - Smooth animations

Create detailed test report documenting all tests and results.
```

---

## SUCCESS CRITERIA

Phase 4 is complete when:

- ✅ Comprehensive help center with 50+ articles
- ✅ Support ticket system fully functional
- ✅ All static pages complete (About, Legal, Contact)
- ✅ All email templates professional and tested
- ✅ Admin CMS for content management
- ✅ Platform settings configurable by admin
- ✅ Analytics dashboard showing key metrics
- ✅ Moderation tools for safety
- ✅ Performance optimized (Lighthouse >90)
- ✅ SEO optimized with sitemaps
- ✅ Accessibility compliant (WCAG AA)
- ✅ Error handling and monitoring in place
- ✅ All features tested across devices
- ✅ Payment processing tested (live mode ready)
- ✅ Security audit complete
- ✅ Legal review complete
- ✅ Feature parity with Turo achieved
- ✅ Launch checklist 100% complete
- ✅ Zero critical bugs
- ✅ Ready for production launch! 🚀

---

## POST-LAUNCH ROADMAP

**Month 1-3 (Stabilization)**:
- Monitor for bugs and fix immediately
- Gather user feedback
- Optimize based on real usage data
- Scale infrastructure as needed
- Build community (social media, content marketing)

**Month 4-6 (Growth Features)**:
- Referral program
- Promotional codes
- Mobile app improvements
- Advanced search (AI-powered recommendations)
- Host analytics dashboard enhancement

**Month 7-12 (Advanced Features)**:
- Corporate accounts
- Long-term rentals
- Chauffeur services
- API for partners
- International expansion planning
- Advanced fraud detection
- Dynamic pricing

---

## CONGRATULATIONS! 🎉

You now have a complete, phased plan to rebuild ZEMO to industry-leading standards. Each phase builds upon the previous one, and by following these detailed prompts, you'll create a car rental platform that rivals Turo in quality, features, and user experience.

**Remember**:
- Take each phase one at a time
- Test thoroughly before moving to next phase
- Iterate based on feedback
- Keep user experience at the center of all decisions
- Don't launch until everything is polished

**Good luck building the future of car rental in Zambia!** 🚗✨

---

*These four phase documents provide a complete rebuild strategy. Work through them systematically, and ZEMO will become a world-class platform.*
