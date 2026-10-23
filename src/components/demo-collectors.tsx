import Link from "next/link";
import { ArrowRight, Handshake } from "lucide-react";

const collectors = [
  ["GreenLoop Demo Collectors", "Newspapers and cardboard", "Demo Zone A", "Pickup simulation"],
  ["BottleCycle Demo Partner", "PET plastic bottles", "Demo Zone B", "Pickup simulation"],
  ["MetalMate Demo Recycler", "Aluminium and iron/steel", "Demo Zone C", "Drop-off simulation"],
  ["EcoSort Demo Collectors", "Mixed dry recyclables", "Demo Zone A", "Pickup simulation"],
  ["E-Waste Care Demo Partner", "Special-care inquiries only", "Demo Zone D", "Referral simulation"],
];

export function DemoCollectors() { return <section className="mt-12"><div className="flex items-center gap-3"><Handshake className="text-[var(--secondary-strong)]" size={25} /><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secondary-strong)]">Judging demo</p><h2 className="text-2xl font-bold text-[var(--primary-strong)]">Explore Demo Collectors</h2></div></div><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">Fictional examples kept separate from the live approved directory. No addresses, phone numbers, ratings, or real pickup claims are shown.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{collectors.map(([name, accepted, area, service]) => <article key={name} className="rounded-2xl border border-[#f1dfaa] bg-[#fffaf0] p-5"><h3 className="font-bold text-[var(--primary-strong)]">{name}</h3><p className="mt-3 text-sm text-[var(--muted-foreground)]">Accepted: {accepted}</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">Area: {area} · {service}</p><p className="mt-4 text-xs font-semibold text-[#7b5a08]">Demo collector — not a verified business.</p><Link href="/demo" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">Try Demo Pickup <ArrowRight size={15} /></Link></article>)}</div></section>; }
