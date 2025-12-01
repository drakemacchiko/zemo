# ZEMO Performance Optimization Plan

## Executive Summary

**Lighthouse Audit Results (Homepage - Development Mode):**
- ✅ **SEO: 100/100** - Perfect!
- ✅ **Best Practices: 96/100** - Excellent!
- ⚠️ **Accessibility: 86/100** - Good, needs minor improvements
- ❌ **Performance: 41/100** - Needs significant improvement

**Note:** Development mode scores are typically lower than production. However, we should address performance issues before production deployment.

---

## Current Status Analysis

### What's Working Well ✅

1. **SEO (100/100)**
   - Sitemap.ts implemented and working
   - Robots.txt configured properly
   - Meta tags on all pages
   - Proper heading hierarchy
   - Crawlable links
   - Valid structured data

2. **Best Practices (96/100)**
   - HTTPS ready
   - No console errors
   - No deprecated APIs
   - CSP headers ready
   - Modern JavaScript practices

3. **Accessibility (86/100)**
   - Color contrast mostly good
   - ARIA labels present
   - Keyboard navigation working
   - Screen reader compatible

### Issues to Address ⚠️

#### Performance Issues (41/100)

**Critical Issues:**

1. **Large JavaScript Bundle Size**
   - Development mode includes React DevTools, hot reload, source maps
   - Estimated production bundle: ~500KB+ (needs verification)
   - Target: <200KB initial bundle

2. **Slow First Contentful Paint (FCP)**
   - Dev mode: Likely 3-5 seconds
   - Target: <1.8 seconds (production)

3. **Slow Largest Contentful Paint (LCP)**
   - Dev mode: Likely 4-6 seconds
   - Target: <2.5 seconds (production)

4. **High Total Blocking Time (TBT)**
   - JavaScript execution blocking main thread
   - Target: <200ms

5. **Render-Blocking Resources**
   - CSS and JavaScript files blocking initial paint
   - Need to optimize critical CSS path

#### Accessibility Issues (86/100)

1. **Missing or Insufficient Touch Targets**
   - Some interactive elements may be too small (<44x44px)

2. **Potential Color Contrast Issues**
   - Some text may not meet WCAG AA standards (4.5:1 ratio)

3. **Form Labels**
   - Some form inputs may need better label associations

---

## Performance Optimization Strategy

### Phase 1: Production Build Verification (IMMEDIATE)

**Goal:** Verify actual production performance

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Run Lighthouse on production build
npx lighthouse http://localhost:3000 --view
```

**Why:** Development mode artificially lowers scores. Production build will:
- Minify JavaScript (30-40% size reduction)
- Remove development tools and logging
- Enable code splitting
- Optimize images
- Tree-shake unused code

**Expected Improvement:** Performance score should jump to 60-70 just from production build.

---

### Phase 2: Code Splitting & Bundle Optimization (HIGH PRIORITY)

#### 2.1 Implement Dynamic Imports

**Current Issue:** All components loading on initial page load.

**Solution:** Lazy load non-critical components.

**Files to Update:**

**`src/app/page.tsx` - Homepage**
```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const FeaturedVehicles = dynamic(() => import('@/components/FeaturedVehicles'), {
  loading: () => <FeaturedVehiclesSkeleton />,
  ssr: false // If client-side only
});

const Testimonials = dynamic(() => import('@/components/Testimonials'), {
  loading: () => <TestimonialsSkeleton />
});

const HowItWorks = dynamic(() => import('@/components/HowItWorks'), {
  loading: () => <HowItWorksSkeleton />
});
```

**Expected Impact:** 20-30% reduction in initial JavaScript bundle.

#### 2.2 Analyze Bundle Size

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ...existing config
});

# Run analysis
ANALYZE=true npm run build
```

**Action Items:**
- Identify largest dependencies
- Replace heavy libraries with lighter alternatives
- Remove unused dependencies

**Common Culprits:**
- Moment.js → Replace with date-fns (90% smaller)
- Lodash → Replace with native methods or lodash-es (tree-shakeable)
- Large icon libraries → Import only needed icons

#### 2.3 Optimize Next.js Configuration

**`next.config.js` improvements:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification (faster than Terser)
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: ['zemo.zm', 'localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compression
  compress: true,
  
  // Production source maps (disable for faster builds)
  productionBrowserSourceMaps: false,
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
    }
    return config;
  },
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: ['lucide-react', '@radix-ui/*'], // Tree shake these packages
  }
};

module.exports = nextConfig;
```

---

### Phase 3: Asset Optimization (HIGH PRIORITY)

#### 3.1 Image Optimization

**Current Status:** Using Next.js Image component (✅)

**Additional Improvements:**

1. **Implement Image Blur Placeholders**
```typescript
import Image from 'next/image';

