import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SignOutButton } from "@/components/sign-out-button";
import { requireApprovedVendor } from "@/lib/auth";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function VendorDashboardPage() {
  const context = await requireApprovedVendor();
  return <PageShell><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secondary-strong)]">Protected vendor area</p><h1 className="mt-2 text-3xl font-bold text-[var(--primary-strong)]">Vendor dashboard</h1><p className="mt-3 text-sm text-[var(--muted-foreground)]">Approved business associations: {context.approvedVendorIds.length}</p></div><SignOutButton /></div><div className="mt-8 max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8"><ShieldCheck className="text-[var(--secondary-strong)]" size={28} /><h2 className="mt-5 text-xl font-bold text-[var(--primary-strong)]">Authorization foundation ready</h2><p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">Vendor-specific profile management, pickup requests, and transactions will be added in later milestones. Access here requires both the vendor role and an approved membership association.</p><Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"><ArrowLeft size={16} /> Back to dashboard</Link></div></PageShell>;
}
