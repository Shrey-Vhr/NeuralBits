-- Secure role read for server-side authorization diagnostics.
-- Users can read only their own roles; no role assignment is exposed.

create or replace function public.get_current_user_roles()
returns table(role public.app_role)
language sql stable security definer set search_path = public
as $$
  select ur.role from public.user_roles ur where ur.user_id = auth.uid();
$$;

revoke all on function public.get_current_user_roles() from public;
grant execute on function public.get_current_user_roles() to authenticated;
