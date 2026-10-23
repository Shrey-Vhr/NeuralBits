# ScrapReady educational content database

## Migration

Apply [`supabase/migrations/202610220001_educational_content.sql`](../supabase/migrations/202610220001_educational_content.sql) in the Supabase SQL Editor. It creates the Milestone 2 tables, indexes, constraints, and Row Level Security policies.

## Tables

- `materials` stores material descriptions, examples, segregation guidance, safety notes, and publication state.
- `items` stores common item names, alternative names, hazard flags, and publication state.
- `item_materials` connects items to one or more materials and identifies primary relationships.
- `preparation_guides` stores versioned guide content, safety warnings, recommended routes, review dates, and approval status.

## Public access rules

Anonymous and authenticated users can read only rows where `materials.is_published` or `items.is_published` is true. They can read preparation guides only when `approval_status = 'approved'`. The migration intentionally creates no public insert, update, delete, or approval policies.

Content must be inserted or approved through a protected administrator workflow or the Supabase SQL Editor. Keep guides as `pending_review` until a qualified reviewer has checked them.

## Vendor directory migration

Apply [`supabase/migrations/202610220002_vendor_directory.sql`](../supabase/migrations/202610220002_vendor_directory.sql) after the educational migration. It creates:

- `vendors` for public business information, locality, service areas, verification state, active state, and optional approximate coordinates.
- `vendor_materials` for accepted materials, nullable indicative INR/kg rates, minimum collection quantities, availability, and rate update dates.

Public policies expose only approved, active vendors and their relationships to published materials. There are no public write or verification policies. Add real vendors only through a protected administrator process or the SQL editor after verification. Do not add private documents or exact residential addresses to public columns.

## Authentication and roles migration

[`supabase/migrations/202610220003_auth_roles.sql`](../supabase/migrations/202610220003_auth_roles.sql) has been applied after the first two migrations. It creates:

- `profiles`, keyed to `auth.users`, for minimal display settings.
- `user_roles`, with `customer`, `vendor`, and `administrator` roles.
- `vendor_memberships`, linking users to vendor records with an explicit approval status.

The database trigger creates a profile and customer role for each new Auth user. RLS lets users read/update only their own profile, read their own roles, and read their own memberships. Administrators can read protected role/profile/membership records. No public role or membership write policies exist.

Bootstrap the first administrator manually in the SQL Editor after signup. A vendor user requires both the vendor role and an approved membership row; supplying a vendor ID alone never grants access.

## Pickup requests

[`supabase/migrations/202610220004_pickup_requests.sql`](../supabase/migrations/202610220004_pickup_requests.sql) creates `pickup_requests` with customer/vendor/material foreign keys, quantity, address, locality, preferred schedule, notes, and constrained status values. It is applied in the configured project.

RLS limits reads to the customer, approved assigned vendor members, or administrators. Customer identity is taken from verified server claims in the API route rather than trusted from the browser. A database trigger rejects ownership changes and invalid status transitions.

## Seed data

[`supabase/seed.sql`](../supabase/seed.sql) is a small reviewed-content template for the material directory. It is not a substitute for expert review of preparation guidance. The application’s local demonstration data lives in [`src/lib/content.ts`](../src/lib/content.ts) and is visibly labelled pending review for guides.
