-- Repair migration for optional-vendor pickup writes.
-- Apply after 202610230009_unassigned_pickups.sql if pickup inserts still return 42501.
-- This preserves RLS and limits inserts to the authenticated customer owner.

alter table public.pickup_requests alter column vendor_id drop not null;

drop policy if exists "Customers can create their own pickup requests" on public.pickup_requests;
create policy "Customers can create their own pickup requests"
  on public.pickup_requests for insert to authenticated
  with check (
    auth.uid() = customer_id
    and private.has_role(auth.uid(), 'customer')
    and status = 'requested'
    and (vendor_id is null or exists (
      select 1 from public.vendors v
      where v.id = pickup_requests.vendor_id
        and v.verification_status = 'approved'
        and v.is_active = true
    ))
    and exists (select 1 from public.materials m where m.id = material_id and m.is_published = true)
  );
