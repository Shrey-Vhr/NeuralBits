import { PageShell } from "@/components/page-shell";
import { ProfileForm } from "@/components/profile-form";
import { SignOutButton } from "@/components/sign-out-button";
import { requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function ProfilePage() {
  const context = await requireAuth("/profile");
  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.from("profiles").select("display_name, preferred_language").eq("id", context.userId).maybeSingle() : { data: null };
  return <PageShell><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secondary-strong)]">Account settings</p><h1 className="mt-2 text-3xl font-bold text-[var(--primary-strong)]">Your profile</h1><p className="mt-3 text-sm text-[var(--muted-foreground)]">{context.email}</p></div><SignOutButton /></div><div className="mt-8 max-w-xl rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8"><h2 className="text-xl font-bold text-[var(--primary-strong)]">Personal details</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Only a display name and preferred language are collected at this stage. Pickup addresses and payment details are not part of this milestone.</p><ProfileForm userId={context.userId} initialName={data?.display_name ?? ""} initialLanguage={data?.preferred_language ?? "en"} /></div></PageShell>;
}
