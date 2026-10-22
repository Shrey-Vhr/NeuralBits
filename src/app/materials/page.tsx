import { SectionHeading } from "@/components/section-heading";
import { MaterialsDirectory } from "@/components/materials-directory";
import { PageShell } from "@/components/page-shell";
import { getEducationContent } from "@/lib/content-repository";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function MaterialsPage() {
  const { materials } = await getEducationContent();
  return <PageShell><SectionHeading eyebrow="Material directory" title="Know what you are sorting" description="Learn the basics of common materials. Acceptance varies by location, condition, and receiving vendor, so always confirm before arranging collection." /><MaterialsDirectory materials={materials} /></PageShell>;
}
