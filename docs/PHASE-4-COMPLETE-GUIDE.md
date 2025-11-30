# ZEMO Phase 4: Complete Implementation Guide

This document provides a comprehensive guide for implementing Phase 4 of the ZEMO rebuild, which focuses on support systems, content pages, and launch readiness.

## ✅ COMPLETED

### 1. Database Schema
- Added all required models to Prisma schema:
  - `HelpCategory` & `HelpArticle` - Help center content
  - `BlogCategory` & `BlogPost` - Blog system
  - `PlatformSettings` - Configurable platform settings
  - `EmailTemplate` - Email template management
  - `SupportTicket` already exists from Phase 9
  - `TicketMessage` & `TicketAttachment` already exist

### 2. Help Center Home Page
- Created `/support` page with:
  - Hero section with search bar
  - 8 help categories with icons and descriptions
  - Popular articles section
  - Contact options (tickets, safety, emergency)
  - Professional, user-friendly UI

### 3. Support Contact Form
- Created `/support/contact` page with:
  - Ticket submission form
  - Category selection
  - File attachments (up to 5 files, 10MB each)
  - Priority selection (Normal/Urgent)
  - Optional booking ID field
  - Form validation
  - Help resources section

## 📋 IMPLEMENTATION TASKS

### Phase 4.1: Complete Help Center

#### A. Help Article Pages

**File: `/src/app/support/articles/[slug]/page.tsx`**
```typescript
// Features needed:
// - Fetch article by slug from database
// - Display article content (markdown support)
// - Breadcrumbs navigation
// - Table of contents for long articles
// - "Was this helpful?" feedback buttons
// - Related articles section
// - View counter
// - Last updated date
// - Contact support CTA
```

**File: `/src/app/support/category/[slug]/page.tsx`**
```typescript
// Features needed:
// - List all articles in category
// - Filter and sort options
// - Search within category
// - Category description
// - Article cards with views and relevance
```

**File: `/src/app/support/search/page.tsx`**
```typescript
// Features needed:
// - Full-text search across articles
// - Search result highlighting
// - Filter by category
// - Sort by relevance/views/date
// - No results state with suggestions
```

#### B. Help Content Seeding

**File: `/prisma/seed-help-articles.ts`**
```typescript
// Create 50+ comprehensive help articles covering:
// 1. Getting Started (10 articles)
// 2. Booking & Trips (15 articles)
// 3. Payments & Pricing (10 articles)
// 4. Insurance & Protection (8 articles)
// 5. Trust & Safety (8 articles)
// 6. Host Resources (12 articles)
// 7. Account & Settings (5 articles)
// 8. Technical Help (5 articles)
```

#### C. API Routes

**Required API endpoints:**
```
GET /api/support/articles - List articles
GET /api/support/articles/[slug] - Get article
POST /api/support/articles/[id]/feedback - Submit feedback
GET /api/support/categories - List categories
GET /api/support/search - Search articles
```

### Phase 4.2: Support Ticket System

#### A. Ticket Pages

**File: `/src/app/support/tickets/page.tsx`**
- List user's tickets
- Filter by status
- Search tickets
- Status badges
- Unread message indicators
- Empty state

**File: `/src/app/support/tickets/[id]/page.tsx`**
- Full ticket details
- Message thread
- Reply functionality
- File attachments
- Status updates
- Close/reopen ticket

#### B. Admin Ticket Management

**File: `/src/app/admin/support/page.tsx`**
- Ticket queue dashboard
- Stats (open, response time, by category)
- Assignment system
- Bulk actions
- Internal notes
- Status management

#### C. API Routes

```
POST /api/support/tickets - Create ticket
GET /api/support/tickets - List user tickets
GET /api/support/tickets/[id] - Get ticket details
POST /api/support/tickets/[id]/messages - Add message
PUT /api/support/tickets/[id]/status - Update status
PUT /api/support/tickets/[id]/assign - Assign to admin
```

### Phase 4.3: Static & Legal Pages

All pages need to be created with proper content. Template structure:

