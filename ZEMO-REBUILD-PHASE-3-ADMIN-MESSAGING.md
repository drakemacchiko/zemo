# ZEMO REBUILD - PHASE 3: ADMIN DASHBOARD & MESSAGING SYSTEM

## Overview
This phase completely overhauls the admin experience and messaging system. Focus on creating a powerful, modern admin dashboard with user impersonation, full platform management capabilities, and a seamless real-time messaging system.

---

## 1. ADMIN DASHBOARD COMPLETE OVERHAUL

### Problem Analysis
Current issues:
- Admin dashboard feels static and old
- Limited functionality
- No modern features
- Can't perform necessary administrative tasks
- No user impersonation for support
- Missing key management tools
- Poor data visualization

### Implementation Steps

#### 1.1 Modern Admin Dashboard Design
```
PROMPT: Create a world-class admin dashboard that exceeds industry standards:

1. **Dashboard Layout** (/src/app/admin/page.tsx):
   
   **Top Bar**:
   - Period selector (Today, Week, Month, Year, Custom)
   - Quick actions dropdown
   - Real-time indicator (users online)
   - Admin profile with role badge

   **Key Metrics Cards** (4-column grid):
   - Total Users
     * Current count
     * Growth percentage
     * Sparkline chart
     * Quick action: "View all users"
   
   - Active Bookings
     * Current active trips
     * Pending requests count
     * Revenue in progress
     * Quick action: "View bookings"
   
   - Platform Revenue
     * Total revenue
     * This month's revenue
     * Target progress bar
     * Quick action: "View payments"
   
   - Support Tickets
     * Open tickets
     * Avg response time
     * Satisfaction score
     * Quick action: "View tickets"

   **Charts Section** (2-column):
   - User Growth (Line chart)
     * Daily/Weekly/Monthly active users
     * New registrations
     * Retention rate
     * Interactive tooltip
   
   - Revenue Analytics (Area chart)
     * Daily revenue
     * Booking commissions
     * Payment processing fees
     * Net revenue
   
   - Booking Trends (Bar chart)
     * Bookings per day
     * By vehicle category
     * Peak times highlighted
   
   - Geographic Distribution (Map chart)
     * Bookings by location
     * Heat map overlay
     * Click for city details

   **Recent Activity Feed**:
   - Real-time updates
   - User registrations
   - New vehicle listings
   - Booking completions
   - Support tickets
   - Payment issues
   - Flagged content
   - Click to navigate to detail

   **Quick Actions Grid**:
   - "Approve Vehicles" (pending count badge)
   - "Verify Documents" (pending count)
   - "Resolve Disputes" (active count)
   - "Review Reports" (flagged count)
   - "Manage Featured" (curated picks)
   - "Send Announcement" (broadcast)
   - "Export Data" (reports)
   - "View Analytics" (detailed)

2. **Advanced Charts** (Use recharts library):
   - Interactive and responsive
   - Smooth animations
   - Tooltips with detailed info
   - Zoom and pan on desktop
   - Filter by date range
   - Export chart data (CSV/PNG)
   - Comparison modes (YoY, MoM)

3. **Real-Time Updates**:
   - WebSocket connection for live data
   - Auto-refresh every 30 seconds
   - Visual pulse for new activities
   - Sound notification (optional)
   - Unread indicator
   - "Mark all as seen" button

4. **Mobile Admin**:
   - Simplified dashboard for mobile
   - Critical metrics only
   - Quick actions as bottom sheet
   - Charts simplified (no interaction)
   - Notifications prominent
   - Responsive table alternatives (cards)
```

