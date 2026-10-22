import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demonstrationVendors, type Vendor, type VendorAvailability, type VendorVerificationStatus } from "@/lib/vendors";

type Row = Record<string, unknown>;
const text = (row: Row, key: string, fallback = "") => typeof row[key] === "string" ? row[key] as string : fallback;
const textArray = (row: Row, key: string) => Array.isArray(row[key]) ? row[key].filter((value): value is string => typeof value === "string") : [];
const numberOrNull = (row: Row, key: string) => typeof row[key] === "number" ? row[key] as number : null;

function vendorFromRow(row: Row): Vendor {
  const rateRows = Array.isArray(row.vendor_materials) ? row.vendor_materials as Row[] : [];
  return {
    slug: text(row, "slug"), businessName: text(row, "business_name"), businessDescription: text(row, "business_description"), publicPhone: text(row, "public_phone") || null, publicEmail: text(row, "public_email") || null, locality: text(row, "locality"), city: text(row, "city"), state: text(row, "state"), serviceAreas: textArray(row, "service_areas"), verificationStatus: text(row, "verification_status", "approved") as VendorVerificationStatus, isActive: Boolean(row.is_active), approximateLatitude: numberOrNull(row, "approximate_latitude"), approximateLongitude: numberOrNull(row, "approximate_longitude"), updatedAt: text(row, "updated_at", new Date().toISOString()), materials: rateRows.map((rateRow) => { const material = rateRow.materials as Row | undefined; return { materialSlug: text(material ?? {}, "slug"), materialName: text(material ?? {}, "name"), indicativeRateInrPerKg: numberOrNull(rateRow, "indicative_rate_inr_per_kg"), minimumCollectionKg: numberOrNull(rateRow, "minimum_collection_kg"), rateLastUpdated: text(rateRow, "rate_last_updated") || null, availabilityStatus: text(rateRow, "availability_status", "contact_vendor") as VendorAvailability }; }).filter((material) => material.materialSlug),
  };
}

export async function getVendors() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return demonstrationVendors;
  const { data, error } = await supabase.from("vendors").select("*, vendor_materials(indicative_rate_inr_per_kg, minimum_collection_kg, rate_last_updated, availability_status, materials(slug, name))").eq("verification_status", "approved").eq("is_active", true).order("business_name");
  if (error) return demonstrationVendors;
  return (data ?? []).map((row) => vendorFromRow(row as Row));
}

export async function getVendor(slug: string) {
  const vendors = await getVendors();
  return vendors.find((vendor) => vendor.slug === slug);
}
