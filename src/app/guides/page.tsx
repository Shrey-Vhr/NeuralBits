import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { ContentStatus } from "@/components/content-status";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { getEducationContent } from "@/lib/content-repository";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function GuidesPage() {
  const { guides, items } = await getEducationContent();
  const itemName = (slug: string) => items.find((item) => item.slug === slug)?.name ?? "Item guide";
  return <PageShell><SectionHeading eyebrow="Preparation guides" title="Prepare with care" description="Guides explain simple sorting steps and clear limits. Content is labelled so you can distinguish approved material from content still awaiting review." /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{guides.map((guide) => <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--secondary)] hover:shadow-sm"><div className="flex items-start justify-between gap-3"><BookOpen className="text-[var(--secondary-strong)]" size={24} /><ContentStatus status={guide.approvalStatus} /></div><h2 className="mt-5 text-lg font-bold text-[var(--primary-strong)]">{guide.title}</h2><p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{itemName(guide.itemSlug)}</p><p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted-foreground)]">{guide.description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">Read guide <ArrowRight className="transition group-hover:translate-x-1" size={16} /></span></Link>)}</div>{guides.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-white p-8 text-center"><h2 className="font-bold text-[var(--primary-strong)]">No approved guides yet</h2><p className="mt-2 text-sm text-[var(--muted-foreground)]">Guides will appear here after a content reviewer approves them.</p></div>}</PageShell>;
}
