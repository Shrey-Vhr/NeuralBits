import { SectionHeading } from "@/components/section-heading";
import { DataUnavailable } from "@/components/data-unavailable";
import { DemoCollectors } from "@/components/demo-collectors";
import { VendorDirectory } from "@/components/vendor-directory";
import { PageShell } from "@/components/page-shell";
import { getEducationContent } from "@/lib/content-repository";
import { getVendors } from "@/lib/vendor-repository";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function VendorsPage({ searchParams }: { searchParams: Promise<{ material?: string; locality?: string }> }) {
  const params = await searchParams;
  const [{ vendors, error: vendorError }, content] = await Promise.all([getVendorData(), getEducationContent()]);
  if (vendorError || content.error) return <PageShell><SectionHeading eyebrow="Local vendor directory" title="Find a scrap partner" description="Search by locality and accepted material. Rates are indicative only and should be confirmed directly with the vendor." /><DataUnavailable message={vendorError ?? content.error ?? undefined} /></PageShell>;
  const { materials } = content;
  const hasDemonstrations = vendors.some((vendor) => vendor.verificationStatus === "demonstration");
  return <PageShell><SectionHeading eyebrow="Local vendor directory" title="Find a scrap partner" description="Search by locality and accepted material. Rates are indicative only and should be confirmed directly with the vendor." />{hasDemonstrations && <div className="mt-7 rounded-2xl border border-[#f1dfaa] bg-[#fffaf0] p-5 text-sm leading-6 text-[#7b5a08]"><strong>Demonstration data only.</strong> These records show how the directory works and are not real or approved businesses. Verified vendors will appear after administrator review.</div>}<VendorDirectory vendors={vendors} materials={materials} initialMaterialSlug={params.material} initialLocality={params.locality} /><DemoCollectors /></PageShell>;
}

async function getVendorData() { return getVendors(); }
