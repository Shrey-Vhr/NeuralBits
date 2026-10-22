# ScrapReady architecture

## Current foundation

ScrapReady is a single Next.js App Router application using TypeScript and Tailwind CSS. Shared layout components keep the header, mobile navigation, page shell, and small shadcn/ui-compatible button component consistent.

The browser and server Supabase client factories are isolated under `src/lib/supabase/`. They return `null` when environment variables are absent, so the public foundation can run before a Supabase project is connected. No service-role key is used.

The current PWA foundation includes a web manifest, an SVG app icon, and a small production-only service worker registration. The worker uses network-first requests with a minimal cache fallback and does not cache private data.

## Planned boundaries

- Public education and discovery: server-rendered pages backed by approved Supabase data.
- Private workflows: authenticated server actions or route handlers with database authorization.
- Supabase PostgreSQL: source of truth for profiles, materials, guides, vendors, pickups, and transactions.
- Gemini: server-only, structured identification suggestions; never the source of prices or safety instructions.
- Leaflet/OpenStreetMap: later locality-based vendor discovery with attribution and privacy-conscious locations.

## Security principles

Keep secrets server-side, validate all input, use Row Level Security for private data, derive roles from trusted records, and label demonstration or estimated content clearly.

## Milestone 2 content flow

The public material, item, and guide pages use `src/lib/content-repository.ts`. When Supabase environment variables are present, the repository reads published materials and items plus approved guides through the anonymous-safe client. When Supabase is not connected, it uses the local demonstration dataset in `src/lib/content.ts` so the interface remains usable during development. Local preparation guides are labelled `Pending review` and include conservative handling language.

The migration in `supabase/migrations/202610220001_educational_content.sql` creates `materials`, `items`, `item_materials`, and `preparation_guides`, with indexes and Row Level Security. Anonymous and authenticated readers can only select published materials/items and approved guides. There are intentionally no public write or approval policies.

## Milestone 3 vendor flow

The vendor pages use `src/lib/vendor-repository.ts`. With Supabase configured, it reads only `approved` and `is_active` vendors plus their accepted material rows. If the vendor tables are unavailable during development, it uses clearly labelled demonstration records from `src/lib/vendors.ts`. If the live tables exist but contain no approved rows, the directory remains empty rather than inventing vendors.

The vendor migration stores public locality and optional approximate coordinates, but does not store or expose private home addresses or verification documents. Rates are nullable, labelled indicative, and display their last-updated date when present. A rate older than 30 days is flagged as potentially outdated. Leaflet/OSM mapping is intentionally deferred because locality filters provide useful discovery without exposing precise locations or creating tile usage.

## Milestone 4 authentication flow

`src/lib/supabase/browser.ts` creates the browser client for interactive forms. `src/lib/supabase/server.ts` creates the server client with cookie access. Next.js 16 `proxy.ts` delegates to `src/lib/supabase/proxy.ts`, which refreshes sessions with `auth.getClaims()` and copies refreshed cookies to the request and response.

Protected pages call `src/lib/auth.ts`. Authentication is verified from claims, then roles and approved vendor memberships are read from `user_roles` and `vendor_memberships`. The UI hiding is only convenience; server redirects and RLS remain the authorization boundary.

The role migration creates a profile row and default customer role through a trusted `auth.users` trigger. Vendor and administrator roles are never granted by client code. Vendor dashboard access additionally requires an approved membership association.