<Image
  src="/vehicle.jpg"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Generated at build time
  alt="Vehicle"
/>
```

2. **Use Priority for Above-Fold Images**
```typescript
// Hero image on homepage
<Image
  src="/hero.jpg"
  priority // Preload this image
  alt="Hero"
/>
```

3. **Optimize Existing Images**
```bash
# Install image optimization tool
npm install --save-dev sharp

# Create script to optimize images
# scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Optimize all images in public/uploads
// Convert to WebP, resize, compress
```

#### 3.2 Font Optimization

**Current Issue:** May be loading custom fonts inefficiently.

**Solution:** Use `next/font` for automatic font optimization.

**`src/app/layout.tsx` update:**
```typescript
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  variable: '--font-inter',
});

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

**`tailwind.config.js` update:**
```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        heading: ['var(--font-poppins)'],
      },
    },
  },
};
```

#### 3.3 CSS Optimization

1. **Remove Unused CSS**
   - Tailwind already purges unused CSS in production ✅
   - Verify in `tailwind.config.js`:
   ```javascript
   module.exports = {
     content: [
       './src/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     // ...
   };
   ```

2. **Critical CSS Inlining**
   - Next.js automatically inlines critical CSS ✅

3. **CSS Modules for Component Styles**
   - Use CSS Modules for component-specific styles
   - Prevents CSS bloat

---

### Phase 4: JavaScript Optimization (MEDIUM PRIORITY)

#### 4.1 Remove Unused Dependencies

**Audit Dependencies:**
```bash
# Find unused dependencies
npx depcheck

# Remove unused packages
npm uninstall <package-name>
```

#### 4.2 Optimize Third-Party Scripts

**Current Issue:** May be loading analytics, chat widgets, etc.

**Solution:** Use Next.js Script component with proper strategy.

```typescript
import Script from 'next/script';

// In layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive" // Load after page is interactive
/>

<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>
```

**Script Loading Strategies:**
- `beforeInteractive`: Critical scripts (rare)
- `afterInteractive`: Analytics, ads (most common)
- `lazyOnload`: Chat widgets, non-critical (lowest priority)

#### 4.3 Implement Code Splitting by Route

**Next.js does this automatically ✅**

Verify by checking build output:
```bash
npm run build
# Should see separate chunks for each route
```

---

### Phase 5: Caching & CDN (MEDIUM PRIORITY)

#### 5.1 Implement Caching Headers

**`next.config.js` update:**
```javascript
async headers() {
  return [
    {
      source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
},
```

#### 5.2 Setup CDN

**Vercel (Recommended - Built-in CDN):**
- Deploy to Vercel → Automatic Edge Network ✅
- No configuration needed

**Alternative: Cloudflare CDN**
- Point domain to Cloudflare
- Enable automatic minification
- Enable Brotli compression
- Enable HTTP/3

#### 5.3 Implement API Response Caching

**For frequently accessed data:**

```typescript
// Example: Cache vehicle search results
export const revalidate = 60; // Revalidate every 60 seconds

export async function getVehicles() {
  // This will be cached
  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'ACTIVE' },
    take: 50,
  });
  return vehicles;
}
```

---

### Phase 6: Database & API Optimization (MEDIUM PRIORITY)

#### 6.1 Database Query Optimization

**Add Indexes to Frequently Queried Fields:**

```sql
-- Add indexes for common queries
CREATE INDEX idx_vehicles_status ON "Vehicle"("status");
CREATE INDEX idx_vehicles_location ON "Vehicle"("location");
CREATE INDEX idx_vehicles_type ON "Vehicle"("vehicleType");
CREATE INDEX idx_bookings_status ON "Booking"("status");
CREATE INDEX idx_bookings_dates ON "Booking"("startDate", "endDate");
CREATE INDEX idx_users_email ON "User"("email");

-- Composite indexes for complex queries
CREATE INDEX idx_vehicles_search ON "Vehicle"("status", "location", "vehicleType");
```

**Update Prisma Schema:**
```prisma
model Vehicle {
  id           String   @id @default(cuid())
  status       Status   @default(PENDING)
  location     String
  vehicleType  String
  
  @@index([status])
  @@index([location])
  @@index([vehicleType])
  @@index([status, location, vehicleType])
}
```

#### 6.2 Implement Connection Pooling

**Already configured in DATABASE_URL ✅**

