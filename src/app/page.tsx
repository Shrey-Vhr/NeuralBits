import Link from "next/link";
import { ArrowRight, BookOpen, Camera, CheckCircle2, MapPin, Recycle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";

export default function Home() {
  return (
    <PageShell>
      <section className="grid items-center gap-10 overflow-hidden rounded-3xl bg-[var(--primary-strong)] px-6 py-10 text-white sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#b9e8d5]"><Sparkles size={14} /> Pilot foundation</p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">Prepare. Value. Recycle.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#d5eee3] sm:text-lg">A clearer way to understand your scrap, prepare it safely, and discover local recycling partners.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/scan"><Button variant="secondary" size="lg"><Camera size={18} /> Identify an item</Button></Link>
            <Link href="/guides"><Button variant="outline" size="lg">Browse preparation guides <ArrowRight size={18} /></Button></Link>
          </div>
          <p className="mt-5 text-xs text-[#b9d9ca]">Built for the ScrapReady pilot · Locality-based discovery</p>
        </div>
        <div className="relative hidden min-h-72 lg:block">
          <div className="absolute right-5 top-3 h-56 w-56 rounded-full bg-[#2d8b6e]/60 blur-2xl" />
          <div className="absolute bottom-0 right-8 rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
            <Recycle className="mb-4 text-[#a9e3c8]" size={48} strokeWidth={1.5} />
            <p className="text-lg font-semibold">Small steps, better sorting.</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#c4e6d6]">Start with one item and learn what to do next.</p>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Camera, title: "Identify", text: "Search or select an item to understand its likely material." },
          { icon: BookOpen, title: "Prepare", text: "Follow clear, safety-first guidance before setting scrap aside." },
          { icon: MapPin, title: "Connect", text: "Explore verified local vendors when the pilot marketplace is ready." },
        ].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-[var(--border)] bg-white p-5"><Icon className="text-[var(--secondary-strong)]" size={24} /><h2 className="mt-4 font-bold text-[var(--primary-strong)]">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{text}</p></div>)}
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secondary-strong)]">Start here</p><h2 className="mt-2 text-2xl font-bold text-[var(--primary-strong)]">Make your next scrap decision easier.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">The first ScrapReady release is focused on a calm, useful foundation. These screens use demonstration content until the reviewed material library and pilot vendors are connected.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/items" className="inline-flex items-center gap-2 font-semibold text-[var(--primary)] hover:underline">Search items <ArrowRight size={16} /></Link><Link href="/materials" className="inline-flex items-center gap-2 font-semibold text-[var(--primary)] hover:underline">Explore materials <ArrowRight size={16} /></Link></div></div>
        <div className="rounded-2xl bg-[var(--secondary-soft)] p-6 sm:p-8"><ShieldCheck className="text-[var(--secondary-strong)]" size={25} /><h2 className="mt-4 font-bold text-[var(--primary-strong)]">Safety comes first</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">ScrapReady will use reviewed guidance for hazardous or uncertain materials. Never dismantle an unknown item based only on a photo.</p><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[var(--primary-strong)]"><CheckCircle2 size={15} /> Guidance will be clearly labelled</div></div>
      </section>
    </PageShell>
  );
}
