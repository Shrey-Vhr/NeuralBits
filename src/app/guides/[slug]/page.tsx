import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { ContentStatus } from "@/components/content-status";
import { PageShell } from "@/components/page-shell";
import { DataUnavailable } from "@/components/data-unavailable";
import { getEducationContent } from "@/lib/content-repository";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getEducationContent();
  if (content.error) return <PageShell><DataUnavailable message={content.error} /></PageShell>;
  const guide = content.guides.find((candidate) => candidate.slug === slug);
  if (!guide) notFound();
  const { items, materials } = content;
  const item = items.find((candidate) => candidate.slug === guide.itemSlug);
  const material = materials.find((candidate) => candidate.slug === guide.materialSlug);
  const approved = guide.approvalStatus === "approved";
  return <PageShell><Link href="/guides" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"><ArrowLeft size={16} /> All preparation guides</Link><div className="mt-7 max-w-3xl"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secondary-strong)]">{material?.name ?? "Material guide"}</p><ContentStatus status={guide.approvalStatus} /></div><h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--primary-strong)]">{guide.title}</h1><p className="mt-4 text-base leading-7 text-[var(--muted-foreground)]">{guide.description}</p><p className="mt-3 text-sm text-[var(--muted-foreground)]">For: {item?.name ?? "Item"} · Last reviewed: {guide.lastReviewedDate ?? "Not yet reviewed"}</p></div>{!approved && <div className="mt-7 flex gap-3 rounded-2xl border border-[#f1dfaa] bg-[#fffaf0] p-5 text-sm leading-6 text-[#7b5a08]"><AlertTriangle className="mt-0.5 shrink-0" size={20} /><p><strong>This guide is not approved yet.</strong> It is a conservative draft demonstration and must not be treated as expert-approved safety advice. Follow local authority or specialist instructions for hazardous or uncertain items.</p></div>}<div className="mt-8 grid gap-5 lg:grid-cols-2"><GuideList title="Preparation steps" items={guide.preparationSteps} icon="check" /><GuideList title="Safety warnings" items={guide.safetyWarnings} icon="warning" /><GuideList title="What not to do" items={guide.doNotDo} icon="warning" /><section className="rounded-2xl border border-[var(--border)] bg-white p-6"><h2 className="font-bold text-[var(--primary-strong)]">Recommended route</h2><p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{guide.recommendedRoute}</p><p className="mt-5 text-xs text-[var(--muted-foreground)]">{guide.reviewerNotes}</p></section></div><div className="mt-8 flex flex-wrap gap-3"><Link href={`/materials/${guide.materialSlug}`} className="inline-flex items-center gap-2 rounded-xl bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--primary)]">View material <ArrowRight size={15} /></Link>{item && !item.isHazardous && <Link href={`/vendors?material=${guide.materialSlug}`} className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white">Find a Collector <ArrowRight size={15} /></Link>}<Link href="/scan" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--primary-strong)]">Identify another item <ArrowRight size={15} /></Link></div></PageShell>;
}

function GuideList({ title, items, icon }: { title: string; items: string[]; icon: "check" | "warning" }) {
  const Icon = icon === "check" ? CheckCircle2 : AlertTriangle;
  return <section className="rounded-2xl border border-[var(--border)] bg-white p-6"><h2 className="font-bold text-[var(--primary-strong)]">{title}</h2><ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[var(--muted-foreground)]"><Icon className={`mt-0.5 shrink-0 ${icon === "check" ? "text-[var(--secondary-strong)]" : "text-[#a8790b]"}`} size={17} />{item}</li>)}</ul></section>;
}
