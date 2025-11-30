import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ThumbsUp, ThumbsDown, Phone, Mail } from 'lucide-react';

// This would come from database in production
interface Article {
  id: string;
  title: string;
  content: string;
  category: {
    name: string;
    slug: string;
  };
  views: number;
  helpful: number;
  notHelpful: number;
  updatedAt: string;
}

// Mock data - replace with actual database query
const getArticle = async (_slug: string): Promise<Article | null> => {
  // TODO: Replace with Prisma query
  // const article = await prisma.helpArticle.findUnique({
  //   where: { slug: _slug, published: true },
  //   include: { category: true }
  // });
  
  return {
    id: '1',
    title: 'How to Book Your First Car',
    content: `
## Finding the Perfect Car

Start by browsing our extensive collection of vehicles. Use the search filters to narrow down by:
- **Location**: Choose pickup location
- **Dates**: Select trip start and end dates
- **Vehicle Type**: SUV, Sedan, Truck, etc.
- **Price Range**: Set your budget
- **Features**: Automatic transmission, GPS, etc.

## Understanding Instant Book vs Request to Book

### Instant Book
- Book immediately without host approval
- Instant confirmation
- Perfect for last-minute trips
- Look for the lightning bolt icon ⚡

### Request to Book
- Host reviews your request first
- Response within 24 hours
- Host can accept or decline
- Better for special requests

## Making a Booking Request

1. **Review Vehicle Details**
   - Read the full description
   - Check included features
   - View all photos
   - Read host reviews

2. **Check Availability**
   - Select your dates on the calendar
   - Green dates = available
   - Red dates = booked

3. **Review Pricing**
   - Daily rate
   - Service fee
   - Protection plan
   - Total cost breakdown

4. **Add Trip Details**
   - Purpose of trip (optional)
   - Message to host
   - Special requests

5. **Choose Protection Plan**
   - **Basic**: ZMW 50/day - Standard coverage
   - **Standard**: ZMW 120/day - Enhanced coverage
   - **Premium**: ZMW 200/day - Maximum protection

6. **Payment Information**
   - Credit/debit card
   - Mobile money
   - Security deposit (held, not charged)

7. **Review and Confirm**
   - Double-check all details
   - Read cancellation policy
   - Click "Request to Book" or "Book Instantly"

## After Booking

You'll receive:
- Email confirmation with booking details
- Host contact information
- Pickup instructions
- Trip checklist

**What happens next?**
- For Instant Book: You're confirmed! 🎉
- For Request: Host has 24 hours to respond
- You'll get notification of host's decision

## Pre-Trip Communication

- Message your host with any questions
- Confirm pickup time and location
- Ask about vehicle features
- Discuss any special needs

## Pickup Day Preparation

**Bring with you:**
- Valid driver's license
- Government-issued ID
- Payment method for security deposit
- Phone for ZEMO app

**Inspection Checklist:**
- Walk around vehicle with host
- Document any existing damage (photos)
- Check fuel level
- Verify mileage
- Test all features (lights, AC, etc.)
- Sign rental agreement in app

## Need Help?

If you have questions during booking:
- Check our FAQs
- Message the host
- Contact ZEMO support: support@zemo.zm
- Call us: +260 XXX XXXXXX (24/7)

## Tips for First-Time Renters

✅ **Do:**
- Book in advance for better selection
- Read host reviews carefully
- Communicate clearly with host
- Document vehicle condition
- Return on time and with same fuel level

❌ **Don't:**
- Book without reading full description
- Skip the pre-trip inspection
- Ignore host's rules
- Return late without notice
- Leave vehicle dirty

## Common Questions

**Q: When will I be charged?**
A: You're charged when booking is confirmed. Security deposit is held (not charged) and released 24-48 hours after trip.

**Q: Can I cancel?**
A: Yes! Cancellation policy varies:
- 48+ hours before: Full refund
- 24-48 hours: 50% refund  
- Less than 24 hours: No refund

**Q: What if host declines?**
A: You won't be charged. Search for another vehicle or try different dates.

**Q: Can I extend my trip?**
A: Yes, if vehicle is available. Request extension through app or contact host directly.

**Q: What's included in insurance?**
A: All trips include basic liability coverage. Choose higher protection plans for lower deductibles and better coverage.

## Still Need Help?

Can't find what you're looking for? We're here to help!

- **Submit a ticket**: Get detailed assistance
- **Call us**: +260 XXX XXXXXX (24/7)
- **Email**: support@zemo.zm
- **Live chat**: Available 8 AM - 8 PM

---

*Last updated: November 2025*
`,
    category: {
      name: 'Booking & Trips',
      slug: 'booking-trips',
    },
    views: 1247,
    helpful: 89,
    notHelpful: 12,
    updatedAt: '2025-11-15',
  };
};

// Mock related articles
const getRelatedArticles = async (_categorySlug: string, _currentSlug: string) => {
  return [
    {
      slug: 'understanding-instant-book',
      title: 'Understanding Instant Book vs Request to Book',
      views: 856,
    },
    {
      slug: 'what-to-bring-pickup',
      title: 'What to Bring When Picking Up a Car',
      views: 743,
    },
    {
      slug: 'pre-trip-inspection',
      title: 'Pre-Trip Vehicle Inspection Guide',
      views: 621,
    },
  ];
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  
  return {
    title: article?.title || 'Help Article | ZEMO',
    description: `Learn about ${article?.title.toLowerCase()} on ZEMO`,
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The help article you're looking for doesn't exist.</p>
          <Link href="/support" className="text-blue-600 hover:underline">
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  const relatedArticles = await getRelatedArticles(article.category.slug, params.slug);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/support" className="text-blue-600 hover:underline">
              Help Center
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/support/category/${article.category.slug}`} className="text-blue-600 hover:underline">
              {article.category.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-xl shadow-sm p-8">
              {/* Article Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{article.views.toLocaleString()} views</span>
                  <span>•</span>
                  <span>Updated {new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Article Content */}
              <div className="prose prose-blue max-w-none">
                <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }} />
              </div>

              {/* Feedback Section */}
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Was this article helpful?</h3>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">
                    <ThumbsUp className="w-5 h-5" />
                    <span>Yes ({article.helpful})</span>
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition">
                    <ThumbsDown className="w-5 h-5" />
                    <span>No ({article.notHelpful})</span>
                  </button>
                </div>
              </div>

              {/* Still Need Help */}
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Still need help?</h3>
                <p className="text-gray-600 mb-4">Can't find what you're looking for? Contact our support team.</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/support/contact" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Mail className="w-4 h-4" />
                    Submit a Ticket
                  </Link>
                  <a href="tel:+260XXXXXXXXX" className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition">
                    <Phone className="w-4 h-4" />
                    Call Support
                  </a>
                </div>
              </div>
            </article>

            {/* Related Articles */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="space-y-4">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/support/articles/${related.slug}`}
                    className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{related.title}</h3>
                    <p className="text-sm text-gray-500">{related.views.toLocaleString()} views</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need More Help?</h3>
              <div className="space-y-4">
                <Link href="/support" className="block text-blue-600 hover:underline">
                  ← Back to Help Center
                </Link>
                <Link href="/support/search" className="block text-blue-600 hover:underline">
                  Search All Articles
                </Link>
                <Link href="/support/contact" className="block text-blue-600 hover:underline">
                  Contact Support
                </Link>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">24/7 Support</p>
                  <a href="tel:+260XXXXXXXXX" className="text-sm font-medium text-blue-600 hover:underline">
                    +260 XXX XXXXXX
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