```typescript
// Common structure for all static pages:
- SEO metadata
- Hero section
- Table of contents (for legal pages)
- Main content with proper typography
- Last updated date
- Download PDF option (for legal)
- Related links
- Contact CTA
```

**Pages to create:**

1. **About Section:**
   - `/about/how-it-works` - Detailed how it works guide
   - `/about/trust-safety` - Trust and safety details
   - `/about/careers` - Careers page
   - `/about/press` - Press and media

2. **Legal Pages:**
   - `/terms` - Terms of Service
   - `/privacy` - Privacy Policy
   - `/cookies` - Cookie Policy
   - `/community-guidelines` - Community guidelines
   - `/cancellation-policy` - Cancellation policy
   - `/insurance-policy` - Insurance policy
   - `/accessibility` - Accessibility statement

3. **Support Pages:**
   - `/support/safety` - Safety & emergency
   - `/support/roadside-assistance` - Roadside assistance
   - `/support/claims` - Insurance claims
   - `/contact` - Contact us (main contact page)

4. **Blog:**
   - `/blog` - Blog home page
   - `/blog/[slug]` - Blog post page
   - Admin blog management

### Phase 4.4: Email Template System

#### A. Email Templates (React Email)

**Install React Email:**
```bash
npm install react-email @react-email/components
```

**Templates to create in `/src/emails/`:**

1. **Authentication:**
   - `WelcomeEmail.tsx`
   - `EmailVerificationEmail.tsx`
   - `PasswordResetEmail.tsx`
   - `PasswordChangedEmail.tsx`

2. **Booking - Renter:**
   - `BookingRequestSent.tsx`
   - `BookingConfirmed.tsx`
   - `BookingDeclined.tsx`
   - `BookingCancelled.tsx`
   - `TripReminder24h.tsx`
   - `TripReminder2h.tsx`
   - `TripStarted.tsx`
   - `TripEnding.tsx`
   - `TripEnded.tsx`
   - `ReviewRequest.tsx`

3. **Booking - Host:**
   - `NewBookingRequest.tsx`
   - `BookingConfirmedHost.tsx`
   - `BookingCancelledByRenter.tsx`
   - `PrepareVehicle.tsx`
   - `PaymentReceived.tsx`

4. **Payments:**
   - `PaymentSuccessful.tsx`
   - `PaymentFailed.tsx`
   - `RefundProcessed.tsx`
   - `SecurityDepositHeld.tsx`
   - `SecurityDepositReleased.tsx`
   - `PayoutProcessed.tsx`

5. **Support:**
   - `TicketReceived.tsx`
   - `TicketUpdated.tsx`
   - `TicketResolved.tsx`

#### B. Email Service Integration

**File: `/src/lib/email/send.ts`**
```typescript
// Features:
// - SendGrid or AWS SES integration
// - Template rendering
// - Queue system for bulk emails
// - Bounce and unsubscribe handling
// - Email tracking (opens, clicks)
// - Rate limiting
```

**File: `/src/lib/email/templates.ts`**
```typescript
// Features:
// - Template registry
// - Variable interpolation
// - HTML and text versions
// - Preview generation
// - A/B testing support
```

#### C. Email Preferences

**File: `/src/app/settings/notifications/page.tsx`**
- Email notification preferences
- SMS preferences
- Push notification preferences
- Marketing opt-in/out
- Quiet hours settings
- Unsubscribe management

### Phase 4.5: Admin CMS

#### A. CMS Dashboard

**File: `/src/app/admin/cms/page.tsx`**
- Quick access to all content types
- Recent edits
- Drafts awaiting publication
- Content stats

#### B. Help Articles Management

**File: `/src/app/admin/cms/help/page.tsx`**
- List all articles
- Create/edit/delete
- Rich text editor
- Category assignment
- Keyword management
- Publish/unpublish
- Analytics (views, helpfulness)

#### C. Blog Management

**File: `/src/app/admin/cms/blog/page.tsx`**
- Create/edit blog posts
- Rich text editor with media
- SEO settings
- Schedule publication
- Categories and tags
- Author attribution
- Featured image

