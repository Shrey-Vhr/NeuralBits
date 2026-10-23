# ScrapReady — Project Documentation

## 1. Project Overview

ScrapReady is a mobile-first recycling and recyclable-scrap collection platform for Indian households, local collectors, and administrators.

The platform helps a user move through the full recycling journey:

1. Identify a household item.
2. Understand its material category.
3. Learn how to prepare it safely.
4. Estimate illustrative scrap value or points.
5. Find a suitable local collector.
6. Request an individual or locality-based bulk pickup.
7. Track collection progress.

The initial pilot is designed for configurable locality-based discovery in Punjab, India, with Ludhiana as the original pilot context. The application does not hardcode Ludhiana into core business logic.

## 2. Product USP

ScrapReady’s main unique selling proposition is the connection between recycling education and real collection workflows.

Most recycling tools stop at information or provide only a directory. ScrapReady connects both sides:

> Learn what the item is → prepare it correctly → find a suitable collector → request collection → track the outcome.

The platform is differentiated by:

- Education before collection: users receive material-specific preparation guidance before creating a pickup request.
- Locality-first discovery: users can search using locality and six-digit PIN code rather than relying only on maps.
- Safety-aware handling: batteries, e-waste, chemicals, electrical items, and uncertain materials are treated as special-care items.
- Human-reviewed content model: preparation guides distinguish approved content from draft or pending-review content.
- Two-sided workflow: sellers create requests and authorized vendors manage assigned collections.
- Bulk pickup coordination: nearby households can combine compatible requests into one vendor trip.
- Transparent illustrative rewards: material-specific demo calculations show how estimated rewards could be calculated without pretending that demo points are real money.
- Privacy-conscious design: seller addresses and contact details are hidden until an authorized vendor is assigned.

## 3. Technology Stack

### Application stack

- Next.js 16
- React 19
- App Router
- TypeScript
- Tailwind CSS 4
- Lucide React icons
- `class-variance-authority` for reusable UI variants
- `clsx` and `tailwind-merge` for class composition
- npm package manager

### Backend and infrastructure

- Supabase PostgreSQL for application data.
- Supabase Auth for email/password authentication and sessions.
- Supabase Storage architecture reserved for future file and image workflows.
- Supabase Row Level Security for database authorization.
- Supabase SSR helpers for secure cookie-based server sessions.
- Vercel-compatible deployment architecture.
- Git and GitHub-compatible repository workflow.

### AI and voice integrations

- Google Gemini API for optional photo-based item identification.
- Sarvam AI for the voice assistant.
  - Saaras speech-to-text.
  - Sarvam conversational model for responses.
  - Bulbul text-to-speech.

### Planned or future integrations

- Leaflet and OpenStreetMap for locality maps.
- Additional Indian language support for Hindi and Punjabi.
- Production rewards ledger.
- Notifications and reminders.

## 4. Framework and Architecture

ScrapReady uses Next.js App Router with a server-first architecture.

### Route architecture

Public routes include:

- `/`
- `/scan`
- `/guides`
- `/items`
- `/materials`
- `/vendors`
- `/rates`
- `/scrap-points`
- `/demo`
- `/get-started`

Protected routes include:

- `/profile`
- `/dashboard`
- `/dashboard/seller`
- `/vendor/dashboard`
- `/admin`
- `/pickups`
- `/bulk-pickups`

API routes include:

- `/api/identify`
- `/api/sarvam/voice`
- `/api/pickups`
- `/api/pickups/[id]`
- `/api/bulk-pickups`
- `/api/admin/vendor-applications/[id]/approve`

### Server and client responsibilities

Server Components are used for:

- Reading protected Supabase data.
- Checking authenticated sessions.
- Enforcing role and vendor membership checks.
- Rendering public catalog and vendor data.
- Loading dashboards and history.

Client Components are used only where interaction is required:

- Search and filters.
- Forms.
- Camera and microphone capture.
- Pickup status actions.
- Bulk-group join and claim actions.
- Demo state and interactive calculators.

### Authentication flow

