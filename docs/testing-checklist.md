# Milestone 1 testing checklist

- [ ] `npm install` completes without dependency cleanup errors
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] Header links reach each initial page
- [ ] Mobile tab navigation reaches Home, Scan, Vendors, Pickups, and Profile
- [ ] Layout remains usable at narrow mobile widths
- [ ] Manifest is served from `/manifest.webmanifest`
- [ ] App icon is served from `/icon.svg`
- [ ] Production service worker registration is available from `/sw.js`
- [ ] No demonstration vendor, price, or guide is represented as verified data

## Milestone 2 checks completed

- [x] `npm ci --dry-run --ignore-scripts` passes after lockfile repair
- [x] Material directory renders 10 categories
- [x] Item directory renders 20 items
- [x] Item search matches an item by name
- [x] Material filter controls render and update the item directory
- [x] Item detail links to its preparation guide
- [x] Hazardous item pages show conservative handling notes
- [x] Draft/pending guide status is visible
- [x] Invalid item route returns the Next.js 404 page
- [x] 390px viewport has no horizontal overflow and shows mobile navigation
- [x] Production build includes dynamic material, item, and guide routes

Database RLS policies require a connected Supabase project to exercise against a live database. They are documented in the migration and have not been verified against the user’s Supabase project in this environment.

## Milestone 3 checks completed

- [x] Vendor directory renders with demonstration fallback records
- [x] Vendor business-name/locality search works
- [x] Locality filter works
- [x] Accepted-material filter works
- [x] Material page links to a filtered vendor search
- [x] Vendor detail navigation works
- [x] Demonstration status is visible and never shown as verified
- [x] Missing-rate text displays as “Contact vendor for rate”
- [x] Minimum quantity and rate-date fields render
- [x] 30-day stale-rate warning logic is implemented
- [x] Empty filter state is available
- [x] Invalid vendor URL returns 404
- [x] Vendor detail page has no horizontal overflow at 390px

Live vendor RLS testing could not be performed because the Supabase vendor migration has not yet been run in the configured project.

## Milestone 4 checks completed

- [x] Supabase Auth settings endpoint responds successfully for the configured project
- [x] Login page renders
- [x] Signup page renders
- [x] Forgot-password page renders
- [x] Reset-password page renders
- [x] Auth pages have no horizontal overflow at 390px
- [x] Anonymous `/profile` redirects to `/login?next=/profile`
- [x] Anonymous `/dashboard` redirects to `/login?next=/dashboard`
- [x] Anonymous `/vendor/dashboard` redirects to `/login?next=/vendor/dashboard`
- [x] Anonymous `/admin` redirects to `/login?next=/admin`
- [x] SSR proxy is included in the production build

Live signup, email verification, sign-out, password reset, session persistence, role escalation, cross-user profile denial, cross-vendor denial, and live RLS tests remain pending because the auth/role migration has not been applied to the configured Supabase project and no test account was created.

Manual browser and PWA installation checks should be completed after starting the production server on a device or browser that supports installation.
