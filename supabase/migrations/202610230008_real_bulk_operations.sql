-- Real multi-user bulk pickup operations. Apply after 202610220005_bulk_pickup_groups.sql.
-- This migration does not use a service-role key and does not delete existing data.

alter table public.pickup_requests add column if not exists locality_pin_code text check (locality_pin_code is null or locality_pin_code ~ '^[0-9]{6}$');
alter table public.bulk_pickup_groups add column if not exists locality text;
alter table public.bulk_pickup_groups add column if not exists preferred_date date;
alter table public.bulk_pickup_groups add column if not exists max_stops integer not null default 10 check (max_stops between 2 and 20);
alter table public.bulk_pickup_contributions add column if not exists stop_status text not null default 'joined' check (stop_status in ('joined', 'collected', 'missed', 'cancelled'));
alter table public.bulk_pickup_contributions add column if not exists actual_weight_kg numeric(10,2) check (actual_weight_kg is null or actual_weight_kg > 0);
alter table public.bulk_pickup_contributions add column if not exists updated_at timestamptz not null default now();

create index if not exists pickup_requests_locality_pin_idx on public.pickup_requests(locality_pin_code, preferred_date, preferred_time_window, status);
create index if not exists bulk_groups_open_match_idx on public.bulk_pickup_groups(locality_pin_code, preferred_date, preferred_time_window, group_status, join_deadline);
create unique index if not exists bulk_active_pickup_once_idx on public.bulk_pickup_contributions(pickup_request_id) where pickup_request_id is not null and contribution_status <> 'cancelled';

do $$ begin
  alter table public.bulk_pickup_groups drop constraint if exists bulk_pickup_groups_group_status_check;
  alter table public.bulk_pickup_groups add constraint bulk_pickup_groups_group_status_check check (group_status in ('open', 'closed', 'assigned', 'accepted', 'completed', 'cancelled'));
exception when duplicate_object then null;
end $$;

create or replace function public.bulk_discover_groups(
  requested_pin text,
  requested_date date,
  requested_window text,
  requested_material uuid
)
returns table(group_id uuid, preferred_date date, preferred_time_window text, join_deadline timestamptz, participant_count bigint, total_weight_kg numeric, material_id uuid)
language sql stable security definer set search_path = public
as $$
  select g.id, g.preferred_date, g.preferred_time_window, g.join_deadline,
    count(c.id) filter (where c.stop_status in ('joined', 'collected')),
    coalesce(sum(c.estimated_weight_kg) filter (where c.stop_status in ('joined', 'collected')), 0), g.material_id
  from public.bulk_pickup_groups g
  left join public.bulk_pickup_contributions c on c.group_id = g.id
  where auth.uid() is not null and g.locality_pin_code = requested_pin
    and g.preferred_date = requested_date and g.preferred_time_window = requested_window
    and g.material_id = requested_material and g.group_status = 'open'
    and g.join_deadline > now()
  group by g.id;
$$;

