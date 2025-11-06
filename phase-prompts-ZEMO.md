# ZEMO — Phase-by-Phase AI Agent Prompts

Purpose: A single-file, session‑independent set of phase prompts you can hand to an AI agent to develop the ZEMO PWA. Each phase is self‑contained, includes prerequisites, exact artifacts to produce, acceptance criteria, tests, commit/PR guidance, and a verification checklist to keep the agent consistent across sessions.

Design tokens (use in UI):
- Primary color (Yellow): #FFD400
- Accent / text color (Black): #0A0A0A
- Heading font-weight: 900 (very bold)
- Body font-weight: 500
- Rounded corners: 8px
- Spacing scale: 4 / 8 / 16 / 24 / 32

Visual guidance: thick bold titles, high contrast Yellow on Black call-to-actions. Provide both CSS variables and Tailwind tokens in produced code.

CSS snippet (to copy):

```css
:root {
  --zemo-yellow: #FFD400;
  --zemo-black: #0A0A0A;
  --zemo-heading-weight: 900;
  --zemo-body-weight: 500;
  --zemo-radius: 8px;
}

/* Tailwind config suggestion (extend):
  theme: { extend: { colors: { zemo: { yellow: '#FFD400', black: '#0A0A0A' } }, fontWeight: { heading: 900 } } }
*/
```

---

How to use this file with an AI agent:

**SESSION START PROTOCOL:**
1. Feed the agent the "Session Handover Protocol" section FIRST
2. Agent MUST run state validation commands and report PASS/FAIL
3. Only proceed to phase work after validation passes

**PHASE EXECUTION:**
- Feed only one phase prompt at a time
- Require agent to return:
  - ✅ List of files to change/create (exact paths)
  - ✅ Complete file contents or git-style diffs
  - ✅ Tests added with coverage report
  - ✅ Verification commands to run locally
  - ✅ `docs/phase-<n>-completion.md` summary file
  - ✅ Updated README.md section for new features

**QUALITY GATES (agent must report PASS/FAIL):**
```powershell
npm run build    # Must pass
npm run lint     # Must pass
npm run test     # Must pass, 90%+ coverage
```

**COMMIT REQUIREMENTS:**
- Branch: `phase-<n>-<short-desc>`
- Commit: `phase-<n>: <description>`
- PR title: `Phase <n> - <description>`
- PR must include verification commands in description

**EMERGENCY PROTOCOLS:**
If agent reports issues, refer them to "Debug/Recovery Commands" section.

---

PHASE 1 — Project Foundation & Minimal PWA Shell

Goal: Create the base Next.js TypeScript PWA project with build/test pipelines, basic layout, theme tokens (yellow/black), and CI that runs lint/test/build.

Prerequisites: None.

Deliverables (exact):
- package.json (scripts: dev, build, start, lint, test)
- tsconfig.json
- next.config.js with basic PWA config (service worker placeholder)
- Tailwind config with ZEMO colors
- /app layout (header, footer) using design tokens
- README.md with run steps
- Git commit: `phase-1: init project, pwa shell, theme tokens`

Acceptance criteria:
- yarn/npm install completes
- `npm run build` completes without errors
- `npm run lint` passes
- Basic page renders with header branded Yellow on Black

Tests:
- Add minimal Jest test for the header component.

Verification commands (agent must output):
```powershell
# from repo root
npm ci
npm run build
npm run lint
npm test -- --watchAll=false
```

Notes to agent:
- Keep serverless functions minimal (no external integrations yet).
- Create a `.env.example` with placeholders.
- If using Vercel, include `vercel.json` with build settings.

---

PHASE 2 — Authentication & User Profiles

Goal: Implement secure auth (email + phone OTP), user profiles, and KYC document upload endpoints (API + minimal UI flows).

Prerequisites: Phase 1 complete.

Deliverables:
- NextAuth or custom JWT auth (server API endpoints) with secure password hashing
- API: POST /api/auth/register, POST /api/auth/login, POST /api/auth/verify-phone (OTP), POST /api/auth/upload-docs
- DB migrations / Prisma schema changes (users, user_profiles, driving_licenses)
- Frontend pages: /register, /login, /profile (upload docs)
- Simple mock SMS OTP provider for dev (log OTP to server console) and instructions to replace with Twilio
- Tests: unit tests for auth functions, integration test for register/login flow
- Commit: `phase-2: auth and profiles`

Acceptance criteria:
- Registration and login flows work end-to-end in development
- Uploaded KYC docs store URLs (local storage or dev bucket)
- JWT tokens issued with refresh tokens
- `npm test` passes

