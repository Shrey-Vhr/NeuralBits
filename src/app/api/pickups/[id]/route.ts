import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: claimsResult } = await supabase.auth.getClaims();
  if (!claimsResult?.claims?.sub) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const status = typeof body?.status === "string" ? body.status : "";
  if (!new Set(["accepted", "rejected", "cancelled", "completed"]).has(status)) return NextResponse.json({ error: "Invalid pickup status." }, { status: 400 });

  const result = await supabase.from("pickup_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select("id, status, updated_at").single();
  if (result.error) return NextResponse.json({ error: "This pickup status change was not authorized or is not valid." }, { status: 403 });
  return NextResponse.json({ pickup: result.data });
}
