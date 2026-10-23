-- ScrapReady bulk pickup foundation. Apply after 202610220004_pickup_requests.sql.

create table if not exists public.bulk_pickup_groups (
  id uuid primary key default gen_random_uuid(),
  locality_pin_code text not null check (locality_pin_code ~ '^[0-9]{6}$'),
  material_id uuid not null references public.materials(id) on delete restrict,
  preferred_time_window text not null check (preferred_time_window in ('morning', 'afternoon', 'evening')),
  join_deadline timestamptz not null,
  group_status text not null default 'open' check (group_status in ('open', 'closed', 'assigned', 'completed', 'cancelled')),
  assigned_vendor_id uuid references public.vendors(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  minimum_bulk_target_kg numeric(10,2) check (minimum_bulk_target_kg is null or minimum_bulk_target_kg > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bulk_pickup_contributions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.bulk_pickup_groups(id) on delete cascade,
  seller_user_id uuid not null references auth.users(id) on delete restrict,
  material_id uuid not null references public.materials(id) on delete restrict,
  estimated_weight_kg numeric(10,2) not null check (estimated_weight_kg > 0),
  pickup_request_id uuid references public.pickup_requests(id) on delete set null,
  contribution_status text not null default 'joined' check (contribution_status in ('joined', 'collected', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (group_id, seller_user_id)
);

create table if not exists public.bulk_alert_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locality_pin_code text not null check (locality_pin_code ~ '^[0-9]{6}$'),
  alerts_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists bulk_groups_locality_idx on public.bulk_pickup_groups(locality_pin_code, group_status, join_deadline);
create index if not exists bulk_contributions_group_idx on public.bulk_pickup_contributions(group_id, contribution_status);

alter table public.bulk_pickup_groups enable row level security;
alter table public.bulk_pickup_contributions enable row level security;
alter table public.bulk_alert_preferences enable row level security;

drop policy if exists "Sellers can read their bulk groups" on public.bulk_pickup_groups;
drop policy if exists "Approved vendors can read assigned bulk groups" on public.bulk_pickup_groups;
drop policy if exists "Sellers can read their bulk contributions" on public.bulk_pickup_contributions;
drop policy if exists "Approved vendors can read assigned contributions" on public.bulk_pickup_contributions;
drop policy if exists "Users manage their alert preference" on public.bulk_alert_preferences;

create policy "Sellers can read their bulk groups" on public.bulk_pickup_groups for select to authenticated using (created_by = auth.uid() or exists (select 1 from public.bulk_pickup_contributions c where c.group_id = id and c.seller_user_id = auth.uid()));
create policy "Approved vendors can read assigned bulk groups" on public.bulk_pickup_groups for select to authenticated using (private.is_approved_vendor_member(auth.uid(), assigned_vendor_id));
create policy "Sellers can read their bulk contributions" on public.bulk_pickup_contributions for select to authenticated using (seller_user_id = auth.uid());
create policy "Approved vendors can read assigned contributions" on public.bulk_pickup_contributions for select to authenticated using (exists (select 1 from public.bulk_pickup_groups g where g.id = group_id and private.is_approved_vendor_member(auth.uid(), g.assigned_vendor_id)));
create policy "Users manage their alert preference" on public.bulk_alert_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Group creation/join/status transitions require server-side functions or an authorized API.
-- No public insert/update policies are granted by this foundation migration.