1. Supabase Auth creates and manages the account.
2. A database trigger creates a profile and default customer role.
3. The user can choose seller or vendor onboarding.
4. Vendor applications remain pending until administrator approval.
5. Server-side authorization reads roles and approved memberships.
6. Protected routes redirect unauthorized users to the profile sign-in experience.

Passwords are never stored in application tables. Authentication tokens are not manually stored in browser localStorage.

## 5. Main Features

### 5.1 Homepage and navigation

The homepage uses an editorial waste-management design system:

- Warm off-white background.
- Forest and black typography.
- Burnt-orange accents.
- Thin borders and restrained shadows.
- Large editorial headline.
- Professional collection photography.
- Clear actions for identification, preparation, pickup, and bulk groups.

The shared application shell includes:

- Responsive top navigation.
- Mobile menu.
- Profile/sign-in access.
- Get Started entry point.
- Consistent footer navigation.

### 5.2 Manual item identification

Users can search the curated household catalog without logging in.

The manual flow provides:

- Item search.
- Alternative item names.
- Material classifications.
- Hazardous-item warnings.
- Preparation guide links.
- Material detail links.
- Collector links for eligible items.

### 5.3 Gemini photo identification

Users can upload a photo and explicitly request identification.

The server route:

- Reads `GEMINI_API_KEY` only on the server.
- Validates file type and size.
- Uses a catalog-constrained prompt.
- Returns structured item and material suggestions.
- Displays uncertainty.
- Never lets Gemini invent authoritative disposal instructions.
- Retrieves preparation guidance from ScrapReady content instead.

If Gemini is unavailable, manual search continues to work.

### 5.4 Educational material directory

The material directory currently supports categories such as:

- Paper.
- Cardboard.
- Plastic.
- Iron and steel.
- Aluminium.
- Copper.
- Glass.
- Electronic waste.
- Textiles.
- Mixed materials.

Material pages explain:

- What the material is.
- Common household examples.
- Basic segregation guidance.
- Local acceptance caveats.
- Special handling requirements.
- Safety precautions.

### 5.5 Preparation guides

Preparation guides support approval-aware educational content.

Each guide can contain:

- Item name.
- Material category.
- Preparation steps.
- Safety warnings.
- Things to avoid.
- Recommended route.
- Review status.
- Last reviewed date.

Pending-review content is clearly labelled and is not presented as expert-approved safety advice.

Candidate guides currently include newspapers, cardboard boxes, and plastic bottles.

### 5.6 Scrap rates and points

The application includes an illustrative rate and rewards experience.

Material-specific demo reward rates include:

- Newspaper: 5 points/kg.
- Cardboard: 6 points/kg.
- PET plastic bottles: 10 points/kg.
- Iron and steel: 8 points/kg.
- Aluminium: 15 points/kg.

The calculator supports:

- Multiple material selection.
- Per-material weights.
- Per-material points.
- Total weight.
- Total estimated points.
- Invalid weight validation.

All calculations are marked illustrative. Real production reward balances are not claimed because a secure rewards ledger has not been implemented.

### 5.7 Vendor directory

The vendor directory supports:

- Business search.
- Locality filtering.
- Material filtering.
- Verification status.
- Accepted materials.
- Indicative rates.
- Service areas.
- Minimum collection quantities.

Demonstration vendors are clearly labelled and are not presented as real approved businesses.

### 5.8 Authentication and profiles

The application supports:

- Seller signup.
- Vendor application signup.
- Email/password login.
- Password reset.
- Email confirmation callback.
- Profile synchronization.
- Locality selection with automatic PIN filling.
- Phone number storage.
- Bulk-pickup alert preference.

The profile page also serves as the sign-in page for logged-out users.

### 5.9 Vendor onboarding and administration

Vendor applications are initially pending.

Only an administrator can approve a vendor. Approval atomically creates or updates:

- Vendor record.
- Approved vendor status.
- Vendor role.
- Approved vendor membership.
- Accepted material records.
- Service PIN configuration.

The admin dashboard contains a pending vendor application panel.

Administrator access requires the `administrator` role in `public.user_roles`. No administrator email is hardcoded.

### 5.10 Individual pickups

Authenticated sellers can create pickup requests with:

- One or more material line items.
- Estimated weight per material.
- Optional approved vendor.
- Locality.
- Six-digit PIN.
- Pickup address.
- Preferred date.
- Time window.
- Notes.

