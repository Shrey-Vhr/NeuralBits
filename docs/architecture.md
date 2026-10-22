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
