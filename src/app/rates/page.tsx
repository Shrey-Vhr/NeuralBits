import { RatesDirectory } from "@/components/rates-directory";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
export default function RatesPage() { return <PageShell><SectionHeading eyebrow="Illustrative rate list" title="Understand scrap value" description="Explore example material-wise rates in Indian rupees. These examples are for demonstration only, not live market quotations." /><RatesDirectory /></PageShell>; }
