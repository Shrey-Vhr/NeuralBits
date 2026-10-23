import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: claims } = await supabase.auth.getClaims();
  if (typeof claims?.claims?.sub !== "string") return NextResponse.json({ error: "Please sign in as an administrator." }, { status: 401 });
  const { id } = await params;
  const result = await supabase.rpc("approve_vendor_application", { application_to_approve: id });
  if (result.error) return NextResponse.json({ error: "Vendor approval failed." }, { status: 403 });
  return NextResponse.json({ vendorId: result.data });
}
