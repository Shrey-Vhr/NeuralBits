-- Copy non-secret onboarding metadata from auth.users into the owner's profile row.
-- Passwords are never copied; Supabase Auth remains the password store.
-- Apply after 202610220006_onboarding.sql and 202610220007_punjab_localities.sql.

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare metadata jsonb := new.raw_user_meta_data;
begin
  insert into public.profiles (id, display_name, phone, locality, pin_code, locality_id)
  values (
    new.id,
    nullif(left(metadata ->> 'display_name', 120), ''),
    nullif(left(metadata ->> 'phone', 30), ''),
    nullif(left(metadata ->> 'locality', 120), ''),
    case when metadata ->> 'pin_code' ~ '^[0-9]{6}$' then metadata ->> 'pin_code' else null end,
    case when metadata ->> 'locality_id' ~ '^[0-9a-fA-F-]{36}$' then (metadata ->> 'locality_id')::uuid else null end
  )
  on conflict (id) do update set
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    locality = coalesce(excluded.locality, public.profiles.locality),
    pin_code = coalesce(excluded.pin_code, public.profiles.pin_code),
    locality_id = coalesce(excluded.locality_id, public.profiles.locality_id),
    updated_at = now();
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end;
$$;
