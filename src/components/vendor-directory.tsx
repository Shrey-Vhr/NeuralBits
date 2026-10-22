"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { useState } from "react";
import type { Material } from "@/lib/content";
import { formatRate, isRateStale, type Vendor } from "@/lib/vendors";

function rateSummary(vendor: Vendor, materialSlug?: string) {
  const rates = materialSlug ? vendor.materials.filter((material) => material.materialSlug === materialSlug) : vendor.materials;
  const withRates = rates.filter((rate) => rate.indicativeRateInrPerKg !== null);
  return withRates.length ? withRates.slice(0, 2) : rates.slice(0, 2);
}

export function VendorDirectory({ vendors, materials, initialMaterialSlug = "all", initialLocality = "all" }: { vendors: Vendor[]; materials: Material[]; initialMaterialSlug?: string; initialLocality?: string }) {
  const [query, setQuery] = useState("");
  const [locality, setLocality] = useState(initialLocality || "all");
  const [materialSlug, setMaterialSlug] = useState(initialMaterialSlug || "all");
  const localities = Array.from(new Set(vendors.map((vendor) => vendor.locality))).sort();
  const filtered = vendors.filter((vendor) => `${vendor.businessName} ${vendor.businessDescription} ${vendor.locality} ${vendor.city}`.toLowerCase().includes(query.toLowerCase()) && (locality === "all" || vendor.locality === locality) && (materialSlug === "all" || vendor.materials.some((material) => material.materialSlug === materialSlug)));
  return <div className="mt-8"><div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]"><label className="relative block"><span className="sr-only">Search vendors</span><Search className="absolute left-3 top-3.5 text-[var(--muted-foreground)]" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search business or locality" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-white pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" /></label><label className="sr-only" htmlFor="vendor-locality">Filter by locality</label><select id="vendor-locality" value={locality} onChange={(event) => setLocality(event.target.value)} className="min-h-11 rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"><option value="all">All localities</option>{localities.map((option) => <option key={option}>{option}</option>)}</select><label className="sr-only" htmlFor="vendor-material">Filter by accepted material</label><select id="vendor-material" value={materialSlug} onChange={(event) => setMaterialSlug(event.target.value)} className="min-h-11 rounded-xl border border-[var(--border)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"><option value="all">All materials</option>{materials.map((material) => <option key={material.slug} value={material.slug}>{material.name}</option>)}</select></div><p className="mt-4 text-sm text-[var(--muted-foreground)]">{filtered.length} vendor{filtered.length === 1 ? "" : "s"} found</p>{filtered.length ? <div className="mt-4 grid gap-4 lg:grid-cols-2">{filtered.map((vendor) => <VendorCard key={vendor.slug} vendor={vendor} materialSlug={materialSlug === "all" ? undefined : materialSlug} />)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] bg-white p-8 text-center"><h2 className="font-bold text-[var(--primary-strong)]">No vendors match those filters</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Try another locality or material. Approved vendor listings will appear after verification.</p></div>}</div>;
}

function VendorCard({ vendor, materialSlug }: { vendor: Vendor; materialSlug?: string }) {
  const rates = rateSummary(vendor, materialSlug);
  return <Link href={`/vendors/${vendor.slug}`} className="group rounded-2xl border border-[var(--border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--secondary)] hover:shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-[var(--primary-strong)]">{vendor.businessName}</h2><p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]"><MapPin size={15} />{vendor.locality}, {vendor.city}</p></div><VendorStatus status={vendor.verificationStatus} /></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">{vendor.businessDescription}</p><div className="mt-4 flex flex-wrap gap-1.5">{vendor.materials.map((material) => <span key={material.materialSlug} className="rounded-full bg-[var(--surface)] px-2 py-1 text-xs font-medium text-[var(--primary-strong)]">{material.materialName}</span>)}</div><div className="mt-5 space-y-2 border-t border-[var(--border)] pt-4">{rates.length ? rates.map((rate) => <div key={rate.materialSlug} className="flex items-center justify-between gap-3 text-sm"><span className="text-[var(--muted-foreground)]">{rate.materialName}</span><span className="text-right font-semibold text-[var(--primary-strong)]">{formatRate(rate.indicativeRateInrPerKg)}{rate.indicativeRateInrPerKg !== null && isRateStale(rate.rateLastUpdated) && <span className="block text-[11px] font-medium text-[#9a7310]">May be outdated</span>}</span></div>) : <p className="text-sm text-[var(--muted-foreground)]">Contact vendor for rate</p>}</div><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">View profile <ArrowRight className="transition group-hover:translate-x-1" size={16} /></span></Link>;
}

export function VendorStatus({ status }: { status: Vendor["verificationStatus"] }) {
  const isApproved = status === "approved";
  const label = isApproved ? "Verified" : status === "demonstration" ? "Demonstration" : status === "pending" ? "Pending" : "Not active";
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isApproved ? "bg-[#e2f4e9] text-[var(--primary-strong)]" : "bg-[#fff4d6] text-[#7b5a08]"}`}>{label}</span>;
}
