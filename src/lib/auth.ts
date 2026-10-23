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
  const [rolesRpc, membershipsResult] = await Promise.all([
    supabase.rpc("get_current_user_roles"),
    supabase.from("vendor_memberships").select("vendor_id").eq("user_id", userId).eq("membership_status", "approved"),
  ]);
  type RoleRow = { role: AppRole };
  let roles = (rolesRpc.data as RoleRow[] | null) ?? null;
  if (rolesRpc.error) {
    console.warn("[auth.role_lookup]", { code: rolesRpc.error.code ?? "unknown", message: rolesRpc.error.message?.slice(0, 200) ?? "role RPC failed", fallback: "user_roles" });
    const fallback = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (fallback.error) console.warn("[auth.role_lookup_fallback]", { code: fallback.error.code ?? "unknown", message: fallback.error.message?.slice(0, 200) ?? "role query failed" });
    roles = (fallback.data as RoleRow[] | null) ?? null;
  }
  if (membershipsResult.error) console.warn("[auth.membership_lookup]", { code: membershipsResult.error.code ?? "unknown", message: membershipsResult.error.message?.slice(0, 200) ?? "membership query failed" });
  console.info("[auth.authorization]", { authenticated: true, roleCount: roles?.length ?? 0, hasAdministratorRole: roles?.some((row: RoleRow) => row.role === "administrator") ?? false });
  return { userId, email, roles: (roles ?? []).map((row: RoleRow) => row.role), approvedVendorIds: ((membershipsResult.data ?? []) as Array<{ vendor_id: string }>).map((row) => row.vendor_id), };
}

export async function requireAuth(nextPath = "/dashboard") {
  const context = await getAuthContext();
  if (!context) redirect(`/profile?next=${encodeURIComponent(nextPath)}`);
  return context;
}

export async function requireRole(role: AppRole, nextPath: string) {
  const context = await requireAuth(nextPath);
  if (!context.roles.includes(role)) redirect(`/dashboard?error=not-authorized&required=${encodeURIComponent(role)}`);
  return context;
}

export async function requireApprovedVendor(nextPath = "/vendor/dashboard") {
  const context = await requireRole("vendor", nextPath);
  if (context.approvedVendorIds.length === 0) redirect("/dashboard?error=vendor-pending");
  return context;
}
