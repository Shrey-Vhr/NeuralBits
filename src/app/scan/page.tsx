import { DataUnavailable } from "@/components/data-unavailable";
import { PageShell } from "@/components/page-shell";
import { ScanWorkspace } from "@/components/scan-workspace";
import { SectionHeading } from "@/components/section-heading";
import { getEducationContent } from "@/lib/content-repository";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function ScanPage() {
  const content = await getEducationContent();
  return <PageShell><SectionHeading eyebrow="Identify an item" title="What are you setting aside?" description="Search the curated catalog manually, or optionally ask AI for a likely match from a photo. ScrapReady always uses its reviewed catalog for guidance." /><ScanWorkspace items={content.items} materials={content.materials} guides={content.guides} contentError={content.error} />{content.error && <DataUnavailable message={content.error} />}</PageShell>;
}