#### 1.2 Comprehensive User Management
```
PROMPT: Build complete user management system:

1. **User List Page** (/src/app/admin/users/page.tsx):
   
   **Features**:
   - Data table with pagination
   - Search by name, email, phone
   - Filter by:
     * Role (Renter, Host, Admin)
     * Status (Active, Suspended, Deleted)
     * Verification (Verified, Pending, Rejected)
     * Registration date
     * Last active date
   - Sort by any column
   - Bulk actions:
     * Export selected users
     * Send email to selected
     * Change role (batch)
     * Suspend/activate (batch)
   - Quick view (modal on click)
   - Advanced search with multiple criteria

   **User Card Display**:
   - Avatar photo
   - Name + email
   - Role badge
   - Verification status
   - Join date
   - Last active (relative time)
   - Total bookings/listings
   - Action menu (3-dot)

2. **User Detail Page** (/src/app/admin/users/[id]/page.tsx):
   
   **Tabs**:
   a) Overview
      - Full profile information
      - Verification documents
      - Account statistics
      - Trust score/rating
      - Flags and warnings
      - Account history timeline

   b) Activity Log
      - All user actions
      - Login history (IP, device)
      - Bookings made
      - Messages sent
      - Reviews left
      - Support tickets
      - Searchable and filterable

   c) Bookings
      - As renter
      - As host
      - Current, past, upcoming
      - Revenue generated (hosts)
      - Spending (renters)
      - Cancellation history

   d) Vehicles (if host)
      - All listed vehicles
      - Performance metrics
      - Approval status
      - Issues reported

   e) Financial
      - Payment methods
      - Transaction history
      - Earnings (hosts)
      - Payouts made
      - Pending balance
      - Refunds issued/received

   f) Documents
      - Uploaded documents
      - Verification status
      - Expiry dates
      - Download options
      - Re-verification requests

   g) Messages
      - All conversations
      - Flagged messages
      - Response rates
      - Communication history

   h) Reviews
      - Reviews given
      - Reviews received
      - Average ratings
      - Flagged reviews
      - Responses

   i) Moderation
      - Warnings issued
      - Account restrictions
      - Suspension history
      - Dispute cases
      - Notes (admin only)

   **Actions Available**:
   - Edit user profile
   - Verify/reject documents
   - Suspend/activate account
   - Reset password (send link)
   - Impersonate user (see below)
   - Send email
   - Add admin note
   - View audit log
   - Delete account (with confirmation)
   - Assign role/permissions
   - Grant verification badge

3. **User Creation** (/src/app/admin/users/new/page.tsx):
   - Create user manually
   - Select role
   - Set permissions
   - Send welcome email
   - Auto-generate password
   - Mark as verified (skip verification)
   - Add to specific groups/tags

4. **Bulk Operations**:
   - Import users from CSV
   - Export users to CSV/Excel
   - Batch email campaigns
   - Batch role assignments
   - Mass verification
   - Batch suspend/activate
```

#### 1.3 User Impersonation for Support
```
PROMPT: Implement secure user impersonation system:

1. **Impersonation Feature** (/src/lib/admin/impersonation.ts):
   
   **Purpose**:
   - View platform as specific user
   - Debug user-reported issues
   - Test user-specific permissions
   - Provide better support
   - Never for malicious purposes

   **Implementation**:
   ```typescript
   // API route: /api/admin/impersonate
   async function impersonateUser(adminId: string, targetUserId: string) {
     // Verify admin has permission
     // Store original admin session
     // Create impersonation session
     // Log the impersonation start
     // Return new session token with flag
   }

   async function stopImpersonation(sessionId: string) {
     // Restore original admin session
     // Log impersonation end
     // Clear impersonation flags
   }
   ```

2. **UI Implementation**:
   - "Impersonate" button on user detail page
   - Confirmation modal with reason input
   - Banner at top of screen (bright red/yellow):
     * "Viewing as [User Name]"
     * "Stop Impersonation" button
     * Timer showing duration
     * Warning: "All actions logged"
   
   - Session stored in database:
     * Admin who initiated
     * Target user
     * Start time
     * End time
     * Reason
     * Actions taken during session
     * IP address

3. **Restrictions During Impersonation**:
   - Cannot change password
   - Cannot modify payment methods
   - Cannot delete account
   - Cannot access sensitive documents fully
   - Cannot initiate payments (read-only)
   - Cannot send messages as user (view only)
   - Limited to read/test operations

4. **Audit Trail**:
   - Every action logged
   - Visible in user's activity log
   - Flagged as "Admin action"
   - Queryable for compliance
   - Export for review
   - Alert if suspicious patterns

5. **Permissions**:
   - Only SUPER_ADMIN can impersonate
   - Regular ADMIN needs approval
   - Time-limited sessions (max 30 minutes)
   - Auto-logout after inactivity
   - Require re-authentication

6. **Exit Impersonation**:
   - Clear button always visible
   - Auto-stop after 30 minutes
   - Redirect back to admin panel
   - Show summary of session
   - Confirm exit before closing tab
```

