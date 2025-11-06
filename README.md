# ZEMO PWA - Car Rental Marketplace

> **ZEMO** - Car rental marketplace PWA for Zambia, connecting car owners with renters through a secure, mobile-first platform.

![ZEMO](https://img.shields.io/badge/ZEMO-PWA-FFD400?style=for-the-badge&logo=car&logoColor=0A0A0A)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.3-38bdf8?style=flat-square&logo=tailwindcss)

## 🚗 About ZEMO

ZEMO is a Progressive Web Application (PWA) that creates a peer-to-peer car rental marketplace specifically designed for the Zambian market. The platform enables car owners to list their vehicles and earn income while providing renters with convenient access to quality vehicles.

### Key Features (Planned)
- 📱 **Progressive Web App** - Works offline, installable on mobile devices
- 🔐 **Secure Authentication** - Email + SMS OTP verification with KYC
- 🚙 **Vehicle Management** - Photo uploads, verification workflow
- 📅 **Smart Booking** - Real-time availability, dynamic pricing
- 💳 **Local Payments** - Mobile Money (Airtel, MTN, Zamtel) + Cards
- 🛡️ **Insurance Integration** - Comprehensive coverage options
- 📍 **GPS Tracking** - Location services and geofencing
- 🌍 **Multi-Language** - English, Bemba, Nyanja support

## 🏗️ Development Status

**Current Phase:** ✅ Phase 1 - Project Foundation Complete  
**Next Phase:** 🚧 Phase 2 - Authentication & User Profiles

### Phase 1 Achievements ✅
- ✅ Next.js 14 + TypeScript setup with App Router
- ✅ ZEMO Design System (Yellow #FFD400 + Black #0A0A0A)
- ✅ Responsive Header/Footer with mobile navigation
- ✅ PWA configuration with service worker placeholder
- ✅ Testing infrastructure (Jest + React Testing Library)
- ✅ Code quality tools (ESLint + Prettier + Husky)
- ✅ Production deployment configuration (Vercel)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd zemo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run type-check   # TypeScript checking

# Building
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 🎨 Design System

ZEMO uses a custom design system built on Tailwind CSS:

### Brand Colors
```css
--zemo-yellow: #FFD400;  /* Primary brand color */
--zemo-black: #0A0A0A;   /* Text and accent color */
```

### Typography
- **Headings:** Font weight 900 (very bold)
- **Body:** Font weight 500 (medium)

### Design Tokens
- **Border Radius:** 8px
- **Spacing Scale:** 4px, 8px, 16px, 24px, 32px

### Usage
```tsx
// CSS Variables
<div className="bg-zemo-yellow text-zemo-black rounded-zemo">
  <h1 className="font-heading">ZEMO</h1>
  <p className="font-body">Your description</p>
</div>

// Or with Tailwind classes
<button className="bg-yellow-400 text-black font-black rounded-lg">
  Get Started
</button>
```

## 🧪 Testing

The project uses Jest and React Testing Library for testing:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test Header.test.tsx
```

### Current Test Coverage
- ✅ Header Component (6 test cases)
- 🎯 Target: 90%+ coverage for all new code

## 🏗️ Project Structure

```
zemo/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── layout/          # Layout components
│   │   └── sections/        # Page sections
│   ├── lib/                 # Utility functions
│   └── styles/              # Global styles
├── docs/                    # Documentation
├── public/                  # Static assets
├── tests/                   # Test utilities
└── config files             # Various config files
```

## 🔧 Technical Stack

### Core Technologies
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.2
- **Styling:** Tailwind CSS 3.3
- **Database:** TBD (Phase 2 - likely PostgreSQL + Prisma)
- **Authentication:** TBD (Phase 2 - NextAuth.js or custom JWT)

### Development Tools
- **Testing:** Jest + React Testing Library
- **Linting:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged
- **Package Manager:** npm
- **Deployment:** Vercel (configured)

### Future Integrations (Planned)
- **Payments:** Stripe, DPO, Mobile Money APIs
- **Maps:** Google Maps API
- **SMS:** Twilio
- **Storage:** Cloudinary
- **Monitoring:** Sentry

## 🌍 Zambian Market Focus

ZEMO is specifically designed for the Zambian market with:

- **Mobile Money Integration** - Airtel Money, MTN Mobile Money, Zamtel Kwacha
- **Local Language Support** - English, Bemba (Ichibemba), Nyanja (Chinyanja)  
- **Regulatory Compliance** - PACRA, ZRA, Bank of Zambia requirements
- **Mobile-First Design** - Optimized for 3G networks and budget smartphones
- **Cultural Adaptation** - UI/UX tailored for local user preferences

## 📱 Progressive Web App Features

- ✅ **Installable** - Add to home screen on mobile devices
- ✅ **Offline Support** - Core functionality works without internet
- ✅ **Responsive** - Works on any screen size
- ✅ **Fast Loading** - Optimized for slow networks
- 🚧 **Push Notifications** - Coming in Phase 9
- 🚧 **Background Sync** - Coming in Phase 11

## 🚦 Development Phases

### ✅ Phase 1 - Foundation (COMPLETE)
- Project setup, design system, basic layout

### 🚧 Phase 2 - Authentication (NEXT)
- User registration, login, KYC document upload

### 📋 Upcoming Phases
- **Phase 3:** Vehicle Management & Listing
- **Phase 4:** Booking Engine Core  
- **Phase 5:** Payments & Financial Flows
- **Phase 6:** Insurance & Claims Workflow
- **Phase 7:** Vehicle Handover & Return
- **Phase 8:** Search, Filters & Performance
- **Phase 9:** Messaging & Notifications
- **Phase 10:** Admin Dashboard & Analytics
- **Phase 11:** PWA Polish & Accessibility
- **Phase 12:** Production Launch

## 🤝 Contributing

This is currently a private development project. Contributing guidelines will be added in future phases.

## 📄 License

Private - All rights reserved. License information will be updated before public release.

## 📞 Contact & Support

For development questions or business inquiries:
- 📧 Email: [To be added]
- 🌐 Website: [To be added]
- 📱 WhatsApp: [To be added]

---

**ZEMO** - Driving Zambia Forward 🇿🇲

*Built with ❤️ for the Zambian market*