import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function errorResponse(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }
function migrationMessage(message: string, fallback: string) { return /does not exist|schema cache|function .* not found/i.test(message) ? "Live bulk operations are not enabled yet. Apply supabase/migrations/202610230008_real_bulk_operations.sql in Supabase SQL Editor." : fallback; }
function logBulkError(operation: string, error: { code?: string; message?: string }) { console.error(`[bulk_pickups.${operation}]`, { code: error.code ?? "unknown", message: error.message?.slice(0, 240) ?? "unknown database error" }); }
type MineGroup = { group_id: string; locality: string | null; locality_pin_code: string; preferred_date: string | null; preferred_time_window: string; join_deadline: string; group_status: string; assigned_vendor_id: string | null; participant_count: number; total_weight_kg: number; my_contribution_id: string | null; my_weight_kg: number | null; my_stop_status: string | null };

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return errorResponse("Supabase is not configured.", 503);
  const { data: claims } = await supabase.auth.getClaims();
  if (typeof claims?.claims?.sub !== "string") return errorResponse("You must be signed in.", 401);
  const url = new URL(request.url);
  if (url.searchParams.get("notifications") === "1") {
    const result = await supabase.rpc("get_my_bulk_notifications");
    if (result.error) { logBulkError("notifications", result.error); return errorResponse(migrationMessage(result.error.message, "Bulk notifications are unavailable."), 503); }
    return NextResponse.json({ notifications: result.data ?? [] });
  }
  if (url.searchParams.get("mine") === "1") {
    const result = await supabase.rpc("bulk_my_groups");
    if (result.error) { logBulkError("mine", result.error); return errorResponse(migrationMessage(result.error.message, "Your bulk pickup groups could not be loaded."), 503); }
    return NextResponse.json({ groups: ((result.data ?? []) as MineGroup[]).map((group) => ({ id: group.group_id, locality: group.locality, locality_pin_code: group.locality_pin_code, preferred_date: group.preferred_date, preferred_time_window: group.preferred_time_window, join_deadline: group.join_deadline, group_status: group.group_status, assigned_vendor_id: group.assigned_vendor_id, participant_count: group.participant_count, total_weight_kg: group.total_weight_kg, my_contribution: group.my_contribution_id ? { id: group.my_contribution_id, estimated_weight_kg: group.my_weight_kg, stop_status: group.my_stop_status } : null })) });
  }
  const pin = url.searchParams.get("pin") ?? ""; const date = url.searchParams.get("date") ?? ""; const time = url.searchParams.get("time") ?? ""; const materialId = url.searchParams.get("materialId") ?? "";
  if (!/^\d{6}$/.test(pin) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !["morning", "afternoon", "evening"].includes(time) || !materialId) return errorResponse("Provide a valid PIN, date, time window, and material.");
  const result = await supabase.rpc("bulk_discover_groups", { requested_pin: pin, requested_date: date, requested_window: time, requested_material: materialId });
  if (result.error) { logBulkError("discover", result.error); return errorResponse(migrationMessage(result.error.message, "Compatible bulk groups are unavailable."), 503); }
  return NextResponse.json({ groups: result.data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return errorResponse("Supabase is not configured.", 503);
  const { data: claims } = await supabase.auth.getClaims();
  if (typeof claims?.claims?.sub !== "string") return errorResponse("You must be signed in.", 401);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const action = typeof body?.action === "string" ? body.action : "";
  let result: { data: unknown; error: { message: string } | null };
  if (action === "create") result = await supabase.rpc("bulk_create_group", { pickup_id: body?.pickupId, requested_pin: body?.localityPinCode });
  else if (action === "join") result = await supabase.rpc("bulk_join_group", { group_to_join: body?.groupId, pickup_id: body?.pickupId });
  else if (action === "leave") result = await supabase.rpc("bulk_leave_group", { group_to_leave: body?.groupId });
  else if (action === "close") result = await supabase.rpc("bulk_close_group", { group_to_close: body?.groupId });
  else if (action === "assign") result = await supabase.rpc("bulk_assign_vendor", { group_to_assign: body?.groupId, vendor_to_assign: body?.vendorId });
  else if (action === "claimGroup") result = await supabase.rpc("vendor_claim_bulk_group", { requested_group: body?.groupId });
  else if (action === "claimPickup") result = await supabase.rpc("vendor_claim_pickup", { requested_pickup: body?.pickupId });
  else if (action === "accept") result = await supabase.rpc("bulk_accept_group", { group_to_accept: body?.groupId });
  else if (action === "stop") result = await supabase.rpc("bulk_update_stop", { contribution_to_update: body?.contributionId, next_status: body?.status, actual_weight: body?.actualWeight ?? null });
  else return errorResponse("Unsupported bulk pickup action.");
  if (result.error) { logBulkError(action, result.error); return errorResponse(migrationMessage(result.error.message, "Bulk pickup action was not authorized or could not be completed."), result.error.message.match(/does not exist|schema cache|function .* not found/i) ? 503 : 403); }
  return NextResponse.json({ result: result.data ?? null });
}