#### D. Email Template Editor

**File: `/src/app/admin/cms/emails/page.tsx`**
- List all templates
- Visual email editor
- Preview functionality
- Variable documentation
- Test send
- A/B test management

#### E. Static Page Editor

**File: `/src/app/admin/cms/pages/page.tsx`**
- Edit static pages
- Version control
- Preview before publishing
- Rollback capability

### Phase 4.6: Platform Settings

**File: `/src/app/admin/settings/page.tsx`**

Implement tabbed interface for:

1. **General Settings:**
   - Platform name
   - Support contact info
   - Business address
   - Timezone
   - Currency
   - Language

2. **Booking Settings:**
   - Min/max booking duration
   - Advance notice requirements
   - Instant booking toggle
   - Auto-cancellation timeout

3. **Payment Settings:**
   - Service fee percentages
   - Security deposit defaults
   - Payment providers
   - Payout schedule

4. **Insurance Settings:**
   - Provider details
   - Coverage amounts
   - Deductibles
   - Claims contact

5. **Fees & Pricing:**
   - Late return fees
   - Cancellation fees
   - Additional driver fees
   - Delivery fees
   - Cleaning fees

6. **Verification Settings:**
   - Required verifications
   - Auto-verify threshold
   - Manual review rules

7. **Communication Settings:**
   - Email service config
   - SMS service config
   - Push notification config
   - Notification toggles

8. **Trust & Safety:**
   - Minimum driver age
   - Driving experience requirements
   - Background check settings
   - Fraud detection rules

9. **Feature Flags:**
   - Enable/disable features
   - Maintenance mode
   - Beta features

### Phase 4.7: Analytics Dashboard

**File: `/src/app/admin/analytics/page.tsx`**

Implement comprehensive analytics:

1. **Overview Stats:**
   - Total users (with growth %)
   - Total bookings
   - Total revenue
   - Average booking value
   - Active listings
   - Conversion rate

2. **Charts:**
   - Revenue over time (line chart)
   - Bookings by month (bar chart)
   - User growth (area chart)
   - Vehicle types (pie chart)
   - Bookings by location (map)

3. **User Metrics:**
   - New signups
   - Active users
   - Retention rate
   - Session duration
   - Traffic sources

4. **Booking Metrics:**
   - Completion rate
   - Most booked vehicles
   - Peak booking times
   - Cancellation rate

5. **Financial Metrics:**
   - Revenue breakdown
   - Host payouts
   - Service fees collected
   - Outstanding payments
   - Refunds issued

6. **Export Functionality:**
   - CSV/PDF exports
   - Scheduled reports
   - Custom date ranges

**Install charting library:**
```bash
npm install recharts
```

### Phase 4.8: Moderation Tools

#### A. Content Moderation

**File: `/src/app/admin/moderation/page.tsx`**
- Flagged content queue
- Review/approve/remove actions
- User warnings
- Ban management
- Content history

#### B. User Moderation

**File: `/src/app/admin/moderation/users/page.tsx`**
- User search and filter
- View full profiles
- Send warnings
- Temporary suspensions
- Permanent bans
- Ban appeals

#### C. Dispute Resolution

**File: `/src/app/admin/disputes/page.tsx`**
- List all disputes
- Dispute details with evidence
- Mediation tools
- Decision making
- Refund/payment issuance
- Communication logs

#### D. Fraud Detection

**File: `/src/app/admin/fraud/page.tsx`**
- Suspicious activity dashboard
- Automated flagging
- Investigation tools
- Preventive actions

### Phase 4.9: Performance Optimization

#### A. Image Optimization

**Tasks:**
1. Replace all `<img>` with Next.js `<Image>`
2. Implement lazy loading
3. Generate WebP images
4. Set up CDN (Cloudinary/ImageKit)
5. Create responsive images

#### B. Code Splitting

**Implement:**
```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'));

// Route-based code splitting (automatic with Next.js App Router)
// Lazy load modals and drawers
```

#### C. Database Optimization

**Tasks:**
1. Review and add indexes
2. Optimize complex queries
3. Implement connection pooling
4. Consider read replicas

