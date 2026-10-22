# Development roadmap

## Milestone 1 — Foundation (current)

- [x] Next.js App Router, TypeScript, Tailwind, ESLint
- [x] Responsive ScrapReady shell and mobile navigation
- [x] Initial public and authenticated-area placeholder routes
- [x] shadcn/ui-compatible configuration and button primitive
- [x] Supabase client scaffolding and environment example
- [x] PWA manifest, icon, and minimal service worker strategy
- [x] Documentation and run instructions

## Milestone 2 — Educational content (current)

- [x] Materials and items data model
- [x] Approximately 20-item educational catalog
- [x] Search by item and alternative name
- [x] Material filtering and item-to-material relationships
- [x] Preparation guide layout with approval status and safety warnings
- [x] Supabase migration with Row Level Security
- [x] Public content loading, empty, and invalid-route states
- [ ] Expert review and approval of the initial guide set
- [ ] Apply the migration and import reviewed content into Supabase

## Milestone 3 — Vendor directory (current)

- [x] Vendor and vendor-material schema with RLS
- [x] Locality-based vendor search
- [x] Accepted-material filtering
- [x] Vendor profile pages
- [x] Indicative rate, minimum quantity, and last-updated display
- [x] Missing-rate and stale-rate handling
- [x] Material-to-vendor filtered navigation
- [x] Demonstration records clearly separated from verified vendors
- [ ] Apply vendor migration and add verified pilot vendors

## Milestone 4 — Authentication and authorization (current)

- [x] Email/password sign up and sign in forms
- [x] Password reset request and password update pages
- [x] Email verification callback route
- [x] Cookie-based SSR session refresh with Next.js 16 proxy
- [x] Customer profile editing and sign out
- [x] Role-aware protected dashboard routes
- [x] Vendor role plus approved membership guard
- [x] Administrator guard and documented bootstrap procedure
- [x] Profile, role, and membership RLS migration
- [ ] Apply the migration and run live signup/RLS tests in Supabase

## Later milestones

- Marketplace: authentication, invited vendor approval, rates, pickups, and receipts.
- AI assistance: manual selection first, then secure Gemini image suggestions.
- Localization and polish: English first, then reviewed Hindi and Punjabi content.
- Advanced features: journey tracking, municipality reporting, and improved matching.