#### 1.4 Vehicle Management & Approval
```
PROMPT: Create comprehensive vehicle management system:

1. **Vehicle Approval Queue** (/src/app/admin/vehicles/pending/page.tsx):
   - List of vehicles awaiting approval
   - Filter by submission date
   - Sort by priority
   - Preview cards with key info
   - Quick approve/reject buttons
   - Batch approval
   - Detailed review modal

2. **Approval Review Modal**:
   - All vehicle details
   - Photo gallery
   - Document verification checklist
   - Pricing review
   - Location verification
   - Host verification status
   - Issues found (auto-detected)
   - Approve with notes
   - Reject with reason
   - Request corrections

3. **Vehicle Analytics** (/src/app/admin/vehicles/page.tsx):
   - Total vehicles
   - Active listings
   - Pending approvals
   - Rejected listings
   - By category
   - By location
   - Performance metrics
   - Revenue per vehicle

4. **Featured Vehicles Management**:
   - Select vehicles to feature
   - Homepage spotlight
   - Category featured
   - Boost in search
   - Schedule featuring
   - Analytics on featured impact

5. **Bulk Operations**:
   - Batch approve
   - Batch reject
   - Mass updates (pricing rules)
   - Export vehicle data
   - Compliance checks
```

#### 1.5 Financial Management
```
PROMPT: Build complete financial oversight system:

1. **Revenue Dashboard** (/src/app/admin/payments/page.tsx):
   - Total revenue (all-time)
   - Revenue this month
   - Revenue trends
   - Commission earnings
   - Payment processing fees
   - Net revenue
   - Outstanding payouts
   - Refunds issued

2. **Transaction List**:
   - All transactions
   - Filter by:
     * Type (booking, payout, refund)
     * Status (completed, pending, failed)
     * Date range
     * Amount range
     * User
     * Payment method
   - Search by transaction ID
   - Export to CSV

3. **Payout Management** (/src/app/admin/payments/payouts/page.tsx):
   - Pending payouts queue
   - Review payout requests
   - Verify bank details
   - Approve/reject
   - Batch processing
   - Failed payout handling
   - Payout schedule

4. **Financial Reports**:
   - Daily/weekly/monthly reports
   - Revenue by category
   - Top earning vehicles
   - Top hosts by revenue
   - Payment method breakdown
   - Refund analysis
   - Tax reports (downloadable)

5. **Dispute Resolution**:
   - Payment disputes list
   - Damage claims
   - Refund requests
   - Evidence review
   - Resolution actions
   - Communication with parties
   - Decision logging
```

#### 1.6 Content Management System
```
PROMPT: Create flexible CMS for platform content:

1. **Help Articles** (/src/app/admin/cms/help/page.tsx):
   - List all articles
   - Create/edit articles
   - Rich text editor (TipTap)
   - Categories management
   - SEO optimization
   - Preview before publish
   - Version history
   - Analytics (views, helpfulness)
   - Search functionality

2. **Blog Management** (/src/app/admin/cms/blog/page.tsx):
   - Create blog posts
   - Featured image upload
   - Rich content editor
   - Categories and tags
   - Author assignment
   - Publish scheduling
   - SEO meta tags
   - Social media preview

3. **Email Templates** (/src/app/admin/cms/emails/page.tsx):
   - All email templates
   - WYSIWYG editor
   - Variable placeholders
   - Preview with test data
   - Test send
   - Version control
   - A/B testing support

4. **Announcements** (/src/app/admin/announcements/page.tsx):
   - Create platform-wide announcements
   - In-app banners
   - Email broadcasts
   - Push notifications
   - Target specific user groups
   - Schedule posting
   - Expiry dates
```

