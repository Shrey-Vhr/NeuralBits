import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demonstrationVendors, type Vendor, type VendorAvailability, type VendorVerificationStatus } from "@/lib/vendors";

type Row = Record<string, unknown>;
const text = (row: Row, key: string, fallback = "") => typeof row[key] === "string" ? row[key] as string : fallback;
const textArray = (row: Row, key: string) => Array.isArray(row[key]) ? row[key].filter((value): value is string => typeof value === "string") : [];
const numberOrNull = (row: Row, key: string) => typeof row[key] === "number" ? row[key] as number : null;

function vendorFromRow(row: Row): Vendor {
  const rateRows = Array.isArray(row.vendor_materials) ? row.vendor_materials as Row[] : [];
  return {
    id: text(row, "id") || undefined, slug: text(row, "slug"), businessName: text(row, "business_name"), businessDescription: text(row, "business_description"), publicPhone: text(row, "public_phone") || null, publicEmail: text(row, "public_email") || null, locality: text(row, "locality"), city: text(row, "city"), state: text(row, "state"), serviceAreas: textArray(row, "service_areas"), verificationStatus: text(row, "verification_status", "approved") as VendorVerificationStatus, isActive: Boolean(row.is_active), approximateLatitude: numberOrNull(row, "approximate_latitude"), approximateLongitude: numberOrNull(row, "approximate_longitude"), updatedAt: text(row, "updated_at", new Date().toISOString()), materials: rateRows.map((rateRow) => { const material = rateRow.materials as Row | undefined; return { materialSlug: text(material ?? {}, "slug"), materialName: text(material ?? {}, "name"), indicativeRateInrPerKg: numberOrNull(rateRow, "indicative_rate_inr_per_kg"), minimumCollectionKg: numberOrNull(rateRow, "minimum_collection_kg"), rateLastUpdated: text(rateRow, "rate_last_updated") || null, availabilityStatus: text(rateRow, "availability_status", "contact_vendor") as VendorAvailability }; }).filter((material) => material.materialSlug),
  };
}

export async function getVendors() {
  const supabase = await createSupabaseServerClient();
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  if (!supabase) return configured ? { vendors: [], source: "supabase" as const, error: "Supabase is configured but the server client is unavailable." } : { vendors: demonstrationVendors, source: "local" as const, error: null };
  const { data, error } = await supabase.from("vendors").select("*, vendor_materials(indicative_rate_inr_per_kg, minimum_collection_kg, rate_last_updated, availability_status, materials(slug, name))").eq("verification_status", "approved").eq("is_active", true).order("business_name");
  if (error) return { vendors: [], source: "supabase" as const, error: "Supabase vendor data could not be loaded." };
  return { vendors: (data ?? []).map((row) => vendorFromRow(row as Row)), source: "supabase" as const, error: null };
}

export async function getVendor(slug: string) {
  const result = await getVendors();
  return { vendor: result.vendors.find((vendor) => vendor.slug === slug), source: result.source, error: result.error };
}
