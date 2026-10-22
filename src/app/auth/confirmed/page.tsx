import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export default function ConfirmedPage() { return <PageShell><div className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-white p-8 text-center"><CheckCircle2 className="mx-auto text-[var(--secondary-strong)]" size={34} /><h1 className="mt-5 text-2xl font-bold text-[var(--primary-strong)]">Email confirmed</h1><p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">Your ScrapReady account is ready. Continue to your dashboard.</p><Link href="/dashboard" className="mt-6 inline-flex font-semibold text-[var(--primary)] hover:underline">Go to dashboard</Link></div></PageShell>; }
