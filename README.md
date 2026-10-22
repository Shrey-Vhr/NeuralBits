# ScrapReady

ScrapReady is a mobile-first, installable PWA for learning how to prepare scrap, understand estimated value, and connect with local recycling partners. The initial pilot is planned for Ludhiana, Punjab, but the location remains configurable and is not hardcoded into application logic.

Milestone 1 provides the application shell, responsive navigation, initial routes, PWA metadata, and Supabase client scaffolding. The visible content is intentionally demonstration content until reviewed material guides and verified pilot vendors are added.

Milestone 2 adds the material directory, 20-item catalog, searchable filters, item detail pages, preparation guide pages, and a Supabase RLS migration. Local fallback content is clearly labelled as pending review; it is not presented as expert-approved safety advice.

Milestone 3 adds locality-based vendor discovery, accepted-material filters, vendor profiles, indicative-rate presentation, stale-rate warnings, and a read-only vendor RLS migration. The local fallback vendor records are demonstrations only and are not real businesses.

Milestone 4 adds email/password authentication, cookie-based SSR sessions, protected customer/vendor/administrator routes, profile editing, and role/membership authorization scaffolding.

## Local development

Requirements: Node.js 20+ and npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Supabase configuration

Create a Supabase project, open Project Settings → API, and copy the project URL and publishable/anon key into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Do not add service-role keys to `NEXT_PUBLIC_*` variables or browser code. Authentication and database tables are intentionally not enabled in Milestone 1.

For Milestones 2–4, apply [`supabase/migrations/202610220001_educational_content.sql`](./supabase/migrations/202610220001_educational_content.sql), [`supabase/migrations/202610220002_vendor_directory.sql`](./supabase/migrations/202610220002_vendor_directory.sql), and [`supabase/migrations/202610220003_auth_roles.sql`](./supabase/migrations/202610220003_auth_roles.sql) in order. The optional [`supabase/seed.sql`](./supabase/seed.sql) contains educational seed data; actual vendor rows must be added only after verification.

## Authentication setup

In Supabase Dashboard → Authentication → URL Configuration, add the local and deployed redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://your-deployment-domain/auth/callback`

Email/password authentication is enabled in the project. Email confirmation remains controlled by the Supabase Auth setting. The app stores sessions in SSR-managed cookies through `@supabase/ssr`; it does not manually store tokens in `localStorage`.

After applying the role migration, create the first administrator using the SQL Editor after the user has signed up:

```sql
insert into public.user_roles (user_id, role)
select id, 'administrator'::public.app_role
from auth.users
where email = 'your-admin-email@example.com'
on conflict (user_id, role) do nothing;
```

Replace the email with the account you control. Do not expose this operation through a public signup form.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment

Connect the repository to Vercel, select the default Next.js build settings, add the same public Supabase environment variables, and deploy. Vercel Hobby is appropriate only for an eligible non-commercial prototype; review current quotas and terms before a public commercial launch.

## Project structure

- `src/app/` — App Router pages and global styles
- `src/components/` — shared layout and UI components
- `src/lib/supabase/` — browser-safe and server-side Supabase client factories
- `public/` — PWA manifest, icon, and minimal service worker
- `docs/` — architecture, roadmap, environment notes, and testing checklist
- `supabase/` — educational content migration and seed template