Verification commands:
```powershell
npm run dev         # run app
# then run API integration tests
npm test -- -t "auth"
```

Agent instructions:
- Use Zod schemas for validation and include tests for validation failures
- Keep secrets in `.env` and do not commit them
- Add endpoint `GET /api/auth/me` returning current user (protected)
- Create `docs/phase-2-completion.md` documenting all auth endpoints and schemas
- Add auth middleware pattern that other phases can reuse
- Include password strength validation (min 8 chars, special chars)
- Rate limit auth endpoints (5 attempts per 15min per IP)

---

PHASE 3 — Vehicle Management & Listing

Goal: Implement vehicle registry, photo uploads (Cloudinary or local dev storage), and admin verification workflow.

Prerequisites: Phase 1, Phase 2.

Deliverables:
- Prisma models / migrations for vehicles, vehicle_documents, vehicle_photos (match main spec)
- API: CRUD endpoints for vehicles and `POST /api/vehicles/:id/photos`
- UI: Host dashboard to create a vehicle listing and upload photos
- Image optimization pipeline (responsive sizes + webp)
- Admin interface (or API) to approve/reject vehicle listings
- Tests: unit and integration tests for vehicle CRUD
- Commit: `phase-3: vehicle registry and uploads`

Acceptance criteria:
- Host can create a listing, upload photos, and see 'pending' verification
- Admin can approve and listing becomes `AVAILABLE`
- Photos optimized and accessible

Verification commands:
```powershell
npm run dev
npm test -- -t "vehicle"
# Scripts to run image optimization tasks if included
```

Agent instructions:
- Use signed upload URLs for production buckets; dev can use direct uploads to Cloudinary or local storage
- Validate unique plate numbers and required vehicle fields
- Follow auth patterns from Phase 2 for protected routes
- Create reusable image upload component for future phases
- Add vehicle schema validation matching the main technical spec
- Document API patterns in `docs/phase-3-completion.md`
- Add vehicle search indexes for future search optimization

---

PHASE 4 — Booking Engine Core

Goal: Build booking flows, availability calendar, pricing engine basics (per-day), and booking database integrity checks.

Prerequisites: Phases 1-3.

Deliverables:
- Booking API endpoints: POST /api/bookings, GET /api/bookings/:id, GET /api/bookings (user), PUT /api/bookings/:id (modify)
- Availability calculation logic that prevents double-booking (transactional)
- Calendar component on vehicle page (shows available slots)
- Pricing engine: base daily rate + simple multipliers (weekday/weekend)
- Tests: concurrency tests to ensure no double-booking
- Commit: `phase-4: booking engine core`

Acceptance criteria:
- Cannot create overlapping bookings for same vehicle (tested with concurrency test)
- Calendar reflects bookings in DB
- Booking total calculations are correct

Verification commands:
```powershell
npm run test -- -t "booking"
# optionally run a node script included by agent that simulates concurrent booking attempts
node scripts/test-concurrency.js
```

Agent instructions:
- Use DB transactions where available (Prisma/Postgres) and optimistic locking where needed.
- Return clear error codes for booking conflicts.

---

PHASE 5 — Payments & Financial Flows (Mobile Money + Cards)

Goal: Integrate mobile money sandbox (Airtel/MTN mocks) and card payments (DPO/Stripe sandbox tokenization). Support holds/escrow for security deposit.

Prerequisites: Phases 1-4.

Deliverables:
- Payment API: POST /api/payments/process, GET /api/payments/:id/status
- Sandbox adapters for Airtel/MTN (mocked endpoints that return success/failure)
- Card tokenization flow for DPO/Stripe (no card data stored)
- Escrow logic: hold deposit on booking creation, release on completion
- Reconciliation script to run periodically
- Tests: simulate success/failure/refund flows
- Commit: `phase-5: payments integration`

Acceptance criteria:
- Payment flows complete in sandbox and reflect correct booking statuses
- Security deposit holds and releases properly recorded
- Failures rollback booking where required

Verification commands:
```powershell
npm run test -- -t "payments"
node scripts/run-payment-scenarios.js
```

Agent instructions:
- NEVER store raw card numbers - use tokens only (PCI DSS compliance)
- Follow auth middleware patterns from Phase 2 for payment endpoints
- Create payment service abstraction layer for different providers
- Add payment audit logging for compliance
- Include webhook signature verification for payment callbacks
- Document payment flow diagrams in `docs/phase-5-completion.md`
- Add payment reconciliation scripts for production use
- Provide clear README section for swapping sandbox→production credentials

---

PHASE 6 — Insurance & Claims Workflow

