-- ScrapReady Milestone 4: profiles, roles, and vendor authorization.
-- Apply after the educational and vendor migrations.

create schema if not exists private;
revoke all on schema private from public;

do $$ begin
  create type public.app_role as enum ('customer', 'vendor', 'administrator');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 120),
  preferred_language text not null default 'en' check (preferred_language in ('en', 'hi', 'pa')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.vendor_memberships (
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_status text not null default 'pending' check (membership_status in ('pending', 'approved', 'rejected')),
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (vendor_id, user_id)
);

create index if not exists user_roles_role_idx on public.user_roles(role);
create index if not exists vendor_memberships_user_idx on public.vendor_memberships(user_id, membership_status);
create index if not exists vendor_memberships_vendor_idx on public.vendor_memberships(vendor_id, membership_status);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.vendor_memberships enable row level security;

create or replace function private.has_role(requested_user_id uuid, requested_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = requested_user_id and role = requested_role
  );
$$;

create or replace function private.is_approved_vendor_member(requested_user_id uuid, requested_vendor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.vendor_memberships
    where user_id = requested_user_id
      and vendor_id = requested_vendor_id
      and membership_status = 'approved'
  ) and private.has_role(requested_user_id, 'vendor');
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Administrators can read profiles" on public.profiles;
create policy "Administrators can read profiles"
  on public.profiles for select to authenticated
  using (private.has_role(auth.uid(), 'administrator'));

drop policy if exists "Users can read their own roles" on public.user_roles;
create policy "Users can read their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Administrators can read roles" on public.user_roles;
create policy "Administrators can read roles"
  on public.user_roles for select to authenticated
  using (private.has_role(auth.uid(), 'administrator'));

drop policy if exists "Members can read their vendor memberships" on public.vendor_memberships;
create policy "Members can read their vendor memberships"
  on public.vendor_memberships for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Administrators can read vendor memberships" on public.vendor_memberships;
create policy "Administrators can read vendor memberships"
  on public.vendor_memberships for select to authenticated
  using (private.has_role(auth.uid(), 'administrator'));

-- There are intentionally no public insert, update, or delete policies on roles
-- or memberships. Bootstrap administrators through the SQL editor as documented.