#### 1.7 Support Ticket Management
```
PROMPT: Build comprehensive support ticket system:

1. **Ticket Queue** (/src/app/admin/support/page.tsx):
   - All tickets list
   - Filter by:
     * Status (open, in-progress, resolved)
     * Priority (low, normal, high, urgent)
     * Category
     * Assigned admin
   - Sort by date, priority
   - Search tickets
   - Bulk assignment
   - Quick actions

2. **Ticket Detail View**:
   - Ticket information
   - User profile summary
   - Conversation history
   - Attachments
   - Related bookings/vehicles
   - Internal notes
   - Status change log
   - Assignment history
   - Response templates
   - Resolution options

3. **Support Analytics**:
   - Total tickets
   - Open vs resolved
   - Average response time
   - Average resolution time
   - Satisfaction ratings
   - By category breakdown
   - By admin performance
   - Peak times

4. **Admin Assignment**:
   - Auto-assignment rules
   - Manual assignment
   - Load balancing
   - Specialization routing
   - Escalation paths
   - Performance tracking
```

---

## 2. MESSAGING SYSTEM OVERHAUL

### Problem Analysis
Current issues:
- "Message Host" button doesn't properly start conversations
- Inbox not ready for texting
- No quick text suggestions
- Poor mobile UX
- No real-time updates
- Missing essential features

### Implementation Steps

#### 2.1 Message Host - Start Conversation Flow
```
PROMPT: Fix and enhance the "Message Host" functionality:

1. **From Vehicle Detail Page**:
   - "Message host" button visible and prominent
   - Click behavior:
     * If user not logged in → redirect to login
     * If logged in → check if conversation exists
     * If conversation exists → open that conversation
     * If new → create conversation + open composer

2. **API Implementation** (/src/app/api/conversations/start/route.ts):
   ```typescript
   async function startConversation(req) {
     const { userId, hostId, vehicleId, initialMessage } = req.body;
     
     // Check if conversation already exists
     const existing = await prisma.conversation.findFirst({
       where: {
         renterId: userId,
         hostId: hostId,
         vehicleId: vehicleId
       }
     });
     
     if (existing) {
       return { conversationId: existing.id };
     }
     
     // Create new conversation
     const conversation = await prisma.conversation.create({
       data: {
         renterId: userId,
         hostId: hostId,
         vehicleId: vehicleId,
         title: `About ${vehicleName}`,
       }
     });
     
     // Send initial message if provided
     if (initialMessage) {
       await prisma.message.create({
         data: {
           conversationId: conversation.id,
           senderId: userId,
           content: initialMessage
         }
       });
     }
     
     // Notify host
     await sendNotification(hostId, 'NEW_MESSAGE', { ... });
     
     return { conversationId: conversation.id };
   }
   ```

3. **Navigate to Messages**:
   - Redirect to: `/messages?conversation={conversationId}`
   - Open conversation immediately
   - Auto-focus message input
   - Smooth transition
```

