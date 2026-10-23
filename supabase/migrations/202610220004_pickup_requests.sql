-- ScrapReady Milestone 5: real pickup requests.
-- Apply after 202610220003_auth_roles.sql.

create table if not exists public.pickup_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete restrict,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  material_id uuid not null references public.materials(id) on delete restrict,
  approximate_quantity numeric(10, 2) not null check (approximate_quantity > 0),
  quantity_unit text not null default 'kg' check (quantity_unit = 'kg'),
  pickup_address text not null check (char_length(pickup_address) between 5 and 500),
  locality text not null check (char_length(locality) between 2 and 120),
  preferred_date date not null,
  preferred_time_window text not null check (preferred_time_window in ('morning', 'afternoon', 'evening')),
  customer_notes text check (customer_notes is null or char_length(customer_notes) <= 1000),
  status text not null default 'requested' check (status in ('requested', 'accepted', 'rejected', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pickup_requests_customer_idx on public.pickup_requests(customer_id, created_at desc);
create index if not exists pickup_requests_vendor_idx on public.pickup_requests(vendor_id, status, created_at desc);
create index if not exists pickup_requests_material_idx on public.pickup_requests(material_id);

alter table public.pickup_requests enable row level security;

create or replace function private.validate_pickup_request_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.customer_id <> old.customer_id or new.vendor_id <> old.vendor_id or new.material_id <> old.material_id then
    raise exception 'Ownership and material fields cannot be changed';
  end if;

  if private.has_role(auth.uid(), 'administrator') then
    return new;
  end if;

  if private.has_role(auth.uid(), 'vendor') and private.is_approved_vendor_member(auth.uid(), old.vendor_id) then
    if old.status <> 'requested' or new.status not in ('accepted', 'rejected') then
      if old.status <> 'accepted' or new.status <> 'completed' then
        raise exception 'Invalid vendor status transition';
      end if;
    end if;
    return new;
  end if;

  if auth.uid() = old.customer_id and old.status in ('requested', 'accepted') and new.status = 'cancelled' then
    return new;
  end if;

  raise exception 'User is not authorized to change this pickup request';
end;
$$;

drop trigger if exists pickup_request_transition on public.pickup_requests;
create trigger pickup_request_transition
  before update on public.pickup_requests
  for each row execute procedure private.validate_pickup_request_transition();

drop policy if exists "Customers can read their own pickup requests" on public.pickup_requests;
create policy "Customers can read their own pickup requests"
  on public.pickup_requests for select to authenticated
  using (auth.uid() = customer_id);

drop policy if exists "Approved vendor members can read assigned pickups" on public.pickup_requests;
create policy "Approved vendor members can read assigned pickups"
  on public.pickup_requests for select to authenticated
  using (private.is_approved_vendor_member(auth.uid(), vendor_id));

drop policy if exists "Administrators can read pickup requests" on public.pickup_requests;
create policy "Administrators can read pickup requests"
  on public.pickup_requests for select to authenticated
  using (private.has_role(auth.uid(), 'administrator'));

drop policy if exists "Customers can create their own pickup requests" on public.pickup_requests;
create policy "Customers can create their own pickup requests"
  on public.pickup_requests for insert to authenticated
  with check (
    auth.uid() = customer_id
    and private.has_role(auth.uid(), 'customer')
    and status = 'requested'
    and exists (select 1 from public.vendors v where v.id = vendor_id and v.verification_status = 'approved' and v.is_active = true)
    and exists (select 1 from public.materials m where m.id = material_id and m.is_published = true)
  );

drop policy if exists "Customers and assigned vendors can update pickups" on public.pickup_requests;
create policy "Customers and assigned vendors can update pickups"
  on public.pickup_requests for update to authenticated
  using (
    auth.uid() = customer_id
    or private.is_approved_vendor_member(auth.uid(), vendor_id)
    or private.has_role(auth.uid(), 'administrator')
  )
  with check (
    auth.uid() = customer_id
    or private.is_approved_vendor_member(auth.uid(), vendor_id)
    or private.has_role(auth.uid(), 'administrator')
  );

-- No anonymous access and no public delete policy are provided.
