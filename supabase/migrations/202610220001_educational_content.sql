-- ScrapReady Milestone 2: educational content schema.
-- Apply this migration in the Supabase SQL editor before importing reviewed content.

create extension if not exists pgcrypto;

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null,
  household_examples text[] not null default '{}',
  segregation_guidance text not null,
  special_handling text,
  safety_precautions text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  alternative_names text[] not null default '{}',
  description text not null,
  is_hazardous boolean not null default false,
  handling_note text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.item_materials (
  item_id uuid not null references public.items(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (item_id, material_id)
);

create table if not exists public.preparation_guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  item_id uuid not null references public.items(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  title text not null,
  description text not null,
  preparation_steps text[] not null default '{}',
  safety_warnings text[] not null default '{}',
  do_not_do text[] not null default '{}',
  recommended_route text not null,
  approval_status text not null default 'draft' check (approval_status in ('draft', 'pending_review', 'approved', 'archived')),
  last_reviewed_date date,
  reviewer_notes text,
  content_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists materials_category_idx on public.materials(category);
create index if not exists materials_published_idx on public.materials(is_published);
create index if not exists items_published_idx on public.items(is_published);
create index if not exists item_materials_material_idx on public.item_materials(material_id);
create index if not exists guides_item_idx on public.preparation_guides(item_id);
create index if not exists guides_status_idx on public.preparation_guides(approval_status);

alter table public.materials enable row level security;
alter table public.items enable row level security;
alter table public.item_materials enable row level security;
alter table public.preparation_guides enable row level security;

drop policy if exists "Public can read published materials" on public.materials;
create policy "Public can read published materials"
  on public.materials for select to anon, authenticated
  using (is_published = true);

drop policy if exists "Public can read published items" on public.items;
create policy "Public can read published items"
  on public.items for select to anon, authenticated
  using (is_published = true);

drop policy if exists "Public can read published item relationships" on public.item_materials;
create policy "Public can read published item relationships"
  on public.item_materials for select to anon, authenticated
  using (
    exists (select 1 from public.items i where i.id = item_id and i.is_published = true)
    and exists (select 1 from public.materials m where m.id = material_id and m.is_published = true)
  );

drop policy if exists "Public can read approved guides" on public.preparation_guides;
create policy "Public can read approved guides"
  on public.preparation_guides for select to anon, authenticated
  using (approval_status = 'approved');

-- No public insert, update, delete, or approval policies are created.
-- Content writes must use a protected administrator workflow or the SQL editor.