Goal: Integrate insurance product selection at booking time and build claims intake workflow with docs and admin processing.

Prerequisites: Phases 1-5.

Deliverables:
- Insurance models and API endpoints to attach policies to bookings
- UI flow to select coverage during booking
- Claims API: POST /api/claims, PUT /api/claims/:id, GET /api/claims
- Admin claims dashboard (review images, police reports)
- Tests: claim creation and lifecycle
- Commit: `phase-6: insurance and claims`

Acceptance criteria:
- Users can select insurance options and see updated pricing
- Claims can be created with required docs and reviewed by admin

Verification commands:
```powershell
npm run test -- -t "claims"
```

Agent instructions:
- Mock insurer webhooks for status updates.
- Attach claim IDs to booking records and notify involved users.

---

PHASE 7 — Vehicle Handover / Return & Damage Assessment

Goal: Implement pre/post rental inspections (photo capture), damage report flow, automated damage scoring (rules-based initially), and deposit adjustments.

Prerequisites: Phases 1-6.

Deliverables:
- Handover endpoints: /api/bookings/:id/pickup and /api/bookings/:id/return
- Capture and store inspection photos and metadata (mileage, fuel)
- Simple damage scoring rules to estimate repair cost
- Admin dispute resolution endpoint/workflow
- Tests for handover/return flows
- Commit: `phase-7: handover and damage-assessment`

Acceptance criteria:
- Handover and return flows store all required metadata
- Damage scoring returns deterministic estimate
- Deposit adjustments are applied automatically when claim approved

Verification commands:
```powershell
npm run test -- -t "handover"
```

Agent instructions:
- Keep image sizes reasonable and require multiple angles.
- Provide a small script to bulk import sample inspection photos for testing.

---

PHASE 8 — Search, Filters & Performance Tuning

Goal: Implement robust search with geo-radius, filters, and server-side pagination. Optimize for 3G/2G networks.

Prerequisites: Phases 1-7.

Deliverables:
- /api/vehicles/search with radius, date availability filtering, paginated results
- Client search UI with debounced input and skeleton loaders
- Caching: Redis for hot searches and results
- Performance improvements: image lazy load, critical CSS
- Load test scripts
- Commit: `phase-8: search and perf`

Acceptance criteria:
- Search response <2s on simulated 3G (p95)
- Pagination and filters work and are tested

Verification commands:
```powershell
# Run load test (agent must include Artillery scripts)
npx artillery run load/search.yml
npm run test -- -t "search"
```

Agent instructions:
- Use geo-indexes in DB and paginate using cursor-based pagination for stability.

---

PHASE 9 — Messaging, Notifications & Support

Goal: Build real-time messaging between host and renter, push notifications, and support ticketing.

Prerequisites: Phases 1-8.

Deliverables:
- Real-time chat (WebSocket) or fallback polling API
- Email and SMS notification templates and API integration (Resend/Twilio placeholders)
- Support ticket API + UI
- Tests for message persistence and notifications
- Commit: `phase-9: messaging and support`

Acceptance criteria:
- Messages delivered and persisted
- Notifications sent for booking events and messages (sandbox)

Verification commands:
```powershell
npm run test -- -t "messaging"
```

Agent instructions:
- Always provide a fallback for real-time features (polling). Ensure privacy and rate limiting for messages.

---

PHASE 10 — Admin Dashboard & Analytics

Goal: Build admin dashboards for vehicles, bookings, payouts, claims, and staffing.

Prerequisites: Phases 1-9.

Deliverables:
- Admin UI with authentication and RBAC
- Pages: Vehicle management, Booking management, Claims management, Payments/payouts, User management
- Analytics: daily active users, bookings/day, revenue/day (simple charts)
- Tests for admin workflows
- Commit: `phase-10: admin dashboard`

Acceptance criteria:
- Admin pages show correct filtered data and allow actions (approve, refund)

Verification commands:
```powershell
npm run test -- -t "admin"
```

Agent instructions:
- Secure admin routes; require MFA for admin operations.

---

PHASE 11 — Offline, PWA polish & Accessibility

Goal: Complete offline-first features, service worker sync, push notifications, and meet basic accessibility (WCAG) standards.

Prerequisites: Phases 1-10.

Deliverables:
- Service worker caching strategies for app-shell and API data
- Background sync for queued actions (bookings/payments queued when offline)
- Add web-push notifications and subscription flows
- Accessibility fixes and audits (axe)
- Commit: `phase-11: pwa-offline-accessibility`

Acceptance criteria:
- App works offline for core flows (view saved bookings, create booking queued)
- Accessibility audit score improved and major issues fixed

