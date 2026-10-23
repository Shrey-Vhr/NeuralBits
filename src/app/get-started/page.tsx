import Link from "next/link";
import { ArrowRight, House, Store } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export default function GetStartedPage() {
  return <PageShell><div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secondary-strong)]">Create an account</p><h1 className="mt-2 text-4xl font-bold text-[var(--primary-strong)]">Welcome to ScrapReady</h1><p className="mt-3 text-base leading-7 text-[var(--muted-foreground)]">How will you use ScrapReady?</p><div className="mt-8 grid gap-5 md:grid-cols-2"><RoleCard href="/signup?role=seller" icon={<House size={30} />} title="I&apos;m a Seller" description="Identify scrap, find collectors, request pickups and earn Scrap Points." action="Continue as Seller" /><RoleCard href="/signup?role=vendor" icon={<Store size={30} />} title="I&apos;m a Vendor" description="Manage your scrap collection business, receive pickup requests and grow your network." action="Continue as Vendor" /></div><p className="mt-8 text-sm text-[var(--muted-foreground)]">Already have an account? <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">Sign in</Link></p></div></PageShell>;
}

function RoleCard({ href, icon, title, description, action }: { href: string; icon: React.ReactNode; title: string; description: string; action: string }) {
  return <Link href={href} className="group rounded-3xl border border-[var(--border)] bg-[var(--secondary-soft)] p-6 transition hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-lg sm:p-8"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-white">{icon}</div><h2 className="mt-6 text-2xl font-bold text-[var(--primary-strong)]">{title}</h2><p className="mt-3 min-h-14 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p><span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white">{action}<ArrowRight size={16} className="transition group-hover:translate-x-1" /></span></Link>;
}