#### 2.2 Complete Messaging Interface Redesign
```
PROMPT: Create a modern messaging interface rivaling Turo's:

1. **Messages Page Layout** (/src/app/messages/page.tsx):
   
   **Desktop (3-column)**:
   - Left: Conversation list (25%)
   - Center: Active conversation (50%)
   - Right: Conversation details (25%)

   **Mobile (single view)**:
   - Conversation list OR
   - Active conversation (with back button)

2. **Conversation List** (/src/components/messages/ConversationList.tsx):
   - Search conversations
   - Filter: All, Unread, Archived
   - Sort: Recent, Unread first, By date
   - Conversation preview:
     * Other party avatar
     * Other party name
     * Vehicle thumbnail (if applicable)
     * Last message snippet (truncated)
     * Timestamp (relative: "2m ago")
     * Unread badge (count)
     * Online indicator
     * Typing indicator
   - Swipe actions (mobile):
     * Swipe right: Mark as read
     * Swipe left: Archive
   - Infinite scroll
   - Pull to refresh

3. **Message Thread** (/src/components/messages/MessageThread.tsx):
   
   **Header**:
   - Other party avatar + name
   - Vehicle info (if applicable)
   - Online/offline status
   - Last seen time
   - Actions menu:
     * View profile
     * View vehicle
     * View booking
     * Report conversation
     * Archive
     * Block user

   **Messages Area**:
   - Messages ordered by time (newest at bottom)
   - Auto-scroll to bottom on load
   - Scroll to bottom button (if not at bottom)
   - Load more on scroll up
   - Message grouping by sender
   - Timestamp between groups
   - Message bubbles:
     * Sent (yellow, right-aligned)
     * Received (gray, left-aligned)
     * Read receipts
     * Delivery status
     * Time sent (small, gray)
     * Failed indicator with retry
   - System messages (centered, gray):
     * "Booking confirmed"
     * "Trip started"
     * "Trip completed"
     * "Payment received"

   **Message Composer**:
   - Text input (auto-expand up to 5 lines)
   - Emoji picker button
   - Attach file button (images, docs)
   - Send button (icon only, disabled if empty)
   - Character count (if limit)
   - "User is typing..." indicator
   - Quick replies (see below)

4. **Quick Reply Suggestions**:
   - Show contextual suggestions above input
   - Host suggestions:
     * "Yes, the car is available for your dates"
     * "I'll meet you at [location]"
     * "Please upload your driver's license"
     * "Thank you for booking!"
     * "Have a great trip!"
   - Renter suggestions:
     * "Is the car available for [dates]?"
     * "What time can I pick up the car?"
     * "Can you deliver to [address]?"
     * "Thank you!"
   - Smart suggestions based on:
     * Conversation context
     * Booking status
     * User role
     * Previous messages

5. **Real-Time Features**:
   - WebSocket connection for live updates
   - New messages appear instantly
   - Typing indicators:
     * "John is typing..."
     * Show animation (3 dots)
     * Disappear after 3s of no typing
   - Online status:
     * Green dot when online
     * "Active 5m ago" when offline
     * Update in real-time
   - Read receipts:
     * Double check mark (delivered)
     * Blue double check mark (read)
     * Update immediately

6. **File Sharing**:
   - Send images (up to 10MB)
   - Send documents (up to 20MB)
   - Preview images inline
   - Download button for files
   - Virus scanning before upload
   - Thumbnail generation

7. **Message Actions**:
   - Long press (mobile) / right-click (desktop):
     * Copy text
     * Delete message (sender only)
     * Reply (quote message)
     * Report message
   - Delete options:
     * Delete for me
     * Delete for everyone (within 1 hour)

8. **Conversation Details Panel** (Desktop):
   - Vehicle information card
   - Booking information (if exists)
   - Shared files/images
   - Conversation actions:
     * Mute notifications
     * Archive conversation
     * Block user
     * Report
```

#### 2.3 Notifications for Messages
```
PROMPT: Implement comprehensive message notifications:

1. **In-App Notifications**:
   - Badge count on Messages tab
   - Badge on conversation list item
   - Sound notification (if enabled)
   - Desktop notification (if permitted)
   - Toast notification (if on different page)

2. **Email Notifications**:
   - New message email
   - Daily digest (if multiple unread)
   - Configurable in settings
   - Unsubscribe option

3. **Push Notifications** (PWA):
   - Browser push notification
   - Show message preview
   - Click to open conversation
   - Action buttons: Reply, Mark as read

4. **SMS Notifications** (Optional):
   - For urgent messages
   - If user opted in
   - Rate-limited (max 3/day)
```

#### 2.4 Message Moderation & Safety
```
PROMPT: Implement safety features for messaging:

1. **Auto-Moderation**:
   - Scan messages for:
     * Profanity
     * Hate speech
     * Scams (e.g., off-platform payment requests)
     * Personal info sharing (phone, email, address)
     * Inappropriate content
   - Flag messages for review
   - Block sending if severe
   - Warn user before sending

2. **Report System**:
   - Report message button
   - Report reasons:
     * Spam
     * Harassment
     * Scam
     * Inappropriate content
     * Off-platform transaction
   - Admin review queue
   - Actions: Warn, suspend, ban

3. **Blocking**:
   - Block user from messages
   - Cannot send messages to blocker
   - Existing conversation hidden
   - Reversible by user

4. **Privacy**:
   - Phone numbers masked until booking
   - Addresses shared only after booking
   - Email not visible in messages
   - Contact info exchanged only when appropriate
```

---

## 3. ADMIN PERMISSIONS & ROLES

### Implementation Steps

