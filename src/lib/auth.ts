import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "customer" | "vendor" | "administrator";

export type AuthContext = {
  userId: string;
  email: string | null;
  roles: AppRole[];
  approvedVendorIds: string[];
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: claimsResult } = await supabase.auth.getClaims();
  const claims = claimsResult?.claims;
  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  if (!userId) return null;

  const email = typeof claims?.email === "string" ? claims.email : null;
  const [{ data: roles }, { data: memberships }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("vendor_memberships").select("vendor_id").eq("user_id", userId).eq("membership_status", "approved"),
  ]);

  return { userId, email, roles: (roles ?? []).map((row) => row.role as AppRole), approvedVendorIds: (memberships ?? []).map((row) => row.vendor_id as string), };
}

export async function requireAuth(nextPath = "/dashboard") {
  const context = await getAuthContext();
  if (!context) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return context;
}

export async function requireRole(role: AppRole, nextPath: string) {
  const context = await requireAuth(nextPath);
  if (!context.roles.includes(role)) redirect("/dashboard?error=not-authorized");
  return context;
}

export async function requireApprovedVendor(nextPath = "/vendor/dashboard") {
  const context = await requireRole("vendor", nextPath);
  if (context.approvedVendorIds.length === 0) redirect("/dashboard?error=vendor-pending");
  return context;
}
