import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SignOutButton } from "@/components/sign-out-button";
import { VendorPickupList } from "@/components/vendor-pickup-list";
import { VendorBulkGroups } from "@/components/vendor-bulk-groups";
import { VendorAvailableJobs } from "@/components/vendor-available-jobs";
import { requireApprovedVendor } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

export default async function VendorDashboardPage() {
  const context = await requireApprovedVendor(); const supabase = await createSupabaseServerClient();
  const result = supabase ? await supabase.from("pickup_requests").select("id, approximate_quantity, preferred_date, locality, status, materials(name), pickup_request_items(estimated_quantity_kg, materials(name))").in("vendor_id", context.approvedVendorIds).order("created_at", { ascending: false }) : { data: [], error: null };
  const pickups = (result.data ?? []).map((pickup) => { const lines = Array.isArray(pickup.pickup_request_items) ? pickup.pickup_request_items as Array<{ estimated_quantity_kg?: number; materials?: { name?: string } | null }> : []; const materialName = lines.length ? lines.map((line) => `${line.materials?.name ?? "Material"} (${line.estimated_quantity_kg} kg)`).join(" · ") : ((pickup.materials as { name?: string } | null)?.name ?? "Material"); return { id: pickup.id as string, materialName, approximateQuantity: Number(pickup.approximate_quantity), preferredDate: pickup.preferred_date as string, locality: pickup.locality as string, status: pickup.status as string }; });
  const bulkResult = supabase ? await supabase.from("bulk_pickup_groups").select("id, locality, locality_pin_code, preferred_date, preferred_time_window, group_status, bulk_pickup_contributions(id, estimated_weight_kg, actual_weight_kg, stop_status, pickup_request_id)").in("assigned_vendor_id", context.approvedVendorIds).order("created_at", { ascending: false }) : { data: [], error: null };
  const availablePickups = supabase ? await supabase.rpc("vendor_available_pickups") : { data: [], error: null }; const availableGroups = supabase ? await supabase.rpc("vendor_available_bulk_groups") : { data: [], error: null }; const availableError = availablePickups.error?.message ?? availableGroups.error?.message;
  return <PageShell><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secondary-strong)]">Protected vendor area</p><h1 className="mt-2 text-3xl font-bold text-[var(--primary-strong)]">Vendor dashboard</h1><p className="mt-3 text-sm text-[var(--muted-foreground)]">Approved business associations: {context.approvedVendorIds.length}</p></div><SignOutButton /></div><VendorAvailableJobs pickups={(availablePickups.data ?? []) as never[]} groups={(availableGroups.data ?? []) as never[]} error={availableError} /><div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"><ShieldCheck className="text-[var(--secondary-strong)]" size={28} /><h2 className="mt-5 text-xl font-bold text-[var(--primary-strong)]">Assigned pickup requests</h2><p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">Only requests assigned to your approved vendor membership are shown.</p><VendorPickupList initialPickups={pickups} /></div><VendorBulkGroups groups={(bulkResult.data ?? []) as never[]} error={bulkResult.error?.message} /><Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"><ArrowLeft size={16} /> Back to dashboard</Link></PageShell>;
}
