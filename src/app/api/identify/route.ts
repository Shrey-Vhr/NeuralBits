import { NextResponse } from "next/server";
import { getEducationContent } from "@/lib/content-repository";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const requestLog = new Map<string, number[]>();

function allowedRequest(ip: string) {
  const now = Date.now(); const recent = (requestLog.get(ip) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 5) return false; recent.push(now); requestLog.set(ip, recent); return true;
}

export async function POST(request: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "AI identification unavailable. Use manual item search instead." }, { status: 503 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowedRequest(ip)) return NextResponse.json({ error: "Too many identification attempts. Please wait a minute." }, { status: 429 });
  const formData = await request.formData().catch(() => null);
  const image = formData?.get("image");
  if (!(image instanceof File)) return NextResponse.json({ error: "Please select an image." }, { status: 400 });
  if (!allowedTypes.has(image.type)) return NextResponse.json({ error: "Unsupported image format." }, { status: 415 });
  if (image.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Image is too large. Maximum size is 5 MB." }, { status: 413 });

  const content = await getEducationContent();
  if (content.error) return NextResponse.json({ error: "Live educational content is unavailable." }, { status: 503 });
  const catalog = content.items.map((item) => ({ slug: item.slug, name: item.name, alternatives: item.alternativeNames, materialSlugs: item.materialSlugs, hazardous: item.isHazardous }));
  const bytes = Buffer.from(await image.arrayBuffer()).toString("base64");
  const prompt = `Identify the likely household item in this image. Return JSON only with keys itemSlug, materialSlug, confidence, explanation. Choose itemSlug only from this catalog: ${JSON.stringify(catalog)}. Do not invent a slug. materialSlug must be one of the item's materialSlugs. Use low confidence when uncertain. Do not provide disposal or dismantling instructions. The app will retrieve all guidance separately.`;
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent", { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: image.type, data: bytes } }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.1 } }), cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "AI identification is temporarily unavailable. Use manual item search instead." }, { status: 502 });
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const raw = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  let parsed: { itemSlug?: string | null; materialSlug?: string | null; confidence?: string; explanation?: string };
  try { parsed = JSON.parse(raw); } catch { return NextResponse.json({ error: "AI returned an unreadable result. Use manual item search instead." }, { status: 502 }); }
  const item = content.items.find((candidate) => candidate.slug === parsed.itemSlug);
  const material = item ? content.materials.find((candidate) => candidate.slug === (parsed.materialSlug && item.materialSlugs.includes(parsed.materialSlug) ? parsed.materialSlug : item.materialSlugs[0])) : undefined;
  return NextResponse.json({ result: { itemSlug: item?.slug ?? null, materialSlug: material?.slug ?? null, confidence: parsed.confidence === "high" || parsed.confidence === "medium" ? parsed.confidence : "low", explanation: typeof parsed.explanation === "string" ? parsed.explanation : "AI suggestion matched against the existing ScrapReady catalog." } });
}
