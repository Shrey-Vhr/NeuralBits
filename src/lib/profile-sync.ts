import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function syncProfileFromAuthUser(supabase: SupabaseClient, user: User) {
  const metadata = user.user_metadata ?? {};
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof metadata.display_name === "string") update.display_name = metadata.display_name.trim() || null;
  if (typeof metadata.phone === "string") update.phone = metadata.phone.trim() || null;
  if (typeof metadata.locality === "string") update.locality = metadata.locality.trim() || null;
  if (typeof metadata.pin_code === "string" && /^\d{6}$/.test(metadata.pin_code)) update.pin_code = metadata.pin_code;
  if (typeof metadata.locality_id === "string" && /^[0-9a-f-]{36}$/i.test(metadata.locality_id)) update.locality_id = metadata.locality_id;
  return supabase.from("profiles").update(update).eq("id", user.id);
}
