# ScrapReady

ScrapReady is a mobile-first recycling and recyclable-scrap collection platform for Indian households, local collectors, and administrators.

The product connects the complete journey:

> Identify scrap → prepare it safely → find a collector → request a pickup → track collection.

The pilot location is configurable and currently focuses on locality-based discovery in Punjab. Ludhiana is the original pilot context, but it is not hardcoded into the business logic.

## Product USP

ScrapReady combines recycling education with real collection workflows. Users can identify household items, learn material-specific preparation, find local collectors, create pickup requests, join locality-based bulk groups, and track collection status.

The platform also provides safety-first handling for e-waste, batteries, electrical items, chemicals, and uncertain materials. Approved content, pending-review guides, verified vendors, demonstration records, and illustrative rewards are clearly distinguished.

## Technology Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase PostgreSQL
- Supabase Auth with SSR-managed cookies
- Supabase Row Level Security
- Supabase Storage architecture
- Google Gemini API for optional photo identification
- Sarvam AI for voice transcription, conversational answers, and text-to-speech
- Lucide React icons
- npm
- Vercel-compatible deployment

Passwords and private authentication tokens are not stored in application tables or browser localStorage. Gemini and Sarvam keys are server-only.

## Features

### Public education

- Searchable material directory.
- Household item catalog.
- Alternative item names.
- Material detail pages.
- Preparation guides with review status.
- Safety warnings and special-care routes.
- Indicative scrap rates.

### Item identification

- Manual catalog search without login.
- Optional Gemini image identification.
- MIME-type and file-size validation.
- Catalog-constrained AI results.
- Confidence display and manual correction path.
- Reviewed guidance remains the source of truth.

### Authentication and profiles

- Seller/household signup.
- Vendor application signup.
- Email/password login.
- Password reset and email confirmation callbacks.
- Profile sign-in experience at `/profile`.
- Phone, locality, six-digit PIN, and notification preferences.
- Punjab locality selector with automatic PIN filling.

### Seller pickups

- Optional approved vendor selection.
- Awaiting Vendor state when no vendor is assigned.
- Individual pickup requests.
- Multi-material pickup line items.
- Estimated weight per material.
- Preferred date and time window.
- Pickup history.
- Status tracking.

### Bulk pickups

- Locality and PIN matching.
- Compatible material matching.
- Date and time-window matching.
- Join deadlines and capacity controls.
- Separate seller contributions.
- Aggregate group totals without exposing private addresses.
- Secure vendor assignment and stop completion.
- Separate browser-local judging demo for presentations.

### Vendor operations

- Pending vendor applications.
- Administrator-controlled approval.
- Vendor memberships and role checks.
- Accepted-material configuration.
- Service PIN configuration.
- Available individual pickup jobs.
- Available bulk groups.
- Atomic job claiming.
- Assigned pickup dashboard.
- Stop-by-stop bulk collection workflow.

### Administration

- Protected administrator dashboard.
- Pending vendor application list.
- Secure approval RPC.
- Vendor record creation/update.
- Vendor membership approval.
- Vendor role assignment.
- Accepted material setup.

Administrator privileges are never granted through public signup and are not hardcoded to an email address.

### Scrap Points

The application includes an illustrative, material-specific calculator:

- Newspaper: 5 points/kg
- Cardboard: 6 points/kg
- PET plastic bottles: 10 points/kg
- Iron/steel: 8 points/kg
- Aluminium: 15 points/kg

The calculator supports multiple materials and per-material weights. Demo points are not production rewards or cash balances. A secure production rewards ledger has not yet been implemented.

### Sarvam AI voice assistant

The global **Ask ScrapReady** control supports:

- Push-to-talk microphone input.
- English, Hindi, and Punjabi responses.
- Saaras speech-to-text.
- Sarvam conversational responses.
- Bulbul text-to-speech playback.

Configure `SARVAM_API_KEY` in `.env.local`. The key is never exposed to browser code.

## Important routes

### Public

- `/` — homepage
- `/scan` — identify an item
- `/guides` — preparation guides
- `/items` — household item catalog
- `/materials` — material directory
- `/vendors` — collector directory
- `/rates` — indicative rates
- `/scrap-points` — rewards calculator
- `/get-started` — seller/vendor onboarding selection
- `/demo` — isolated judging demo

### Authenticated

- `/profile` — sign in or manage profile
- `/dashboard/seller` — seller dashboard
- `/pickups` — individual pickup requests and history
- `/bulk-pickups` — live bulk groups and judging demo
- `/vendor/dashboard` — approved vendor dashboard
- `/admin` — administrator vendor approvals

### API

- `/api/identify`
- `/api/sarvam/voice`
- `/api/pickups`
- `/api/pickups/[id]`
- `/api/bulk-pickups`
- `/api/admin/vendor-applications/[id]/approve`

## Local setup

Requirements:

- Node.js 20+
- npm
- Supabase project

Install and run:

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

GEMINI_API_KEY=your-gemini-api-key
SARVAM_API_KEY=your-sarvam-api-subscription-key
```

Never use `NEXT_PUBLIC_` for Gemini, Sarvam, service-role, or other private keys.

## Supabase migrations

The migrations are stored in [`supabase/migrations/`](./supabase/migrations/).

They cover:

- Educational content.
- Vendor directory.
- Auth roles and memberships.
- Pickup requests.
- Bulk pickup groups and RPCs.
- Punjab localities.
- Optional vendor assignment.
- Profile synchronization.
- Vendor job claiming.
- Administrator vendor approval.
- Secure current-user role lookup.
- Multi-material pickup line items.

Apply migrations in filename order through the Supabase SQL Editor. Confirm the latest migrations are applied before testing live workflows, especially migrations `202610230009` through `202610230016`.

Bootstrap an administrator only through an explicit owner action:

```sql
insert into public.user_roles (user_id, role, granted_by)
select id, 'administrator'::public.app_role, id
from auth.users
where email = 'OWNER_EMAIL_HERE'
on conflict (user_id, role) do nothing;
```

Replace the placeholder with an account controlled by the project owner. Do not expose this operation through signup or browser code.

Configure Supabase Auth URL settings:

```text
http://localhost:3000/auth/callback
https://your-production-domain/auth/callback
```

## Quality checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment

For a non-commercial prototype, connect the repository to Vercel and configure the same environment variables. Add production callback URLs in Supabase Auth settings.

Review current Vercel quotas, Supabase limits, SMTP requirements, and Sarvam/Gemini API usage costs before public deployment.

## Security model

- Seller identity comes from Supabase Auth claims.
- Seller records are owner-scoped with RLS.
- Vendor access requires an approved role and membership.
- Vendor claiming checks approval, active status, locality, service PIN, and material acceptance.
- Admin approval is performed through an administrator-only RPC.
- Discovery responses contain aggregate information only.
- Private pickup addresses are exposed only after authorized assignment.
- Demo data and demo rewards never write to real Supabase records.

## Current limitations

- Real cross-account seller/vendor testing requires dedicated test accounts.
- Pending migrations must be confirmed in the live Supabase project.
- Preparation guides require human approval before being treated as verified.
- Production Scrap Points require a secure server-side rewards ledger.
- Payments, notifications, maps, GPS tracking, and receipts are not production features yet.
- Vendor approval requires a trusted administrator bootstrap.

## Documentation

- [Project documentation](./docs/scrapready-project-documentation.md)
- [Architecture](./docs/architecture.md)
- [Database notes](./docs/database.md)
- [Roadmap](./docs/roadmap.md)
- [Testing checklist](./docs/testing-checklist.md)
