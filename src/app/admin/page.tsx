import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { SignOutButton } from "@/components/sign-out-button";
import { requireRole } from "@/lib/auth";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function AdminPage() {
  const context = await requireRole("administrator", "/admin");
  return <PageShell><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secondary-strong)]">Protected administration</p><h1 className="mt-2 text-3xl font-bold text-[var(--primary-strong)]">Administrator dashboard</h1><p className="mt-3 text-sm text-[var(--muted-foreground)]">Signed in as {context.email}</p></div><SignOutButton /></div><div className="mt-8 max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8"><ShieldCheck className="text-[var(--secondary-strong)]" size={28} /><h2 className="mt-5 text-xl font-bold text-[var(--primary-strong)]">Trusted access only</h2><p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">This protected foundation confirms administrator authorization from the database. Vendor approval and educational content management will be added only with explicit protected operations.</p><Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"><ArrowLeft size={16} /> Back to dashboard</Link></div></PageShell>;
}
