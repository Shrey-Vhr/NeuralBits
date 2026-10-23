import { PageShell } from "@/components/page-shell";
import { ScrapPointsDashboard } from "@/components/scrap-points-dashboard";
import { SectionHeading } from "@/components/section-heading";
import { ScrapPointsCalculator } from "@/components/scrap-points-calculator";
import { getEducationContent } from "@/lib/content-repository";
// @next-codemod-ignore Cache Components adoption: education data may come from Supabase.
export const instant = false;
export default async function ScrapPointsPage() { const content = await getEducationContent(); return <PageShell><SectionHeading eyebrow="Loyalty rewards" title="Scrap Points" description="See how completed simulated scrap deals could contribute to future rewards. This dashboard is isolated from real accounts and payments." /><ScrapPointsCalculator materials={content.materials} /><ScrapPointsDashboard /></PageShell>; }
