import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SignOutButton } from "@/components/sign-out-button";
import { requireRole } from "@/lib/auth";
import { VendorApprovalPanel } from "@/components/vendor-approval-panel";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function AdminPage() {
  const context = await requireRole("administrator", "/admin");
  const supabase = await createSupabaseServerClient(); const applications = supabase ? await supabase.from("vendor_applications").select("id, business_name, owner_name, email, phone, locality, service_pin_code, accepted_materials, status").eq("status", "pending_approval").order("created_at", { ascending: true }) : { data: [], error: null };
  return <PageShell><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secondary-strong)]">Protected administration</p><h1 className="mt-2 text-3xl font-bold text-[var(--primary-strong)]">Administrator dashboard</h1><p className="mt-3 text-sm text-[var(--muted-foreground)]">Signed in as {context.email}</p></div><SignOutButton /></div><VendorApprovalPanel applications={(applications.data ?? []) as never[]} /><div className="mt-8 max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8"><ShieldCheck className="text-[var(--secondary-strong)]" size={28} /><h2 className="mt-5 text-xl font-bold text-[var(--primary-strong)]">Trusted access only</h2><p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">Vendor approval is database-authorized and cannot be performed by vendor accounts or public signup.</p><Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"><ArrowLeft size={16} /> Back to dashboard</Link></div></PageShell>;
}