create or replace function public.bulk_create_group(pickup_id uuid, requested_pin text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare pickup_row public.pickup_requests%rowtype; new_group uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into pickup_row from public.pickup_requests where id = pickup_id for update;
  if pickup_row.customer_id <> auth.uid() or pickup_row.status <> 'requested' then raise exception 'Pickup is not eligible for grouping'; end if;
  if pickup_row.locality_pin_code is null or pickup_row.locality_pin_code <> requested_pin then raise exception 'Pickup locality PIN does not match'; end if;
  if pickup_row.material_id is null or pickup_row.material_id in (select id from public.materials where slug in ('electronic-waste', 'mixed-materials')) then raise exception 'Material is not eligible for ordinary bulk collection'; end if;
  if exists (select 1 from public.bulk_pickup_contributions where pickup_request_id = pickup_id and contribution_status <> 'cancelled') then raise exception 'Pickup already belongs to an active bulk group'; end if;
  insert into public.bulk_pickup_groups(locality_pin_code, locality, material_id, preferred_date, preferred_time_window, join_deadline, group_status, created_by)
    values (requested_pin, pickup_row.locality, pickup_row.material_id, pickup_row.preferred_date, pickup_row.preferred_time_window, now() + interval '60 minutes', 'open', auth.uid()) returning id into new_group;
  insert into public.bulk_pickup_contributions(group_id, seller_user_id, material_id, estimated_weight_kg, pickup_request_id)
    values (new_group, auth.uid(), pickup_row.material_id, pickup_row.approximate_quantity, pickup_id);
  return new_group;
end;
$$;

create or replace function public.bulk_join_group(group_to_join uuid, pickup_id uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare pickup_row public.pickup_requests%rowtype; group_row public.bulk_pickup_groups%rowtype; active_stops integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into pickup_row from public.pickup_requests where id = pickup_id for update;
  select * into group_row from public.bulk_pickup_groups where id = group_to_join for update;
  select count(*) into active_stops from public.bulk_pickup_contributions where group_id = group_to_join and stop_status in ('joined', 'collected');
  if pickup_row.customer_id <> auth.uid() or pickup_row.status <> 'requested' then raise exception 'Pickup is not eligible for grouping'; end if;
  if group_row.group_status <> 'open' or group_row.join_deadline <= now() then raise exception 'Joining window has closed'; end if;
  if active_stops >= group_row.max_stops then raise exception 'Bulk group is full'; end if;
  if pickup_row.locality_pin_code is null or pickup_row.locality_pin_code <> group_row.locality_pin_code or pickup_row.locality is distinct from group_row.locality then raise exception 'Locality does not match'; end if;
  if pickup_row.preferred_date <> group_row.preferred_date or pickup_row.preferred_time_window <> group_row.preferred_time_window or pickup_row.material_id <> group_row.material_id then raise exception 'Pickup is not compatible with this group'; end if;
  if pickup_row.material_id in (select id from public.materials where slug in ('electronic-waste', 'mixed-materials')) then raise exception 'Material is not eligible for ordinary bulk collection'; end if;
  if exists (select 1 from public.bulk_pickup_contributions where pickup_request_id = pickup_id and contribution_status <> 'cancelled') then raise exception 'Pickup already belongs to an active bulk group'; end if;
  insert into public.bulk_pickup_contributions(group_id, seller_user_id, material_id, estimated_weight_kg, pickup_request_id) values (group_to_join, auth.uid(), pickup_row.material_id, pickup_row.approximate_quantity, pickup_id);
  return group_to_join;
end;
$$;

create or replace function public.bulk_leave_group(group_to_leave uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  update public.bulk_pickup_contributions c set contribution_status = 'cancelled', stop_status = 'cancelled', updated_at = now()
  where c.group_id = group_to_leave and c.seller_user_id = auth.uid()
    and exists (select 1 from public.bulk_pickup_groups g where g.id = c.group_id and g.group_status = 'open' and g.join_deadline > now());
  if not found then raise exception 'You cannot leave this bulk group now'; end if;
end;
$$;

create or replace function public.bulk_close_group(group_to_close uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  update public.bulk_pickup_groups set group_status = 'closed', updated_at = now() where id = group_to_close and created_by = auth.uid() and group_status = 'open';
  if not found then raise exception 'Only the group creator can close an open group'; end if;
end;
$$;

create or replace function public.bulk_assign_vendor(group_to_assign uuid, vendor_to_assign uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare group_row public.bulk_pickup_groups%rowtype;
begin
  select * into group_row from public.bulk_pickup_groups where id = group_to_assign for update;
  if group_row.created_by <> auth.uid() and not private.has_role(auth.uid(), 'administrator') then raise exception 'Not authorized to assign this group'; end if;
  if group_row.group_status not in ('open', 'closed') then raise exception 'Group is not assignable'; end if;
  if not exists (select 1 from public.vendors v join public.vendor_materials vm on vm.vendor_id = v.id where v.id = vendor_to_assign and v.verification_status = 'approved' and v.is_active = true and vm.material_id = group_row.material_id and vm.availability_status <> 'unavailable') then raise exception 'Vendor is not eligible for this material'; end if;
  update public.bulk_pickup_groups set assigned_vendor_id = vendor_to_assign, group_status = 'assigned', updated_at = now() where id = group_to_assign;
end;
$$;

create or replace function public.bulk_accept_group(group_to_accept uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  update public.bulk_pickup_groups g set group_status = 'accepted', updated_at = now() where g.id = group_to_accept and g.group_status = 'assigned' and private.is_approved_vendor_member(auth.uid(), g.assigned_vendor_id);
  if not found then raise exception 'Only an assigned approved vendor can accept this group'; end if;
end;
$$;

create or replace function public.bulk_update_stop(contribution_to_update uuid, next_status text, actual_weight numeric default null)
returns void language plpgsql security definer set search_path = public
as $$
declare contribution_row public.bulk_pickup_contributions%rowtype; group_row public.bulk_pickup_groups%rowtype;
begin
  select * into contribution_row from public.bulk_pickup_contributions where id = contribution_to_update for update;
  select * into group_row from public.bulk_pickup_groups where id = contribution_row.group_id for update;
  if not private.is_approved_vendor_member(auth.uid(), group_row.assigned_vendor_id) or group_row.group_status <> 'accepted' then raise exception 'Not authorized to update this stop'; end if;
  if next_status not in ('collected', 'missed', 'cancelled') or contribution_row.stop_status <> 'joined' then raise exception 'Invalid stop transition'; end if;
  if next_status = 'collected' and (actual_weight is null or actual_weight <= 0) then raise exception 'Collected weight is required'; end if;
  update public.bulk_pickup_contributions set stop_status = next_status, contribution_status = case when next_status = 'collected' then 'collected' else 'cancelled' end, actual_weight_kg = actual_weight, updated_at = now() where id = contribution_to_update;
  if not exists (select 1 from public.bulk_pickup_contributions where group_id = group_row.id and stop_status = 'joined') then update public.bulk_pickup_groups set group_status = 'completed', updated_at = now() where id = group_row.id; end if;
end;
$$;

revoke all on function public.bulk_discover_groups(text, date, text, uuid) from public;
revoke all on function public.bulk_create_group(uuid, text) from public;
revoke all on function public.bulk_join_group(uuid, uuid) from public;
revoke all on function public.bulk_leave_group(uuid) from public;
revoke all on function public.bulk_close_group(uuid) from public;
revoke all on function public.bulk_assign_vendor(uuid, uuid) from public;
revoke all on function public.bulk_accept_group(uuid) from public;
revoke all on function public.bulk_update_stop(uuid, text, numeric) from public;
grant execute on function public.bulk_discover_groups(text, date, text, uuid) to authenticated;
grant execute on function public.bulk_create_group(uuid, text) to authenticated;
grant execute on function public.bulk_join_group(uuid, uuid) to authenticated;
grant execute on function public.bulk_leave_group(uuid) to authenticated;
grant execute on function public.bulk_close_group(uuid) to authenticated;
grant execute on function public.bulk_assign_vendor(uuid, uuid) to authenticated;
grant execute on function public.bulk_accept_group(uuid) to authenticated;
grant execute on function public.bulk_update_stop(uuid, text, numeric) to authenticated;
