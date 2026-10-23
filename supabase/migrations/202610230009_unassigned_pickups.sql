-- Allow sellers to create pickup requests before a vendor is assigned.
-- Apply after 202610230008_real_bulk_operations.sql.
-- Existing assigned pickup rows are preserved.

alter table public.pickup_requests alter column vendor_id drop not null;

create or replace function private.validate_pickup_request_transition()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.customer_id <> old.customer_id or new.material_id <> old.material_id then
    raise exception 'Ownership and material fields cannot be changed';
  end if;

  if new.vendor_id is distinct from old.vendor_id then
    if private.has_role(auth.uid(), 'administrator') then
      null;
    elsif old.vendor_id is null and new.vendor_id is not null and exists (
      select 1 from public.bulk_pickup_contributions c
      join public.bulk_pickup_groups g on g.id = c.group_id
      where c.pickup_request_id = old.id and g.assigned_vendor_id = new.vendor_id and g.group_status in ('assigned', 'accepted', 'completed')
    ) then
      null;
    else
      raise exception 'Vendor assignment is not authorized';
    end if;
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

drop policy if exists "Customers can create their own pickup requests" on public.pickup_requests;
create policy "Customers can create their own pickup requests"
  on public.pickup_requests for insert to authenticated
  with check (
    auth.uid() = customer_id
    and private.has_role(auth.uid(), 'customer')
    and status = 'requested'
    and (vendor_id is null or exists (select 1 from public.vendors v where v.id = vendor_id and v.verification_status = 'approved' and v.is_active = true))
    and exists (select 1 from public.materials m where m.id = material_id and m.is_published = true)
  );

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
  update public.pickup_requests pr set vendor_id = vendor_to_assign, updated_at = now()
    from public.bulk_pickup_contributions c
    where c.group_id = group_to_assign and c.pickup_request_id = pr.id and c.contribution_status <> 'cancelled';
end;
$$;

create or replace function public.bulk_update_stop(contribution_to_update uuid, next_status text, actual_weight numeric default null)
returns void language plpgsql security definer set search_path = public
as $$
declare contribution_row public.bulk_pickup_contributions%rowtype; group_row public.bulk_pickup_groups%rowtype; pickup_id uuid;
begin
  select * into contribution_row from public.bulk_pickup_contributions where id = contribution_to_update for update;
  select * into group_row from public.bulk_pickup_groups where id = contribution_row.group_id for update;
  if not private.is_approved_vendor_member(auth.uid(), group_row.assigned_vendor_id) or group_row.group_status <> 'accepted' then raise exception 'Not authorized to update this stop'; end if;
  if next_status not in ('collected', 'missed', 'cancelled') or contribution_row.stop_status <> 'joined' then raise exception 'Invalid stop transition'; end if;
  if next_status = 'collected' and (actual_weight is null or actual_weight <= 0) then raise exception 'Collected weight is required'; end if;
  update public.bulk_pickup_contributions set stop_status = next_status, contribution_status = case when next_status = 'collected' then 'collected' else 'cancelled' end, actual_weight_kg = actual_weight, updated_at = now() where id = contribution_to_update;
  pickup_id := contribution_row.pickup_request_id;
  if pickup_id is not null and next_status = 'collected' then
    update public.pickup_requests set status = 'accepted', updated_at = now() where id = pickup_id and status = 'requested';
    update public.pickup_requests set status = 'completed', updated_at = now() where id = pickup_id and status = 'accepted';
  elsif pickup_id is not null and next_status in ('missed', 'cancelled') then
    update public.pickup_requests set status = 'rejected', updated_at = now() where id = pickup_id and status = 'requested';
  end if;
  if not exists (select 1 from public.bulk_pickup_contributions where group_id = group_row.id and stop_status = 'joined') then update public.bulk_pickup_groups set group_status = 'completed', updated_at = now() where id = group_row.id; end if;
end;
$$;

revoke all on function public.bulk_assign_vendor(uuid, uuid) from public;
revoke all on function public.bulk_update_stop(uuid, text, numeric) from public;
grant execute on function public.bulk_assign_vendor(uuid, uuid) to authenticated;
grant execute on function public.bulk_update_stop(uuid, text, numeric) to authenticated;
