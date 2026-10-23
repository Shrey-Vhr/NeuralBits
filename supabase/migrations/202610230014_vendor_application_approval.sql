-- Secure administrator-only vendor approval.
-- Apply after 202610220006_onboarding.sql and 202610230013_vendor_job_claims.sql.

alter table public.vendor_applications add column if not exists vendor_id uuid references public.vendors(id) on delete set null;
alter table public.vendors add column if not exists service_pin_codes text[] not null default '{}';

create or replace function public.approve_vendor_application(application_to_approve uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  application_row public.vendor_applications%rowtype;
  approved_vendor uuid;
  vendor_slug text;
  material_row record;
begin
  if not private.has_role(auth.uid(), 'administrator') then
    raise exception 'Administrator authorization required';
  end if;

  select * into application_row from public.vendor_applications where id = application_to_approve for update;
  if application_row.id is null then raise exception 'Vendor application not found'; end if;
  if application_row.status = 'rejected' then raise exception 'Rejected applications require a new application'; end if;

  approved_vendor := application_row.vendor_id;
  if approved_vendor is null then
    vendor_slug := regexp_replace(lower(application_row.business_name), '[^a-z0-9]+', '-', 'g') || '-' || left(application_row.id::text, 8);
    insert into public.vendors(
      slug, business_name, business_description, public_phone, public_email,
      locality, city, state, service_areas, service_pin_codes,
      verification_status, is_active
    ) values (
      vendor_slug,
      application_row.business_name,
      'Approved vendor application for ' || application_row.business_name,
      case when application_row.publish_contact_consent then application_row.phone else null end,
      case when application_row.publish_contact_consent then application_row.email else null end,
      application_row.locality,
      application_row.locality,
      'Punjab',
      array[application_row.locality],
      array[application_row.service_pin_code],
      'approved', true
    ) returning id into approved_vendor;
  else
    update public.vendors set
      business_name = application_row.business_name,
      public_phone = case when application_row.publish_contact_consent then application_row.phone else public_phone end,
      public_email = case when application_row.publish_contact_consent then application_row.email else public_email end,
      locality = application_row.locality,
      city = application_row.locality,
      service_areas = array[application_row.locality],
      service_pin_codes = array[application_row.service_pin_code],
      verification_status = 'approved', is_active = true, updated_at = now()
    where id = approved_vendor;
  end if;

  for material_row in
    select m.id from public.materials m
    where lower(m.name) = any(array(select lower(value) from unnest(application_row.accepted_materials) value))
      and m.is_published = true
  loop
    insert into public.vendor_materials(vendor_id, material_id, availability_status)
      values (approved_vendor, material_row.id, 'available')
      on conflict (vendor_id, material_id) do update set availability_status = 'available', updated_at = now();
  end loop;

  insert into public.user_roles(user_id, role, granted_by)
    values (application_row.user_id, 'vendor', auth.uid())
    on conflict (user_id, role) do nothing;
  insert into public.vendor_memberships(vendor_id, user_id, membership_status, granted_by, updated_at)
    values (approved_vendor, application_row.user_id, 'approved', auth.uid(), now())
    on conflict (vendor_id, user_id) do update set membership_status = 'approved', granted_by = auth.uid(), updated_at = now();
  update public.vendor_applications set status = 'approved', vendor_id = approved_vendor, review_notes = 'Approved by administrator', updated_at = now() where id = application_to_approve;
  return approved_vendor;
end;
$$;

revoke all on function public.approve_vendor_application(uuid) from public;
grant execute on function public.approve_vendor_application(uuid) to authenticated;