**File: `/prisma/schema.prisma`**
```prisma
// Add indexes for frequently queried fields
@@index([field1, field2])
```

#### D. Caching Strategy

**Install Redis:**
```bash
npm install ioredis
```

**File: `/src/lib/cache/redis.ts`**
```typescript
// Implement:
// - Cache API responses
// - Cache search results
// - Implement stale-while-revalidate
// - Cache static pages
```

#### E. Bundle Size Optimization

**Tasks:**
1. Run bundle analyzer
2. Remove unused dependencies
3. Tree-shake unused code
4. Use lighter alternatives

```bash
npm install @next/bundle-analyzer
```

### Phase 4.10: SEO Optimization

#### A. Meta Tags

**For all pages, ensure:**
- Unique titles
- Meta descriptions
- Open Graph tags
- Twitter Card tags
- Canonical URLs

**Example:**
```typescript
export const metadata: Metadata = {
  title: 'Page Title | ZEMO',
  description: 'Page description under 160 characters',
  openGraph: {
    title: 'Page Title',
    description: 'Page description',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page Title',
    description: 'Page description',
    images: ['/og-image.jpg'],
  },
};
```

#### B. Structured Data

**File: `/src/components/seo/StructuredData.tsx`**

Implement Schema.org markup for:
- Organization
- Product (vehicles)
- Review
- BreadcrumbList
- FAQPage

#### C. Sitemap

**File: `/src/app/sitemap.ts`**
```typescript
export default async function sitemap() {
  // Generate dynamic sitemap including:
  // - Static pages
  // - Vehicle listings
  // - Help articles
  // - Blog posts
}
```

#### D. Robots.txt

**File: `/src/app/robots.ts`**
```typescript
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://zemo.zm/sitemap.xml',
  };
}
```

### Phase 4.11: Accessibility

#### Tasks:

1. **Keyboard Navigation:**
   - Test all interactive elements
   - Add visible focus indicators
   - Implement skip-to-main-content link
   - Ensure logical tab order

2. **Screen Reader Support:**
   - Add ARIA labels
   - Implement ARIA roles
   - Add ARIA live regions for dynamic content
   - Use descriptive link text

3. **Color Contrast:**
   - Run contrast checker
   - Ensure 4.5:1 ratio for text
   - Don't rely on color alone

4. **Forms:**
   - Label all fields
   - Associate errors with fields
   - Indicate required fields
   - Provide clear validation messages

5. **Testing:**
   - Test with NVDA/JAWS
   - Test keyboard-only navigation
   - Run Lighthouse accessibility audit
   - Use axe DevTools

### Phase 4.12: Error Handling & Monitoring

#### A. Error Boundaries

**File: `/src/components/ErrorBoundary.tsx`**
```typescript
// Implement React error boundaries
// User-friendly error messages
// Error reporting option
// Fallback UI
```

#### B. API Error Handling

**File: `/src/lib/api/error-handler.ts`**
```typescript
// Consistent error response format
// Appropriate HTTP status codes
// Detailed errors in dev
// Generic errors in production
```

#### C. Error Logging

**Install Sentry:**
```bash
npm install @sentry/nextjs
```

**Configure Sentry:**
```typescript
// Log client-side errors
// Log server-side errors
// Include context (user, route, action)
// Set up alerts
```

#### D. Monitoring

**Set up:**
1. Uptime monitoring (UptimeRobot)
2. Performance monitoring (Vercel Analytics)
3. Error tracking (Sentry)
4. User session recording (Hotjar/LogRocket)
5. Real User Monitoring

#### E. Custom Error Pages

Create:
- `/src/app/not-found.tsx` - 404 page
- `/src/app/error.tsx` - 500 page
- `/src/app/maintenance.tsx` - Maintenance mode

### Phase 4.13: Testing

#### A. Test Coverage

