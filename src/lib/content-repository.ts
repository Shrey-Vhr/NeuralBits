import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGuide, getItem, getMaterial, items as localItems, materials as localMaterials, preparationGuides as localGuides, type Item, type Material, type PreparationGuide } from "@/lib/content";

type SupabaseRow = Record<string, unknown>;

function stringValue(row: SupabaseRow, key: string, fallback = "") { return typeof row[key] === "string" ? row[key] as string : fallback; }
function stringArray(row: SupabaseRow, key: string) { return Array.isArray(row[key]) ? row[key].filter((value): value is string => typeof value === "string") : []; }

function materialFromRow(row: SupabaseRow): Material {
  return { id: stringValue(row, "id") || undefined, slug: stringValue(row, "slug"), name: stringValue(row, "name"), category: stringValue(row, "category"), description: stringValue(row, "description"), householdExamples: stringArray(row, "household_examples"), segregationGuidance: stringValue(row, "segregation_guidance"), specialHandling: stringValue(row, "special_handling") || undefined, safetyPrecautions: stringArray(row, "safety_precautions"), isPublished: Boolean(row.is_published), };
}

function itemFromRow(row: SupabaseRow): Item {
  const relationships = Array.isArray(row.item_materials) ? row.item_materials as SupabaseRow[] : [];
  const materialSlugs = relationships.map((relationship) => { const material = relationship.materials as SupabaseRow | undefined; return material ? stringValue(material, "slug") : ""; }).filter(Boolean);
  return { slug: stringValue(row, "slug"), name: stringValue(row, "name"), alternativeNames: stringArray(row, "alternative_names"), description: stringValue(row, "description"), materialSlugs, isHazardous: Boolean(row.is_hazardous), handlingNote: stringValue(row, "handling_note") || undefined, isPublished: Boolean(row.is_published), };
}

function guideFromRow(row: SupabaseRow): PreparationGuide {
  const item = row.items as SupabaseRow | undefined;
  const material = row.materials as SupabaseRow | undefined;
  return { slug: stringValue(row, "slug"), itemSlug: stringValue(item ?? {}, "slug"), materialSlug: stringValue(material ?? {}, "slug"), title: stringValue(row, "title"), description: stringValue(row, "description"), preparationSteps: stringArray(row, "preparation_steps"), safetyWarnings: stringArray(row, "safety_warnings"), doNotDo: stringArray(row, "do_not_do"), recommendedRoute: stringValue(row, "recommended_route"), approvalStatus: stringValue(row, "approval_status", "approved") as PreparationGuide["approvalStatus"], lastReviewedDate: typeof row.last_reviewed_date === "string" ? row.last_reviewed_date : null, reviewerNotes: stringValue(row, "reviewer_notes"), };
}

export async function getEducationContent() {
  const supabase = await createSupabaseServerClient();
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  if (!supabase) return configured ? { materials: [], items: [], guides: [], source: "supabase" as const, error: "Supabase is configured but the server client is unavailable." } : { materials: localMaterials, items: localItems, guides: localGuides, source: "local" as const, error: null };

  const [materialsResult, itemsResult, guidesResult] = await Promise.all([
    supabase.from("materials").select("*").eq("is_published", true).order("name"),
    supabase.from("items").select("*, item_materials(material_id, is_primary, materials(slug))").eq("is_published", true).order("name"),
    supabase.from("preparation_guides").select("*, items(slug), materials(slug)").eq("approval_status", "approved").order("title"),
  ]);

  if (materialsResult.error || itemsResult.error || guidesResult.error) {
    return { materials: [], items: [], guides: [], source: "supabase" as const, error: "Supabase educational content could not be loaded." };
  }

  return { materials: (materialsResult.data ?? []).map((row) => materialFromRow(row as SupabaseRow)), items: (itemsResult.data ?? []).map((row) => itemFromRow(row as SupabaseRow)), guides: (guidesResult.data ?? []).map((row) => guideFromRow(row as SupabaseRow)), source: "supabase" as const, error: null };
}

export async function getMaterialForPage(slug: string) { const content = await getEducationContent(); return content.error ? undefined : content.materials.find((material) => material.slug === slug) ?? (content.source === "local" ? getMaterial(slug) : undefined); }
export async function getItemForPage(slug: string) { const content = await getEducationContent(); return content.error ? undefined : content.items.find((item) => item.slug === slug) ?? (content.source === "local" ? getItem(slug) : undefined); }
export async function getGuideForPage(slug: string) { const content = await getEducationContent(); return content.error ? undefined : content.guides.find((guide) => guide.slug === slug) ?? (content.source === "local" ? getGuide(slug) : undefined); }
