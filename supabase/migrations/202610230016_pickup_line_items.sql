-- Multi-material pickup requests while preserving the existing pickup_requests parent.
-- Apply after 202610230009_unassigned_pickups.sql.

create table if not exists public.pickup_request_items (
  id uuid primary key default gen_random_uuid(),
  pickup_request_id uuid not null references public.pickup_requests(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete restrict,
  estimated_quantity_kg numeric(10,2) not null check (estimated_quantity_kg > 0),
  actual_weight_kg numeric(10,2) check (actual_weight_kg is null or actual_weight_kg > 0),
  created_at timestamptz not null default now(),
  unique (pickup_request_id, material_id)
);

create index if not exists pickup_request_items_request_idx on public.pickup_request_items(pickup_request_id);
create index if not exists pickup_request_items_material_idx on public.pickup_request_items(material_id);

alter table public.pickup_request_items enable row level security;
drop policy if exists "Customers and assigned vendors read pickup items" on public.pickup_request_items;
create policy "Customers and assigned vendors read pickup items"
  on public.pickup_request_items for select to authenticated
  using (exists (
    select 1 from public.pickup_requests p
    where p.id = pickup_request_id
      and (p.customer_id = auth.uid() or private.is_approved_vendor_member(auth.uid(), p.vendor_id) or private.has_role(auth.uid(), 'administrator'))
  ));

insert into public.pickup_request_items (pickup_request_id, material_id, estimated_quantity_kg)
select p.id, p.material_id, p.approximate_quantity
from public.pickup_requests p
where not exists (select 1 from public.pickup_request_items i where i.pickup_request_id = p.id);

create or replace function public.create_pickup_request(
  requested_vendor uuid,
  requested_items jsonb,
  requested_address text,
  requested_locality text,
  requested_pin text,
  requested_date date,
  requested_window text,
  requested_notes text default null
)
returns table(pickup_id uuid, pickup_status text, assigned_vendor_id uuid)
language plpgsql security definer set search_path = public
as $$
declare
  new_pickup uuid;
  first_material uuid;
  total_quantity numeric := 0;
  item jsonb;
  item_material uuid;
  item_quantity numeric;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if requested_address is null or char_length(trim(requested_address)) < 5 then raise exception 'Pickup address is required'; end if;
  if requested_locality is null or char_length(trim(requested_locality)) < 2 then raise exception 'Locality is required'; end if;
  if requested_pin is null or requested_pin !~ '^[0-9]{6}$' then raise exception 'A valid six-digit locality PIN is required'; end if;
  if requested_window not in ('morning', 'afternoon', 'evening') then raise exception 'Invalid pickup time window'; end if;
  if jsonb_typeof(requested_items) <> 'array' or jsonb_array_length(requested_items) < 1 or jsonb_array_length(requested_items) > 10 then raise exception 'Select between one and ten materials'; end if;
  if requested_vendor is not null and not exists (select 1 from public.vendors v where v.id = requested_vendor and v.verification_status = 'approved' and v.is_active = true) then raise exception 'Vendor is not currently available'; end if;

  for item in select value from jsonb_array_elements(requested_items)
  loop
    item_material := (item ->> 'material_id')::uuid;
    item_quantity := (item ->> 'quantity_kg')::numeric;
    if item_quantity is null or item_quantity <= 0 then raise exception 'Every material must have a positive weight'; end if;
    if not exists (select 1 from public.materials m where m.id = item_material and m.is_published = true) then raise exception 'Material is not available'; end if;
    if requested_vendor is not null and not exists (select 1 from public.vendor_materials vm where vm.vendor_id = requested_vendor and vm.material_id = item_material and vm.availability_status <> 'unavailable') then raise exception 'Vendor does not accept every selected material'; end if;
    if first_material is null then first_material := item_material; end if;
    total_quantity := total_quantity + item_quantity;
  end loop;

  insert into public.pickup_requests(customer_id, vendor_id, material_id, approximate_quantity, quantity_unit, pickup_address, locality, locality_pin_code, preferred_date, preferred_time_window, customer_notes, status)
    values (auth.uid(), requested_vendor, first_material, total_quantity, 'kg', trim(requested_address), trim(requested_locality), requested_pin, requested_date, requested_window, nullif(trim(requested_notes), ''), 'requested')
    returning id into new_pickup;

  for item in select value from jsonb_array_elements(requested_items)
  loop
    insert into public.pickup_request_items(pickup_request_id, material_id, estimated_quantity_kg)
      values (new_pickup, (item ->> 'material_id')::uuid, (item ->> 'quantity_kg')::numeric);
  end loop;
  return query select new_pickup, 'requested'::text, requested_vendor;
end;
$$;

revoke all on function public.create_pickup_request(uuid, jsonb, text, text, text, date, text, text) from public;
grant execute on function public.create_pickup_request(uuid, jsonb, text, text, text, date, text, text) to authenticated;
