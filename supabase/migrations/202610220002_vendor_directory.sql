-- ScrapReady Milestone 3: public vendor discovery schema.
-- Apply after the educational content migration.

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  business_name text not null,
  business_description text not null,
  public_phone text,
  public_email text,
  locality text not null,
  city text not null,
  state text not null,
  service_areas text[] not null default '{}',
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected', 'demonstration')),
  is_active boolean not null default false,
  approximate_latitude numeric(8, 5),
  approximate_longitude numeric(8, 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendor_materials (
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete restrict,
  indicative_rate_inr_per_kg numeric(10, 2) check (indicative_rate_inr_per_kg is null or indicative_rate_inr_per_kg >= 0),
  minimum_collection_kg numeric(10, 2) check (minimum_collection_kg is null or minimum_collection_kg >= 0),
  rate_last_updated date,
  availability_status text not null default 'contact_vendor' check (availability_status in ('available', 'unavailable', 'contact_vendor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (vendor_id, material_id)
);

create index if not exists vendors_locality_idx on public.vendors(locality, city, state);
create index if not exists vendors_public_status_idx on public.vendors(verification_status, is_active);
create index if not exists vendor_materials_material_idx on public.vendor_materials(material_id);
create index if not exists vendor_materials_rate_date_idx on public.vendor_materials(rate_last_updated);

alter table public.vendors enable row level security;
alter table public.vendor_materials enable row level security;

drop policy if exists "Public can read approved active vendors" on public.vendors;
create policy "Public can read approved active vendors"
  on public.vendors for select to anon, authenticated
  using (verification_status = 'approved' and is_active = true);

drop policy if exists "Public can read approved vendor materials" on public.vendor_materials;
create policy "Public can read approved vendor materials"
  on public.vendor_materials for select to anon, authenticated
  using (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.verification_status = 'approved' and v.is_active = true
    )
    and exists (
      select 1 from public.materials m
      where m.id = material_id and m.is_published = true
    )
  );

-- No public insert, update, delete, or verification policies are created.
-- Vendor ownership and self-service management belong to the authentication milestone.
