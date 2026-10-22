import { SectionHeading } from "@/components/section-heading";
import { VendorDirectory } from "@/components/vendor-directory";
import { PageShell } from "@/components/page-shell";
import { getEducationContent } from "@/lib/content-repository";
import { getVendors } from "@/lib/vendor-repository";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function VendorsPage({ searchParams }: { searchParams: Promise<{ material?: string; locality?: string }> }) {
  const params = await searchParams;
  const [{ vendors }, { materials }] = await Promise.all([getVendorData(), getEducationContent()]);
  const hasDemonstrations = vendors.some((vendor) => vendor.verificationStatus === "demonstration");
  return <PageShell><SectionHeading eyebrow="Local vendor directory" title="Find a scrap partner" description="Search by locality and accepted material. Rates are indicative only and should be confirmed directly with the vendor." />{hasDemonstrations && <div className="mt-7 rounded-2xl border border-[#f1dfaa] bg-[#fffaf0] p-5 text-sm leading-6 text-[#7b5a08]"><strong>Demonstration data only.</strong> These records show how the directory works and are not real or approved businesses. Verified vendors will appear after administrator review.</div>}<VendorDirectory vendors={vendors} materials={materials} initialMaterialSlug={params.material} initialLocality={params.locality} /></PageShell>;
}

async function getVendorData() { return { vendors: await getVendors() }; }
