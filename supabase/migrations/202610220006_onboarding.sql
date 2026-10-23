-- ScrapReady onboarding foundation. Apply after 202610220003_auth_roles.sql.
alter table public.profiles add column if not exists phone text check (phone is null or char_length(phone) <= 30);
alter table public.profiles add column if not exists locality text check (locality is null or char_length(locality) <= 120);
alter table public.profiles add column if not exists pin_code text check (pin_code is null or pin_code ~ '^[0-9]{6}$');
alter table public.profiles add column if not exists notification_preferences jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists bulk_alerts_enabled boolean not null default false;

create table if not exists public.vendor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  owner_name text not null check (char_length(owner_name) between 2 and 120),
  business_name text not null check (char_length(business_name) between 2 and 160),
  email text not null,
  phone text not null check (char_length(phone) between 7 and 30),
  locality text not null check (char_length(locality) between 2 and 120),
  service_pin_code text not null check (service_pin_code ~ '^[0-9]{6}$'),
  additional_pin_codes text[] not null default '{}',
  accepted_materials text[] not null default '{}',
  home_pickup_available boolean not null default false,
  bulk_pickup_available boolean not null default false,
  operating_hours text,
  whatsapp_contact text,
  publish_contact_consent boolean not null default false,
  status text not null default 'pending_approval' check (status in ('pending_approval', 'approved', 'rejected')),
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vendor_applications enable row level security;
drop policy if exists "Applicants can create their application" on public.vendor_applications;
create policy "Applicants can create their application" on public.vendor_applications for insert to authenticated with check (user_id = auth.uid() and status = 'pending_approval');
drop policy if exists "Applicants can read their application" on public.vendor_applications;
create policy "Applicants can read their application" on public.vendor_applications for select to authenticated using (user_id = auth.uid());
drop policy if exists "Applicants can update their pending application" on public.vendor_applications;
create policy "Applicants can update their pending application" on public.vendor_applications for update to authenticated using (user_id = auth.uid() and status = 'pending_approval') with check (user_id = auth.uid() and status = 'pending_approval');
drop policy if exists "Administrators manage vendor applications" on public.vendor_applications;
create policy "Administrators manage vendor applications" on public.vendor_applications for all to authenticated using (private.has_role(auth.uid(), 'administrator')) with check (private.has_role(auth.uid(), 'administrator'));

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name) values (new.id, nullif(left(new.raw_user_meta_data ->> 'display_name', 120), '')) on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end;
$$;
