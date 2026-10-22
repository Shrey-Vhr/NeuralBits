import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertTriangle, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { ContentStatus } from "@/components/content-status";
import { PageShell } from "@/components/page-shell";
import { getEducationContent, getItemForPage } from "@/lib/content-repository";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function ItemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getItemForPage(slug);
  if (!item) notFound();
  const { materials, guides } = await getEducationContent();
  const itemMaterials = materials.filter((material) => item.materialSlugs.includes(material.slug));
  const guide = guides.find((candidate) => candidate.itemSlug === item.slug);
  return <PageShell><Link href="/items" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"><ArrowLeft size={16} /> All items</Link><div className="mt-7 max-w-3xl"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secondary-strong)]">Item detail</p>{item.isHazardous && <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4d6] px-2.5 py-1 text-xs font-semibold text-[#7b5a08]"><AlertTriangle size={13} /> Extra care</span>}</div><h1 className="mt-2 text-4xl font-bold tracking-tight text-[var(--primary-strong)]">{item.name}</h1><p className="mt-4 text-base leading-7 text-[var(--muted-foreground)]">{item.description}</p>{item.alternativeNames.length > 0 && <p className="mt-3 text-sm text-[var(--muted-foreground)]">Also called: {item.alternativeNames.join(", ")}</p>}</div>{item.handlingNote && <div className="mt-7 rounded-2xl border border-[#f1dfaa] bg-[#fffaf0] p-5 text-sm leading-6 text-[#7b5a08]"><strong>Handling note: </strong>{item.handlingNote}</div>}<section className="mt-8"><h2 className="text-xl font-bold text-[var(--primary-strong)]">Likely material categories</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{itemMaterials.map((material) => <Link key={material.slug} href={`/materials/${material.slug}`} className="rounded-2xl border border-[var(--border)] bg-white p-5 hover:border-[var(--secondary)]"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--secondary-strong)]">{material.category}</p><h3 className="mt-2 font-bold text-[var(--primary-strong)]">{material.name}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{material.description}</p></Link>)}</div></section><section className="mt-8 rounded-2xl bg-[var(--surface)] p-6"><div className="flex items-start justify-between gap-4"><div><BookOpen className="text-[var(--secondary-strong)]" size={23} /><h2 className="mt-4 text-xl font-bold text-[var(--primary-strong)]">Preparation guidance</h2></div>{guide && <ContentStatus status={guide.approvalStatus} />}</div>{guide ? <><p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{guide.description}</p><Link href={`/guides/${guide.slug}`} className="mt-5 inline-flex items-center gap-2 font-semibold text-[var(--primary)] hover:underline">Open the guide <ArrowRight size={16} /></Link></> : <p className="mt-3 text-sm text-[var(--muted-foreground)]">No guide is available yet. Choose a material category above for general segregation information.</p>}</section></PageShell>;
}
