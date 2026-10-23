import type { Material } from "@/lib/content";

export type VendorVerificationStatus = "pending" | "approved" | "rejected" | "demonstration";
export type VendorAvailability = "available" | "unavailable" | "contact_vendor";

export type VendorMaterial = {
  materialSlug: string;
  materialName: string;
  indicativeRateInrPerKg: number | null;
  minimumCollectionKg: number | null;
  rateLastUpdated: string | null;
  availabilityStatus: VendorAvailability;
};

export type Vendor = {
  id?: string;
  slug: string;
  businessName: string;
  businessDescription: string;
  publicPhone: string | null;
  publicEmail: string | null;
  locality: string;
  city: string;
  state: string;
  serviceAreas: string[];
  verificationStatus: VendorVerificationStatus;
  isActive: boolean;
  approximateLatitude: number | null;
  approximateLongitude: number | null;
  updatedAt: string;
  materials: VendorMaterial[];
};

export const demonstrationVendors: Vendor[] = [
  { slug: "demo-ludhiana-recycler", businessName: "Demonstration vendor — Ludhiana", businessDescription: "A demonstration listing used to show the ScrapReady directory layout. This is not a real or approved vendor listing.", publicPhone: null, publicEmail: null, locality: "Model Town", city: "Ludhiana", state: "Punjab", serviceAreas: ["Model Town", "Civil Lines"], verificationStatus: "demonstration", isActive: true, approximateLatitude: null, approximateLongitude: null, updatedAt: "2026-10-22", materials: [{ materialSlug: "cardboard", materialName: "Cardboard", indicativeRateInrPerKg: null, minimumCollectionKg: 10, rateLastUpdated: null, availabilityStatus: "contact_vendor" }, { materialSlug: "paper", materialName: "Paper", indicativeRateInrPerKg: null, minimumCollectionKg: 10, rateLastUpdated: null, availabilityStatus: "contact_vendor" }] },
  { slug: "demo-ludhiana-e-waste", businessName: "Demonstration e-waste handler — Ludhiana", businessDescription: "A demonstration listing for specialist handling information. This is not a real or approved vendor listing.", publicPhone: null, publicEmail: null, locality: "Dugri", city: "Ludhiana", state: "Punjab", serviceAreas: ["Dugri", "BRS Nagar"], verificationStatus: "demonstration", isActive: true, approximateLatitude: null, approximateLongitude: null, updatedAt: "2026-10-22", materials: [{ materialSlug: "electronic-waste", materialName: "Electronic waste", indicativeRateInrPerKg: null, minimumCollectionKg: null, rateLastUpdated: null, availabilityStatus: "contact_vendor" }] },
  { slug: "demo-phagwara-metal", businessName: "Demonstration metal collector — Phagwara", businessDescription: "A demonstration listing showing a different locality. This is not a real or approved vendor listing.", publicPhone: null, publicEmail: null, locality: "Central Phagwara", city: "Phagwara", state: "Punjab", serviceAreas: ["Central Phagwara"], verificationStatus: "demonstration", isActive: true, approximateLatitude: null, approximateLongitude: null, updatedAt: "2026-10-22", materials: [{ materialSlug: "iron-steel", materialName: "Iron and steel", indicativeRateInrPerKg: null, minimumCollectionKg: null, rateLastUpdated: null, availabilityStatus: "contact_vendor" }, { materialSlug: "aluminium", materialName: "Aluminium", indicativeRateInrPerKg: null, minimumCollectionKg: null, rateLastUpdated: null, availabilityStatus: "contact_vendor" }] },
];

export function isRateStale(rateLastUpdated: string | null, now = new Date()) {
  if (!rateLastUpdated) return false;
  const ageInDays = (now.getTime() - new Date(rateLastUpdated).getTime()) / 86_400_000;
  return ageInDays > 30;
}

export function formatRate(rate: number | null) {
  return rate === null ? "Contact vendor for rate" : `₹${rate.toLocaleString("en-IN", { maximumFractionDigits: 2 })}/kg`;
}

export function materialOptions(materials: Material[]) { return materials.map((material) => ({ value: material.slug, label: material.name })); }
