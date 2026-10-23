-- Punjab locality directory used by onboarding. PIN codes are locality-level references.
create table if not exists public.punjab_localities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  district text not null,
  pin_code text not null check (pin_code ~ '^[0-9]{6}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name, pin_code)
);

insert into public.punjab_localities (name, city, district, pin_code) values
('Ludhiana Central', 'Ludhiana', 'Ludhiana', '141001'),
('Amritsar Central', 'Amritsar', 'Amritsar', '143001'),
('Jalandhar Central', 'Jalandhar', 'Jalandhar', '144001'),
('Patiala Central', 'Patiala', 'Patiala', '147001'),
('Bathinda Central', 'Bathinda', 'Bathinda', '151001'),
('SAS Nagar / Mohali', 'Sahibzada Ajit Singh Nagar', 'SAS Nagar', '160055'),
('Hoshiarpur Central', 'Hoshiarpur', 'Hoshiarpur', '146001'),
('Pathankot Central', 'Pathankot', 'Pathankot', '145001'),
('Moga Central', 'Moga', 'Moga', '142001'),
('Firozpur Central', 'Firozpur', 'Firozpur', '152001'),
('Kapurthala Central', 'Kapurthala', 'Kapurthala', '144601'),
('Sangrur Central', 'Sangrur', 'Sangrur', '148001'),
('Barnala Central', 'Barnala', 'Barnala', '148101'),
('Khanna Central', 'Khanna', 'Ludhiana', '141401'),
('Phagwara Central', 'Phagwara', 'Kapurthala', '144401'),
('Rupnagar Central', 'Rupnagar', 'Rupnagar', '140001'),
('Sri Muktsar Sahib Central', 'Sri Muktsar Sahib', 'Sri Muktsar Sahib', '152026')
on conflict (name, pin_code) do update set city = excluded.city, district = excluded.district, is_active = true;

alter table public.profiles add column if not exists locality_id uuid references public.punjab_localities(id) on delete set null;
create index if not exists punjab_localities_city_idx on public.punjab_localities(city, is_active);
alter table public.punjab_localities enable row level security;
drop policy if exists "Anyone can read active Punjab localities" on public.punjab_localities;
create policy "Anyone can read active Punjab localities" on public.punjab_localities for select using (is_active = true);
