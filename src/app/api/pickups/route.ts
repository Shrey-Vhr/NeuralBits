import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const allowedWindows = new Set(["morning", "afternoon", "evening"]);
function pickupDatabaseError(error: { code?: string; message?: string }) {
  if ((error.code === "42883" || error.code === "PGRST202") && error.message?.includes("create_pickup_request")) return "Multi-material pickup support is not enabled yet. Apply supabase/migrations/202610230016_pickup_line_items.sql in Supabase SQL Editor.";
  if (error.code === "23502" && error.message?.includes("vendor_id")) return "This Supabase project still requires a vendor for every pickup. Apply supabase/migrations/202610230009_unassigned_pickups.sql in Supabase SQL Editor, then retry.";
  if (error.code === "42703" && error.message?.includes("locality_pin_code")) return "The locality PIN column is missing. Apply supabase/migrations/202610230008_real_bulk_operations.sql first.";
  if (error.code === "42501") return "Supabase denied this pickup write. Check that the authentication and pickup RLS migrations are applied.";
  return "Your pickup request could not be saved. Check the required fields and try again.";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: claimsResult } = await supabase.auth.getClaims();
  const customerId = typeof claimsResult?.claims?.sub === "string" ? claimsResult.claims.sub : null;
  if (!customerId) return NextResponse.json({ error: "You must be signed in to request a pickup." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const vendorId = typeof body?.vendorId === "string" ? body.vendorId : "";
  const materialId = typeof body?.materialId === "string" ? body.materialId : "";
  const quantity = typeof body?.approximateQuantity === "number" ? body.approximateQuantity : Number(body?.approximateQuantity);
  const requestedItems = Array.isArray(body?.items) ? body.items.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null).map((item) => ({ material_id: typeof item.materialId === "string" ? item.materialId : typeof item.material_id === "string" ? item.material_id : "", quantity_kg: typeof item.quantityKg === "number" ? item.quantityKg : Number(item.quantityKg ?? item.quantity_kg) })) : [];
  const items = requestedItems.length ? requestedItems : [{ material_id: materialId, quantity_kg: quantity }];
  const pickupAddress = typeof body?.pickupAddress === "string" ? body.pickupAddress.trim() : "";
  const locality = typeof body?.locality === "string" ? body.locality.trim() : "";
  const localityPinCode = typeof body?.localityPinCode === "string" ? body.localityPinCode.trim() : null;
  const preferredDate = typeof body?.preferredDate === "string" ? body.preferredDate : "";
  const preferredTimeWindow = typeof body?.preferredTimeWindow === "string" ? body.preferredTimeWindow : "";
  const customerNotes = typeof body?.customerNotes === "string" ? body.customerNotes.trim() : null;

  if (!items.length || items.some((item) => !item.material_id || !Number.isFinite(item.quantity_kg) || item.quantity_kg <= 0) || pickupAddress.length < 5 || locality.length < 2 || !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || !allowedWindows.has(preferredTimeWindow)) {
    return NextResponse.json({ error: "Please provide valid pickup details." }, { status: 400 });
  }

  if (localityPinCode !== null && !/^\d{6}$/.test(localityPinCode)) return NextResponse.json({ error: "Enter a valid six-digit locality PIN code." }, { status: 400 });
  const result = await supabase.rpc("create_pickup_request", { requested_vendor: vendorId || null, requested_items: items, requested_address: pickupAddress, requested_locality: locality, requested_pin: localityPinCode, requested_date: preferredDate, requested_window: preferredTimeWindow, requested_notes: customerNotes });
  if (result.error) {
    console.error("[pickup_requests.insert]", { code: result.error.code ?? "unknown", message: result.error.message?.slice(0, 240) ?? "unknown database error" });
    return NextResponse.json({ error: pickupDatabaseError(result.error) }, { status: 400 });
  }
  return NextResponse.json({ pickup: Array.isArray(result.data) ? result.data[0] : result.data }, { status: 201 });
}
