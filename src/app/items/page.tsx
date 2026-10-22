import { SectionHeading } from "@/components/section-heading";
import { ItemsDirectory } from "@/components/items-directory";
import { PageShell } from "@/components/page-shell";
import { getEducationContent } from "@/lib/content-repository";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function ItemsPage() {
  const { items, materials } = await getEducationContent();
  return <PageShell><SectionHeading eyebrow="Item search" title="Find an everyday item" description="Search common household items by name or alternative name, then see their likely material categories and preparation guidance." /><ItemsDirectory items={items} materials={materials} /></PageShell>;
}