Verification commands:
```powershell
# Lighthouse PWA & accessibility
npx lhci autorun --config=./lighthouseci.config.js
```

Agent instructions:
- Keep background sync simple and robust; fail gracefully.

---

PHASE 12 — Production Hardening & Launch

Goal: Final production readiness: harden security, run full load tests, finalize legal items, deployment infra and monitoring.

Prerequisites: Phases 1-11.

Deliverables:
- CI/CD pipeline (dev/staging/prod) with automated tests and security scans
- Infrastructure IaC (Terraform / CloudFormation snippets) or deployment docs
- Monitoring: Sentry, New Relic/DataDog, uptime checks
- Backup and DR runbook
- Final performance and security reports
- Launch checklist completed
- Commit: `phase-12: production launch`

Acceptance criteria:
- All tests pass in pipeline, security scans cleared or documented mitigations
- Load tests meet agreed thresholds
- Monitoring and alerts configured and tested
- Legal/compliance checklist satisfied (PACRA, ZRA, insurance contracts)

Verification commands:
```powershell
# Run pipeline locally or via CI debugging scripts
npm run test
npx artillery run load/peak.yml
# CI will run full security scans; provide local scan scripts if possible
```

Agent instructions:
- Produce a single release PR that summarizes all changes across phases, maps artifacts to release notes, and includes rollback plan.

---

Appendix — Agent Contract & Session Consistency Rules

## Session Handover Protocol (CRITICAL for multi-session consistency):

**ALWAYS START EACH SESSION WITH:**
1. **State Validation**: Run `npm run test` and `npm run build` to confirm current working state
2. **Artifact Verification**: Check all files listed in previous phase deliverables exist
3. **Database State Check**: Run `npx prisma db pull` to confirm schema matches expectations
4. **Environment Verification**: Confirm `.env` has required keys for current phase

**BEFORE STARTING NEW PHASE:**
```powershell
# Agent must run these commands and report PASS/FAIL before proceeding
npm run test -- --passWithNoTests  # Ensure no failing tests
npm run build                       # Ensure buildable state
npx prisma generate                 # Ensure DB client up-to-date
git status                          # Report uncommitted changes
```

**SESSION CONTEXT PRESERVATION:**
- Each phase MUST create a `docs/phase-<n>-completion.md` file listing what was implemented
- Include exact file paths, API endpoints created, and key functions added
- Document any deviations from the original phase plan
- Note any technical debt or TODOs for future phases

## Strict Agent Instructions:

1. **No Assumptions**: If a previous phase artifact is missing, STOP and report what's missing
2. **State Validation**: Always run phase validation commands before starting new work
3. **Backwards Compatibility**: Never break existing functionality; always run full test suite
4. **Documentation**: Update README.md with new features after each phase
5. **Error Handling**: If build/test fails, fix it before proceeding with new features
6. **Schema Changes**: Always generate and test migrations; include rollback plan
7. **API Consistency**: Follow established patterns from previous phases
8. **Code Style**: Use existing patterns; don't introduce new architectural patterns mid-project

## Modern Development Standards (Agent must follow):

**Code Quality Gates (all must pass):**
- TypeScript strict mode (no `any` types)
- ESLint with no warnings
- Prettier formatting applied
- 90%+ test coverage for new code
- All API endpoints have Zod validation
- All database operations use transactions where needed

**Performance Standards:**
- Lighthouse performance score > 90
- Bundle size increase < 50KB per phase (unless justified)
- API response times < 200ms (p95)
- Images optimized and responsive

**Security Standards:**
- No secrets in code
- All inputs validated with Zod
- SQL injection prevention
- XSS protection
- CSRF tokens on state-changing operations

## Debug/Recovery Commands (for session issues):

```powershell
# If agent gets confused about current state:
git log --oneline -10                    # Show recent commits
npm run test -- --listTests             # Show available tests
npx prisma db push --schema-only         # Sync DB schema
npm run dev                              # Start dev server to test manually

# If tests are failing:
npm run test -- --verbose --no-cache    # Detailed test output
npm run lint -- --fix                   # Auto-fix linting issues

# Emergency reset (if phase corrupted):
git stash                                # Save current work
git checkout main                        # Back to known good state
npm ci                                   # Clean install
npx prisma generate                      # Regenerate client
```


---

If you'd like, I can:
- Commit this file into the repo (I already saved it to `f:\zemo\phase-prompts-ZEMO.md`).
- Open the todo list and mark the work items done and provide the next steps summary.

Which follow-up would you like me to do now? (mark todos completed, or add CI templates, or create sample seed scripts for Phase 1)