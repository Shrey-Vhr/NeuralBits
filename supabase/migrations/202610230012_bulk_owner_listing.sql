-- Secure owner listing and self-group exclusion for bulk pickup discovery.
-- Apply after 202610230008_real_bulk_operations.sql.

create or replace function public.bulk_my_groups()
returns table(
  group_id uuid,
  locality text,
  locality_pin_code text,
  preferred_date date,
  preferred_time_window text,
  join_deadline timestamptz,
  group_status text,
  assigned_vendor_id uuid,
  participant_count bigint,
  total_weight_kg numeric,
  my_contribution_id uuid,
  my_weight_kg numeric,
  my_stop_status text
)
language sql stable security definer set search_path = public
as $$
  select g.id, g.locality, g.locality_pin_code, g.preferred_date,
    g.preferred_time_window, g.join_deadline, g.group_status,
    g.assigned_vendor_id,
    count(c.id) filter (where c.stop_status <> 'cancelled'),
    coalesce(sum(c.estimated_weight_kg) filter (where c.stop_status <> 'cancelled'), 0),
    mine.id, mine.estimated_weight_kg, mine.stop_status
  from public.bulk_pickup_groups g
  left join public.bulk_pickup_contributions c on c.group_id = g.id
  left join lateral (
    select own.id, own.estimated_weight_kg, own.stop_status
    from public.bulk_pickup_contributions own
    where own.group_id = g.id and own.seller_user_id = auth.uid() and own.stop_status <> 'cancelled'
    limit 1
  ) mine on true
  where auth.uid() is not null
    and (g.created_by = auth.uid() or mine.id is not null)
  group by g.id, mine.id, mine.estimated_weight_kg, mine.stop_status;
$$;

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
    and not exists (
      select 1 from public.bulk_pickup_contributions own
      where own.group_id = g.id and own.seller_user_id = auth.uid() and own.stop_status <> 'cancelled'
    )
  group by g.id;
$$;

revoke all on function public.bulk_my_groups() from public;
grant execute on function public.bulk_my_groups() to authenticated;
revoke all on function public.bulk_discover_groups(text, date, text, uuid) from public;
grant execute on function public.bulk_discover_groups(text, date, text, uuid) to authenticated;
