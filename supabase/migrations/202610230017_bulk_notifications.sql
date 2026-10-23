-- Automatically open a bulk opportunity for unassigned pickups and notify opted-in users in the same PIN.
-- Apply after 202610230016_pickup_line_items.sql.

create table if not exists public.bulk_pickup_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid not null references public.bulk_pickup_groups(id) on delete cascade,
  notification_type text not null default 'nearby_bulk_pickup' check (notification_type = 'nearby_bulk_pickup'),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (user_id, group_id, notification_type)
);

create index if not exists bulk_notifications_user_idx on public.bulk_pickup_notifications(user_id, created_at desc);
alter table public.bulk_pickup_notifications enable row level security;
drop policy if exists "Users read their own bulk notifications" on public.bulk_pickup_notifications;
create policy "Users read their own bulk notifications" on public.bulk_pickup_notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users mark their own bulk notifications read" on public.bulk_pickup_notifications;
create policy "Users mark their own bulk notifications read" on public.bulk_pickup_notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function private.notify_bulk_pickup_locality()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.bulk_pickup_notifications(user_id, group_id)
  select p.id, new.id
  from public.profiles p
  where p.id <> new.created_by
    and p.pin_code = new.locality_pin_code
    and p.bulk_alerts_enabled = true
  on conflict (user_id, group_id, notification_type) do nothing;
  return new;
end;
$$;

drop trigger if exists notify_bulk_pickup_locality on public.bulk_pickup_groups;
create trigger notify_bulk_pickup_locality
after insert on public.bulk_pickup_groups
for each row execute procedure private.notify_bulk_pickup_locality();

create or replace function public.get_my_bulk_notifications()
returns table(notification_id uuid, group_id uuid, created_at timestamptz, locality text, locality_pin_code text, preferred_date date, preferred_time_window text, join_deadline timestamptz, material_id uuid, participant_count bigint, total_weight_kg numeric)
language sql stable security definer set search_path = public
as $$
  select n.id, g.id, n.created_at, g.locality, g.locality_pin_code, g.preferred_date, g.preferred_time_window, g.join_deadline, g.material_id,
    count(c.id) filter (where c.stop_status <> 'cancelled'),
    coalesce(sum(c.estimated_weight_kg) filter (where c.stop_status <> 'cancelled'), 0)
  from public.bulk_pickup_notifications n
  join public.bulk_pickup_groups g on g.id = n.group_id
  left join public.bulk_pickup_contributions c on c.group_id = g.id
  where n.user_id = auth.uid() and n.read_at is null and g.group_status = 'open' and g.join_deadline > now()
  group by n.id, g.id;
$$;

revoke all on function public.get_my_bulk_notifications() from public;
grant execute on function public.get_my_bulk_notifications() to authenticated;
