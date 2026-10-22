# Environment variables

Copy `.env.example` to `.env.local` for local development.

| Variable | Browser exposed? | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Current Supabase publishable key used by SSR and browser clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase publishable/anon key, protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Reserved for future server-only administrative work; not used in Milestone 1 |

Never commit `.env.local`, service-role keys, Gemini keys, or other secrets. Authentication uses only the public Supabase URL and publishable key; no service-role key is required by the application.