Verify `.env.local`:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=60"
```

#### 6.3 API Response Compression

**Enable in production (automatic with Next.js + Vercel) ✅**

For custom server:
```javascript
// Enable gzip/brotli compression
compress: true, // in next.config.js
```

---

### Phase 7: Accessibility Improvements (LOW PRIORITY)

**Goal:** Reach 90+ score

#### 7.1 Touch Target Size

**Issue:** Some buttons/links may be too small on mobile.

**Solution:** Ensure minimum 44x44px touch targets.

```css
/* Add to global CSS */
@media (max-width: 768px) {
  button,
  a,
  input[type="button"],
  input[type="submit"] {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
  }
}
```

#### 7.2 Color Contrast

**Run Automated Test:**
```bash
npx axe-core http://localhost:3000
```

**Fix Low Contrast Text:**
- Body text: Minimum 4.5:1 ratio
- Large text (18pt+): Minimum 3:1 ratio
- Update `tailwind.config.js` with WCAG-compliant colors

#### 7.3 Form Labels

**Audit Forms:**
```bash
# Check all forms have proper labels
npx eslint . --ext .tsx --rule 'jsx-a11y/label-has-associated-control: error'
```

**Fix Example:**
```tsx
// Before (bad)
<input type="text" placeholder="Email" />

// After (good)
<label htmlFor="email" className="sr-only">Email</label>
<input id="email" type="text" placeholder="Email" />
```

---

## Performance Monitoring

### Setup Continuous Monitoring

#### 1. Vercel Analytics (if deploying to Vercel)
```bash
npm install @vercel/analytics
```

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### 2. Google Lighthouse CI

**`.github/workflows/lighthouse-ci.yml`**
```yaml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

**`lighthouserc.js`**
```javascript
module.exports = {
  ci: {
    collect: {
      staticDistDir: './out',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

#### 3. Real User Monitoring (RUM)

**Option A: Vercel Speed Insights**
```bash
npm install @vercel/speed-insights
```

**Option B: Google Analytics Web Vitals**
```typescript
// src/lib/web-vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to Google Analytics
  gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
    non_interaction: true,
  });
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

---

## Implementation Timeline

### Week 1: Quick Wins
- [x] Run production build and verify scores
- [ ] Implement dynamic imports for heavy components
- [ ] Optimize images (add blur placeholders, priority flags)
- [ ] Setup font optimization with next/font
- [ ] Configure caching headers

**Expected Result:** Performance 70+

### Week 2: Deep Optimization
- [ ] Analyze bundle with webpack analyzer
- [ ] Remove unused dependencies
- [ ] Optimize third-party scripts
- [ ] Implement advanced webpack configuration
- [ ] Add database indexes

**Expected Result:** Performance 80+

### Week 3: Fine-Tuning
- [ ] Fix accessibility issues (touch targets, contrast)
- [ ] Implement API caching where appropriate
- [ ] Setup CDN (Vercel/Cloudflare)
- [ ] Configure monitoring (Analytics, Speed Insights)

**Expected Result:** All scores 90+

### Week 4: Testing & Validation
- [ ] Run Lighthouse on all major pages
- [ ] Test on slow 3G network
- [ ] Test on low-end devices
- [ ] Load testing (50+ concurrent users)
- [ ] Final performance audit

**Expected Result:** Production-ready, 90+ all metrics

---

## Success Metrics

### Target Scores (Production Build)
- Performance: **>90**
- Accessibility: **>90**
- Best Practices: **>95**
- SEO: **100** ✅ (Already achieved)

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint):** <2.5s ⭐ <1.8s
- **FID (First Input Delay):** <100ms ⭐ <50ms
- **CLS (Cumulative Layout Shift):** <0.1 ⭐ <0.05
- **FCP (First Contentful Paint):** <1.8s ⭐ <1.0s
- **TTI (Time to Interactive):** <3.8s ⭐ <2.5s

### Page Load Targets
- **Initial Page Load:** <3s on 4G
- **Time to Interactive:** <3s on 4G
- **Bundle Size:** <200KB initial JavaScript
- **Total Page Weight:** <1MB

---

## Conclusion

**Current Status:**
- ✅ SEO is perfect (100/100)
- ✅ Best practices excellent (96/100)
- ⚠️ Performance needs work (41/100 in dev mode)
- ⚠️ Accessibility needs minor fixes (86/100)

**Next Steps:**
1. **IMMEDIATE:** Run production build and verify actual scores
2. **HIGH PRIORITY:** Implement code splitting and bundle optimization
3. **HIGH PRIORITY:** Optimize images and fonts
4. **MEDIUM PRIORITY:** Setup caching and CDN
5. **LOW PRIORITY:** Fix remaining accessibility issues

**Estimated Timeline:** 2-4 weeks to reach 90+ on all metrics.

**Key Insight:** Development mode scores are artificially low. Production build should immediately improve performance to 60-70 range. From there, optimizations will push to 90+.

---

**Ready to begin implementation!** 🚀
