import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemoJourney } from "@/components/demo-journey";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

export default function DemoPage() { return <PageShell><Link href="/"><Button variant="outline" size="sm"><ArrowLeft size={15} /> Back to ScrapReady</Button></Link><SectionHeading eyebrow="90-second judge walkthrough" title="From learning to collection" description="See the ScrapReady journey from identifying a household item to a simulated pickup status. This isolated demo never contacts a vendor or writes a live pickup request." /><DemoJourney /></PageShell>; }
