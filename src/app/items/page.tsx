import { SectionHeading } from "@/components/section-heading";
import { ItemsDirectory } from "@/components/items-directory";
import { DataUnavailable } from "@/components/data-unavailable";
import { PageShell } from "@/components/page-shell";
import { getEducationContent } from "@/lib/content-repository";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function ItemsPage() {
  const content = await getEducationContent();
  return <PageShell><SectionHeading eyebrow="Item search" title="Find an everyday item" description="Search common household items by name or alternative name, then see their likely material categories and preparation guidance." />{content.error ? <DataUnavailable message={content.error} /> : <ItemsDirectory items={content.items} materials={content.materials} />}</PageShell>;
}