#### 3.1 Role-Based Access Control (RBAC)
```
PROMPT: Implement granular permissions system:

1. **Roles**:
   - SUPER_ADMIN: Full access, can do everything
   - ADMIN: Most access, cannot delete or create admins
   - MODERATOR: Content moderation, support tickets
   - SUPPORT_AGENT: Support tickets, view-only on most
   - USER: Regular user
   - HOST: Can list vehicles
   - RENTER: Can book vehicles

2. **Permissions**:
   ```typescript
   enum Permission {
     // Users
     VIEW_USERS = 'users:view',
     EDIT_USERS = 'users:edit',
     DELETE_USERS = 'users:delete',
     IMPERSONATE_USERS = 'users:impersonate',
     
     // Vehicles
     VIEW_VEHICLES = 'vehicles:view',
     APPROVE_VEHICLES = 'vehicles:approve',
     EDIT_VEHICLES = 'vehicles:edit',
     DELETE_VEHICLES = 'vehicles:delete',
     
     // Bookings
     VIEW_BOOKINGS = 'bookings:view',
     EDIT_BOOKINGS = 'bookings:edit',
     CANCEL_BOOKINGS = 'bookings:cancel',
     
     // Financial
     VIEW_PAYMENTS = 'payments:view',
     PROCESS_PAYOUTS = 'payments:process',
     ISSUE_REFUNDS = 'payments:refund',
     
     // Content
     MANAGE_CONTENT = 'content:manage',
     PUBLISH_CONTENT = 'content:publish',
     
     // Support
     VIEW_TICKETS = 'support:view',
     RESOLVE_TICKETS = 'support:resolve',
     
     // Analytics
     VIEW_ANALYTICS = 'analytics:view',
     EXPORT_DATA = 'analytics:export',
     
     // System
     MANAGE_ADMINS = 'system:manage_admins',
     CHANGE_SETTINGS = 'system:settings',
     VIEW_LOGS = 'system:logs',
   }
   ```

3. **Permission Checks**:
   - Middleware checks permission
   - UI hides unauthorized actions
   - API returns 403 if unauthorized
   - Audit log on permission checks

4. **Admin Management** (/src/app/admin/settings/admins/page.tsx):
   - List all admins
   - Create new admin
   - Assign role
   - Custom permissions
   - Deactivate admin
   - Audit admin actions
```

---

## TESTING & VALIDATION

### Phase 3 Checklist

```
1. **Admin Dashboard**:
   ✅ Modern, visually appealing
   ✅ Real-time data updates
   ✅ Charts interactive and informative
   ✅ Quick actions functional
   ✅ Mobile-responsive

2. **User Management**:
   ✅ Can view all users
   ✅ Can edit user details
   ✅ Can suspend/activate accounts
   ✅ Bulk operations work
   ✅ User detail page comprehensive

3. **User Impersonation**:
   ✅ Can impersonate users
   ✅ Banner always visible
   ✅ Actions logged
   ✅ Restrictions enforced
   ✅ Can exit impersonation

4. **Vehicle Management**:
   ✅ Approval queue works
   ✅ Can approve/reject vehicles
   ✅ Featured vehicles manageable
   ✅ Analytics accurate

5. **Financial Management**:
   ✅ Revenue tracking accurate
   ✅ Transaction list complete
   ✅ Payout system works
   ✅ Reports downloadable

6. **Messaging System**:
   ✅ "Message host" starts conversation correctly
   ✅ Conversations load and display
   ✅ Can send and receive messages
   ✅ Real-time updates work
   ✅ Quick replies functional
   ✅ File sharing works
   ✅ Notifications sent
   ✅ Mobile UX smooth

7. **Permissions**:
   ✅ Roles enforced correctly
   ✅ Permission checks work
   ✅ Unauthorized actions blocked
   ✅ Audit logging functional

Test with:
- Multiple admin roles
- Real message conversations
- Various devices
- Network conditions
- Permission scenarios
```

---

## SUCCESS CRITERIA

Phase 3 is complete when:

- ✅ Admin dashboard modern and feature-rich
- ✅ All admin management tools functional
- ✅ User impersonation works securely
- ✅ Vehicle approval system efficient
- ✅ Financial management comprehensive
- ✅ CMS allows content management
- ✅ Support ticket system operational
- ✅ Messaging system works perfectly
- ✅ Real-time features implemented
- ✅ Quick replies enhance UX
- ✅ Message notifications reliable
- ✅ Permissions enforced properly
- ✅ Mobile admin experience good
- ✅ All Phase 3 tests passing

---

*This document builds on Phases 1 & 2 and should be given to the AI coding agent section by section.*
