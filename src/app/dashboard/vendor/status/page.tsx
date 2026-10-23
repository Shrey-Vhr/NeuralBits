import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { requireRole } from "@/lib/auth";

// @next-codemod-ignore Cache Components adoption: this protected route intentionally blocks on auth.
export const instant = false;

export default async function VendorStatusPage() { await requireRole("customer", "/dashboard/vendor/status"); return <PageShell><div className="mx-auto max-w-xl rounded-3xl border border-[#f1dfaa] bg-[#fffaf0] p-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7310]">Vendor application</p><h1 className="mt-3 text-3xl font-bold text-[var(--primary-strong)]">Pending Approval</h1><p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">Your vendor application is under administrator review. You can continue using ScrapReady as a seller, but vendor pickup management is not available until approval.</p><Link href="/dashboard" className="mt-6 inline-flex font-semibold text-[var(--primary)]">Back to dashboard</Link></div></PageShell>; }