**Install testing libraries:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D playwright # For E2E tests
```

**Test categories:**
1. Unit tests for utilities
2. Component tests
3. API route tests
4. E2E tests for critical flows
5. Load tests

#### B. E2E Test Scenarios

**File: `/tests/e2e/`**
- User registration and verification
- Vehicle search and booking
- Payment processing
- Message exchange
- Inspection flow
- Review submission
- Support ticket creation

#### C. Cross-Browser Testing

Test on:
- Chrome (latest & previous)
- Safari (iOS & Mac)
- Firefox (latest)
- Edge (latest)

#### D. Device Testing

Test on:
- iPhone (various models)
- Android (various devices)
- Tablets
- Desktop (various resolutions)

### Phase 4.14: Launch Checklist

Create comprehensive checklist in `/docs/launch-checklist.md`:

**Technical:**
- [ ] All features tested
- [ ] No critical bugs
- [ ] Performance optimized (Lighthouse >90)
- [ ] SEO optimized
- [ ] Accessibility compliant (WCAG AA)
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] DNS records set
- [ ] CDN configured
- [ ] Database backups automated
- [ ] Monitoring setup
- [ ] Error logging configured
- [ ] Analytics installed

**Content:**
- [ ] All static pages complete
- [ ] Legal pages reviewed by lawyer
- [ ] 50+ help articles written
- [ ] Email templates created
- [ ] Blog posts ready

**Business:**
- [ ] Payment providers live
- [ ] Insurance partner confirmed
- [ ] Bank account setup
- [ ] Business licenses obtained
- [ ] Policies finalized

**Marketing:**
- [ ] Social media accounts created
- [ ] Launch plan ready
- [ ] Press release prepared
- [ ] Initial hosts recruited
- [ ] Beta testers lined up

**Support:**
- [ ] Support team trained
- [ ] Contact channels active
- [ ] Help center live
- [ ] Ticket system ready

**Testing:**
- [ ] All user flows tested
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete
- [ ] Payment testing complete
- [ ] Security audit complete
- [ ] Load testing complete
- [ ] UAT complete

## IMPLEMENTATION PRIORITY

### Week 1: Core Support System
1. Complete help center pages (article, category, search)
2. Seed help articles database
3. Complete ticket system pages
4. API routes for support

### Week 2: Static Content
1. Create all legal pages
2. Create about section pages
3. Create support info pages
4. Create contact page

### Week 3: Email System
1. Design email templates
2. Integrate email service
3. Implement email sending
4. Test all email flows

### Week 4: Admin Features Part 1
1. CMS dashboard
2. Help articles management
3. Blog management
4. Platform settings

### Week 5: Admin Features Part 2
1. Analytics dashboard
2. Ticket management
3. Moderation tools
4. Fraud detection

### Week 6: Optimization
1. Performance optimization
2. SEO implementation
3. Accessibility improvements
4. Error handling

### Week 7: Testing
1. Write tests
2. Cross-browser testing
3. Device testing
4. Load testing
5. Security testing

### Week 8: Launch Preparation
1. UAT
2. Final bug fixes
3. Documentation
4. Launch checklist completion
5. Deployment

## USEFUL RESOURCES

### Design
- [Turo Design Inspiration](https://turo.com)
- [Help Center Examples](https://www.zendesk.com/blog/10-great-customer-service-examples/)

### Email Templates
- [React Email](https://react.email/)
- [MJML](https://mjml.io/)

### Analytics
- [Recharts](https://recharts.org/)
- [Chart.js](https://www.chartjs.org/)

### SEO
- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Schema.org](https://schema.org/)

### Accessibility
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)

### Testing
- [Playwright](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

## NEXT STEPS

1. Review this implementation guide
2. Prioritize tasks based on launch timeline
3. Set up project management (Jira/Trello)
4. Assign tasks to team members
5. Begin Week 1 implementation
6. Regular progress reviews
7. Iterate based on feedback

## NOTES

- This is a comprehensive 8-week plan
- Adjust timeline based on team size
- Consider hiring content writer for help articles
- Get legal review before publishing legal pages
- Test payment flows thoroughly in sandbox
- Set up staging environment for testing
- Plan for post-launch monitoring and support
- Keep documentation up to date
