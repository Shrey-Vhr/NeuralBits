-- Approved-vendor job discovery and atomic claiming.
-- Apply after 202610230009_unassigned_pickups.sql and 202610230012_bulk_owner_listing.sql.

alter table public.vendors add column if not exists service_pin_codes text[] not null default '{}';

create or replace function private.validate_pickup_request_transition()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.customer_id <> old.customer_id or new.material_id <> old.material_id then raise exception 'Ownership and material fields cannot be changed'; end if;
  if new.vendor_id is distinct from old.vendor_id then
    if private.has_role(auth.uid(), 'administrator') then null;
    elsif old.vendor_id is null and new.vendor_id is not null and (
      exists (select 1 from public.bulk_pickup_contributions c join public.bulk_pickup_groups g on g.id = c.group_id where c.pickup_request_id = old.id and g.assigned_vendor_id = new.vendor_id and g.group_status in ('assigned', 'accepted', 'completed'))
      or private.vendor_can_collect(auth.uid(), new.vendor_id, old.material_id, old.locality, old.locality_pin_code)
    ) then null;
    else raise exception 'Vendor assignment is not authorized'; end if;
  end if;
  if private.has_role(auth.uid(), 'administrator') then return new; end if;
  if private.has_role(auth.uid(), 'vendor') and new.vendor_id is not null and private.is_approved_vendor_member(auth.uid(), new.vendor_id) then
    if old.status <> 'requested' or new.status not in ('accepted', 'rejected') then
      if old.status <> 'accepted' or new.status <> 'completed' then raise exception 'Invalid vendor status transition'; end if;
    end if;
    return new;
  end if;
  if auth.uid() = old.customer_id and old.status in ('requested', 'accepted') and new.status = 'cancelled' then return new; end if;
  if new.vendor_id is distinct from old.vendor_id and old.vendor_id is null then return new; end if;
  raise exception 'User is not authorized to change this pickup request';
end;
$$;

create or replace function private.vendor_can_collect(requested_user uuid, requested_vendor uuid, requested_material uuid, requested_locality text, requested_pin text)
returns boolean language sql stable security definer set search_path = public
as $$
  select private.is_approved_vendor_member(requested_user, requested_vendor)
    and exists (select 1 from public.vendors v where v.id = requested_vendor and v.verification_status = 'approved' and v.is_active = true and (v.service_pin_codes @> array[requested_pin] or v.locality = requested_locality or v.service_areas @> array[requested_locality]))
    and exists (select 1 from public.vendor_materials vm where vm.vendor_id = requested_vendor and vm.material_id = requested_material and vm.availability_status <> 'unavailable');
$$;

create or replace function public.vendor_available_pickups()
returns table(pickup_id uuid, locality text, locality_pin_code text, material_id uuid, approximate_quantity numeric, preferred_date date, preferred_time_window text)
language sql stable security definer set search_path = public
as $$
  select p.id, p.locality, p.locality_pin_code, p.material_id, p.approximate_quantity, p.preferred_date, p.preferred_time_window
  from public.pickup_requests p
  join public.vendor_memberships vm on vm.user_id = auth.uid() and vm.membership_status = 'approved'
  where p.vendor_id is null and p.status = 'requested'
    and private.vendor_can_collect(auth.uid(), vm.vendor_id, p.material_id, p.locality, p.locality_pin_code);
$$;

create or replace function public.vendor_claim_pickup(requested_pickup uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare pickup_row public.pickup_requests%rowtype; vendor_row uuid;
begin
  select * into pickup_row from public.pickup_requests where id = requested_pickup for update;
  select vm.vendor_id into vendor_row from public.vendor_memberships vm where vm.user_id = auth.uid() and vm.membership_status = 'approved' limit 1;
  if vendor_row is null or not private.vendor_can_collect(auth.uid(), vendor_row, pickup_row.material_id, pickup_row.locality, pickup_row.locality_pin_code) then raise exception 'Vendor is not eligible for this pickup'; end if;
  if pickup_row.vendor_id is not null or pickup_row.status <> 'requested' then raise exception 'Pickup is no longer available'; end if;
  update public.pickup_requests set vendor_id = vendor_row, updated_at = now() where id = requested_pickup and vendor_id is null and status = 'requested';
  if not found then raise exception 'Pickup was claimed by another vendor'; end if;
end;
$$;

create or replace function public.vendor_available_bulk_groups()
returns table(group_id uuid, locality text, locality_pin_code text, material_id uuid, preferred_date date, preferred_time_window text, participant_count bigint, total_weight_kg numeric, join_deadline timestamptz)
language sql stable security definer set search_path = public
as $$
  select g.id, g.locality, g.locality_pin_code, g.material_id, g.preferred_date, g.preferred_time_window,
    count(c.id) filter (where c.stop_status <> 'cancelled'),
    coalesce(sum(c.estimated_weight_kg) filter (where c.stop_status <> 'cancelled'), 0), g.join_deadline
  from public.bulk_pickup_groups g
  join public.vendor_memberships vm on vm.user_id = auth.uid() and vm.membership_status = 'approved'
  left join public.bulk_pickup_contributions c on c.group_id = g.id
  where g.assigned_vendor_id is null and g.group_status in ('open', 'closed')
    and private.vendor_can_collect(auth.uid(), vm.vendor_id, g.material_id, g.locality, g.locality_pin_code)
  group by g.id, vm.vendor_id;
$$;

create or replace function public.vendor_claim_bulk_group(requested_group uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare group_row public.bulk_pickup_groups%rowtype; vendor_row uuid;
begin
  select * into group_row from public.bulk_pickup_groups where id = requested_group for update;
  select vm.vendor_id into vendor_row from public.vendor_memberships vm where vm.user_id = auth.uid() and vm.membership_status = 'approved' limit 1;
  if vendor_row is null or not private.vendor_can_collect(auth.uid(), vendor_row, group_row.material_id, group_row.locality, group_row.locality_pin_code) then raise exception 'Vendor is not eligible for this bulk group'; end if;
  if group_row.assigned_vendor_id is not null or group_row.group_status not in ('open', 'closed') then raise exception 'Bulk group is no longer available'; end if;
  update public.bulk_pickup_groups set assigned_vendor_id = vendor_row, group_status = 'assigned', updated_at = now() where id = requested_group and assigned_vendor_id is null and group_status in ('open', 'closed');
  if not found then raise exception 'Bulk group was claimed by another vendor'; end if;
  update public.pickup_requests p set vendor_id = vendor_row, updated_at = now()
    from public.bulk_pickup_contributions c where c.group_id = requested_group and c.pickup_request_id = p.id and c.stop_status <> 'cancelled';
end;
$$;

revoke all on function public.vendor_available_pickups() from public;
revoke all on function public.vendor_claim_pickup(uuid) from public;
revoke all on function public.vendor_available_bulk_groups() from public;
revoke all on function public.vendor_claim_bulk_group(uuid) from public;
grant execute on function public.vendor_available_pickups() to authenticated;
grant execute on function public.vendor_claim_pickup(uuid) to authenticated;
grant execute on function public.vendor_available_bulk_groups() to authenticated;
grant execute on function public.vendor_claim_bulk_group(uuid) to authenticated;