The parent pickup record preserves ownership and lifecycle status. Material line items are stored separately in `pickup_request_items`.

Supported statuses include:

- Requested.
- Accepted.
- Rejected.
- Cancelled.
- Completed.

### 5.11 Bulk pickups

Bulk pickups support locality-based matching using:

- PIN code.
- Locality.
- Material compatibility.
- Preferred date.
- Time window.
- Join deadline.
- Group capacity.

Each seller keeps their own pickup request and contribution. The group only coordinates collection; it does not merge ownership or private addresses.

### 5.12 Vendor collection workflow

Approved vendors can be given:

- Available individual jobs.
- Available bulk groups.
- Service PIN matching.
- Accepted-material validation.
- Atomic job claiming.
- Assigned collection records.
- Stop-by-stop bulk collection actions.

Private seller details are only exposed after authorized assignment.

### 5.13 Sarvam AI voice assistant

The global voice assistant provides:

- Push-to-talk recording.
- English, Hindi, and Punjabi response selection.
- Sarvam speech-to-text.
- Sarvam conversational answer generation.
- Sarvam text-to-speech playback.

The `SARVAM_API_KEY` remains server-only. The assistant does not send microphone audio until the user explicitly presses the microphone button.

### 5.14 Isolated judging demo

The judging demo is intentionally separate from real Supabase records.

It demonstrates:

- Three households.
- Shared simulated bulk pickup.
- Vendor view.
- Individual stop completion.
- Separate receipts.
- 40/30/50 illustrative demo points.
- Reset behavior.

It is clearly labelled as a simulation and never represents a real vendor, payment, or pickup.

## 6. Database Model

Core tables include:

- `profiles`
- `user_roles`
- `vendor_applications`
- `vendors`
- `vendor_memberships`
- `vendor_materials`
- `materials`
- `items`
- `preparation_guides`
- `pickup_requests`
- `pickup_request_items`
- `bulk_pickup_groups`
- `bulk_pickup_contributions`
- `bulk_alert_preferences`
- `punjab_localities`

Database protections include:

- Row Level Security.
- Owner-scoped seller records.
- Approved vendor membership checks.
- Administrator-only approval operations.
- Security-definer RPCs for atomic multi-record changes.
- Duplicate contribution prevention.
- Vendor claim concurrency protection.

## 7. Security Principles

ScrapReady follows these security rules:

- Never trust browser-supplied user IDs.
- Derive seller identity from Supabase Auth claims.
- Do not expose service-role keys in browser code.
- Do not allow vendors to self-approve.
- Do not let sellers assign arbitrary vendors.
- Keep addresses private before assignment.
- Keep pending educational content visibly unapproved.
- Keep API keys in server-only environment variables.
- Preserve RLS instead of bypassing it for convenience.

## 8. Configuration

Important environment variables include:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
GEMINI_API_KEY=...
SARVAM_API_KEY=...
```

`GEMINI_API_KEY` and `SARVAM_API_KEY` must never use the `NEXT_PUBLIC_` prefix.

## 9. Running the Project

Install dependencies:

```bash
npm install
```

Start development:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Run checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## 10. Current Limitations

- Real authenticated seller/vendor end-to-end testing still requires dedicated test accounts.
- Latest Supabase migrations must be confirmed as applied in the live project.
- Production Scrap Points do not yet use a server-side rewards ledger.
- Preparation guides require human approval before being treated as verified.
- Pickup booking, payments, receipts, and rewards remain prototype-level features.
- Mapping and real-time GPS are not implemented.
- Vendor approval requires a trusted administrator.

## 11. Recommended Next Steps

1. Apply and verify all pending Supabase migrations.
2. Bootstrap one administrator through the SQL Editor.
3. Approve one test vendor through `/admin`.
4. Create two dedicated seller test accounts.
5. Run the seller-to-vendor pickup flow across separate browser sessions.
6. Verify RLS and cross-user privacy.
7. Configure production SMTP for email confirmation.
8. Add a server-side rewards ledger before offering real rewards.
9. Add automated integration tests for vendor claims and bulk stops.
