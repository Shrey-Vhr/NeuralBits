import { DataUnavailable } from "@/components/data-unavailable";
import { GuidesDirectory } from "@/components/guides-directory";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { getEducationContent } from "@/lib/content-repository";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function GuidesPage() {
  const content = await getEducationContent();
  return <PageShell><SectionHeading eyebrow="Preparation guides" title="Prepare with care" description="Search approved guides by household item or material. Local acceptance varies, so confirm collection details before acting." />{content.error ? <DataUnavailable message={content.error} /> : <GuidesDirectory guides={content.guides} items={content.items} materials={content.materials} />}</PageShell>;
}
