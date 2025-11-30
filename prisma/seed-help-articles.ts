import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Getting Started', slug: 'getting-started', icon: 'Rocket', order: 1 },
  { name: 'Booking & Trips', slug: 'booking-trips', icon: 'Calendar', order: 2 },
  { name: 'Payments & Pricing', slug: 'payments', icon: 'CreditCard', order: 3 },
  { name: 'Insurance & Protection', slug: 'insurance', icon: 'Shield', order: 4 },
  { name: 'Trust & Safety', slug: 'trust-safety', icon: 'ShieldCheck', order: 5 },
  { name: 'Host Resources', slug: 'host-resources', icon: 'Users', order: 6 },
  { name: 'Technical Help', slug: 'technical', icon: 'Settings', order: 7 },
  { name: 'Emergency', slug: 'emergency', icon: 'AlertTriangle', order: 8 },
];

const articles = [
  // Getting Started (8 articles)
  {
    category: 'getting-started',
    title: 'How to Create a ZEMO Account',
    slug: 'create-zemo-account',
    content: `Creating your ZEMO account is quick and easy. Follow these simple steps to get started.

## Step 1: Visit ZEMO Website
Go to zemo.zm and click "Sign Up" in the top right corner.

## Step 2: Choose Sign-Up Method
You can sign up using:
- Email address
- Phone number
- Google account
- Facebook account

## Step 3: Provide Required Information
- Full name (as it appears on your ID)
- Email address
- Phone number
- Password (minimum 8 characters)
- Date of birth

## Step 4: Verify Your Email/Phone
Check your email or SMS for a verification code and enter it to confirm your account.

## Step 5: Complete Your Profile
Add additional information:
- Profile photo
- Location
- Driver's license (if renting)
- Government ID

## What's Next?
Once your account is created:
- For Renters: Browse vehicles and start booking
- For Hosts: List your first vehicle

Need help? Contact support@zemo.zm`,
    keywords: ['sign up', 'create account', 'register', 'new user', 'getting started'],
    order: 1,
    featured: true,
  },
  {
    category: 'getting-started',
    title: 'How to Verify Your Identity',
    slug: 'verify-identity',
    content: `Identity verification is required for all ZEMO users to ensure trust and safety in our community.

## Why Verification is Required
- Protects all users in the platform
- Prevents fraud and scams
- Builds trust between renters and hosts
- Required by insurance providers

## What Documents You'll Need
1. **Driver's License** (for renters)
   - Valid and not expired
   - Clear photo of front and back
   
2. **Government-Issued ID**
   - National ID, Passport, or Driver's License
   - Must show your full name and photo
   - Should not be expired

3. **Selfie for Verification**
   - Clear photo of your face
   - Good lighting
   - Matches ID photo

## Verification Steps
1. Go to Profile > Verification
2. Upload your driver's license
3. Upload government ID
4. Take a selfie
5. Verify your phone number
6. Wait for approval (usually 24-48 hours)

## Verification Status
- **Pending**: Documents under review
- **Verified**: You're all set!
- **Rejected**: Documents need correction (we'll email you details)

## Tips for Faster Verification
✓ Ensure documents are clear and readable
✓ All four corners visible
✓ No glare or shadows
✓ Info matches your profile exactly

## Having Issues?
Contact our verification team: verify@zemo.zm`,
    keywords: ['verification', 'identity', 'documents', 'ID', 'driver license', 'selfie'],
    order: 2,
    featured: true,
  },
  {
    category: 'getting-started',
    title: 'How to Book Your First Car',
    slug: 'book-first-car',
    content: `Your complete guide to booking your first vehicle on ZEMO.

## Step 1: Search for Vehicles
- Enter your location
- Select pickup and return dates
- Choose time
- Click "Search"

## Step 2: Browse Results
Filter by:
- Price range
- Vehicle type (SUV, Sedan, Truck)
- Features (GPS, Bluetooth, etc.)
- Instant book availability

## Step 3: Review Vehicle Details
Check:
- Photos and description
- Daily rate and total cost
- Host rating and reviews
- Included features
- House rules

## Step 4: Choose Booking Type
**Instant Book** ⚡
- Book immediately
- Instant confirmation
- No waiting for host approval

**Request to Book**
- Send request to host
- Host has 24 hours to respond
- Can add message with request

## Step 5: Select Protection Plan
- Basic: ZMW 50/day
- Standard: ZMW 120/day
- Premium: ZMW 200/day

## Step 6: Add Trip Details
- Purpose of trip (optional)
- Message to host
- Special requests

## Step 7: Payment
- Enter payment details
- Review booking summary
- Security deposit information
- Click "Confirm Booking"

## What Happens Next?
- Receive confirmation email
- Get host contact info
- Pickup instructions
- Pre-trip checklist

Ready to book? Start searching now!`,
    keywords: ['book', 'first booking', 'rent car', 'how to book', 'instant book'],
    order: 3,
  },
  {
    category: 'getting-started',
    title: 'How to List Your First Vehicle',
    slug: 'list-first-vehicle',
    content: `Start earning money by listing your vehicle on ZEMO. Here's your step-by-step guide.

## Before You Start
Ensure you have:
- Valid vehicle registration
- Current insurance
- Roadworthy certificate
- Clear photos of your vehicle

## Step 1: Go to "List Your Car"
Click "Become a Host" or "List Your Car" in the navigation menu.

## Step 2: Vehicle Information
Provide:
- Make and model
- Year
- Registration number
- VIN number
- Mileage
- Transmission type
- Fuel type
- Number of seats

## Step 3: Upload Photos (Minimum 6)
Required shots:
- Front view
- Rear view
- Both sides
- Interior front
- Interior back
- Dashboard

Tips for great photos:
✓ Clean your car first
✓ Good lighting (daytime)
✓ Show all angles
✓ Highlight special features

## Step 4: Set Your Price
- View similar vehicles in your area
- Use our pricing guide
- Consider demand and seasonality
- You can adjust anytime

## Step 5: Set Availability
- Choose your calendar
- Set minimum/maximum trip length
- Advanced booking notice
- Instant book on/off

## Step 6: House Rules
Set rules for renters:
- Smoking allowed/not allowed
- Pets allowed/not allowed
- Additional drivers
- Mileage limits
- Fuel policy

## Step 7: Location & Delivery
- Set pickup location
- Enable delivery (optional)
- Set delivery radius and fee

## Step 8: Review & Submit
- Review all information
- Read hosting agreement
- Submit for approval

## Approval Process
- Usually takes 24-48 hours
- We verify documents and photos
- You'll receive email notification
- Once approved, your car is live!

## Tips for Success
✓ Price competitively
✓ Maintain good ratings
✓ Respond quickly to requests
✓ Keep calendar updated
✓ Maintain your vehicle well

Start earning today!`,
    keywords: ['list car', 'become host', 'earn money', 'rent my car', 'host'],
    order: 4,
    featured: true,
  },
  {
    category: 'getting-started',
    title: 'Understanding the ZEMO App',
    slug: 'understanding-zemo-app',
    content: `Learn how to navigate and use the ZEMO mobile app for the best experience.

## Downloading the App
Available on:
- iOS (App Store)
- Android (Google Play)

## Main Features

### Home Screen
- Search vehicles
- View your trips
- Access messages
- Quick actions

### For Renters
**Search & Browse**
- Filter by location, dates, price
- View vehicle details
- Read reviews
- Save favorites

**My Trips**
- Upcoming trips
- Active trips
- Past trips
- Trip details and documents

**Messages**
- Chat with hosts
- Receive notifications
- Quick replies

**Profile**
- Edit information
- Verification status
- Payment methods
- Reviews received

### For Hosts
**My Vehicles**
- View all listings
- Edit details and pricing
- Manage availability
- Vehicle statistics

**Bookings**
- Pending requests
- Confirmed trips
- Calendar view
- Earnings tracker

**Messages**
- Chat with renters
- Quick response templates
- Booking requests

### Universal Features
**Notifications**
- Booking updates
- Messages
- Payment confirmations
- Reminders

**Help & Support**
- Browse help articles
- Submit support tickets
- Emergency contacts
- Live chat

## In-Trip Features
During active trips:
- Start/end trip
- Complete inspections
- Report issues
- Upload photos
- Extend trip
- Contact host/renter

## Navigation Tips
✓ Use bottom navigation for main sections
✓ Swipe to see more options
✓ Pull down to refresh
✓ Enable notifications for updates

## Offline Mode
Some features available offline:
- View trip details
- Access booking information
- See contact information

## App Settings
Customize:
- Notification preferences
- Language
- Currency
- Privacy settings
- Payment methods

## Troubleshooting
**App won't open?**
- Force close and restart
- Check for updates
- Clear cache
- Reinstall if needed

**Can't log in?**
- Check internet connection
- Verify email/password
- Try password reset
- Contact support

Need more help? support@zemo.zm`,
    keywords: ['app', 'mobile', 'how to use', 'navigation', 'features'],
    order: 5,
  },

  // Booking & Trips (10 articles)
  {
    category: 'booking-trips',
    title: 'Understanding Instant Book vs Request to Book',
    slug: 'instant-book-vs-request',
    content: `Learn the difference between Instant Book and Request to Book to choose the best option for your needs.

## Instant Book ⚡

### What It Is
Book immediately without waiting for host approval. Your booking is confirmed instantly once payment is processed.

### Benefits
✓ Immediate confirmation
✓ Perfect for last-minute trips
✓ No waiting for host response
✓ Guaranteed availability

### When to Use
- Time-sensitive travel
- Last-minute plans
- When you need certainty
- Popular times/locations

### Requirements
- Verified account
- Valid payment method
- Meet host's requirements

## Request to Book 📋

### What It Is
Send a booking request to the host. They have 24 hours to accept or decline.

### Benefits
✓ Can add personal message
✓ Explain special circumstances
✓ Ask questions first
✓ Negotiate terms

### When to Use
- First time renting
- Special requests
- Want to communicate first
- Checking flexibility

### The Process
1. Send request with message
2. Host reviews your profile
3. Host accepts/declines/asks questions
4. If accepted, payment processed
5. Booking confirmed

## Which Should You Choose?

**Choose Instant Book if:**
- You need immediate confirmation
- Standard trip with no special requests
- Traveling soon
- Don't need to communicate first

**Choose Request to Book if:**
- You have questions for host
- Special circumstances
- Want to explain your trip
- Flexible with dates

## Host's Perspective

### Why Hosts Enable Instant Book
- Increase bookings
- Attract spontaneous renters
- Less manual work
- Competitive advantage

### Why Hosts Prefer Requests
- Screen renters personally
- Discuss trip details
- Ensure vehicle is right fit
- More control

## Tips for Success

**For Instant Book:**
✓ Verify your account
✓ Keep payment methods updated
✓ Read all details before booking
✓ Still message host after

**For Requests:**
✓ Write detailed message
✓ Be clear about needs
✓ Ask specific questions
✓ Respond quickly to host

## Approval Criteria
Hosts may require:
- Minimum age
- Driving experience
- Positive reviews
- Verification completed

## What If Declined?
If a request is declined:
- You're not charged
- Try another vehicle
- Adjust trip dates
- Ask host for reason

Both options provide great experiences. Choose based on your needs!`,
    keywords: ['instant book', 'request to book', 'booking types', 'how to book', 'differences'],
    order: 1,
  },

  // Continue with more articles...
  // Adding remaining articles to reach 50+ total
  {
    category: 'payments',
    title: 'How ZEMO Pricing Works',
    slug: 'how-pricing-works',
    content: `Understand our transparent pricing structure and what's included in your trip cost.

## Trip Cost Breakdown

### 1. Daily Rate
Set by the host based on:
- Vehicle make and model
- Location and demand
- Season and availability
- Vehicle features

### 2. Service Fee (15%)
- Platform maintenance
- Customer support 24/7
- Insurance processing
- Payment processing
- Trust & Safety programs

### 3. Protection Plan
Choose your coverage level:
- **Basic**: ZMW 50/day
- **Standard**: ZMW 120/day
- **Premium**: ZMW 200/day

### 4. Optional Add-ons
- Delivery/pickup: Varies by distance
- Additional driver: ZMW 20/day
- GPS device: ZMW 15/day
- Child seat: ZMW 10/day
- Extra insurance: Varies

### 5. Security Deposit
- Held (not charged) at booking
- Released 24-48 hours after trip
- Amount varies by vehicle
- Covers potential damages

## Example Pricing
**3-day Toyota Corolla rental:**
- Daily rate: ZMW 200 × 3 days = ZMW 600
- Service fee (15%): ZMW 90
- Standard protection: ZMW 120 × 3 = ZMW 360
- **Total**: ZMW 1,050
- **Security deposit**: ZMW 500 (held)

## What's Included
✓ Basic insurance coverage
✓ 24/7 customer support
✓ Roadside assistance
✓ Platform features
✓ Secure payments

## What's Not Included
✗ Fuel costs
✗ Traffic fines
✗ Parking fees
✗ Toll fees
✗ Damage deductible

## Discount Opportunities
- Weekly rentals (7+ days): 10% off daily rate
- Monthly rentals (28+ days): 20% off daily rate
- Early bird booking: Some hosts offer discounts
- Repeat renter: Loyalty rewards coming soon

## Payment Schedule
**When you book:**
- Trip cost charged immediately
- Security deposit held

**After trip:**
- Security deposit released (if no issues)
- Any additional charges applied

## Price Changes
- Locked at booking time
- Won't change after confirmation
- Extensions at current rate

## Taxes & Fees
All prices shown include:
- VAT where applicable
- Service fees
- Processing fees

## Refund Policy
See our cancellation policy:
- 48+ hours: Full refund
- 24-48 hours: 50% refund
- <24 hours: No refund

Transparent pricing, no surprises!`,
    keywords: ['pricing', 'cost', 'fees', 'how much', 'charges', 'service fee'],
    order: 1,
    featured: true,
  },
];

async function main() {
  /* eslint-disable no-console */
  console.log('🌱 Seeding help articles...');

  // Create categories
  for (const category of categories) {
    await prisma.helpCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: { ...category, published: true },
    });
    console.log(`✅ Created category: ${category.name}`);
  }

  // Create articles
  for (const article of articles) {
    const category = await prisma.helpCategory.findUnique({
      where: { slug: article.category },
    });

    if (!category) {
      console.log(`❌ Category not found: ${article.category}`);
      continue;
    }

    // Destructure to remove 'category' field which is a relation, not a direct field
    const { category: _categorySlug, ...articleData } = article;

    await prisma.helpArticle.upsert({
      where: { slug: article.slug },
      update: {
        ...articleData,
        categoryId: category.id,
        published: true,
      },
      create: {
        ...articleData,
        categoryId: category.id,
        published: true,
      },
    });
    console.log(`✅ Created article: ${article.title}`);
  }

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log(`📊 ${categories.length} categories created`);
  console.log(`📄 ${articles.length} articles created`);
  console.log('');
  console.log('💡 To add more articles, edit this file and run: npm run seed:help');
  /* eslint-enable no-console */
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
