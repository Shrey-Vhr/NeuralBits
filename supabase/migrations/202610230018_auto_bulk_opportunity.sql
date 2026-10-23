-- Automatically create a locality bulk opportunity after an unassigned pickup is saved.
-- Apply after 202610230017_bulk_notifications.sql.

create or replace function private.auto_open_bulk_opportunity()
returns trigger language plpgsql security definer set search_path = public
as $$
declare pickup_row public.pickup_requests%rowtype;
begin
  select * into pickup_row from public.pickup_requests where id = new.pickup_request_id;
  if pickup_row.vendor_id is null and pickup_row.locality_pin_code is not null and pickup_row.status = 'requested'
     and not exists (select 1 from public.bulk_pickup_contributions c where c.pickup_request_id = pickup_row.id and c.contribution_status <> 'cancelled')
  then
    perform public.bulk_create_group(pickup_row.id, pickup_row.locality_pin_code);
  end if;
  return new;
end;
$$;

drop trigger if exists auto_open_bulk_opportunity on public.pickup_request_items;
create trigger auto_open_bulk_opportunity
after insert on public.pickup_request_items
for each row execute procedure private.auto_open_bulk_opportunity();
