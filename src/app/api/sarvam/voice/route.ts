import { NextResponse } from "next/server";

const requestLog = new Map<string, number[]>();
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const WINDOW_MS = 60_000;

function limited(ip: string) { const now = Date.now(); const recent = (requestLog.get(ip) ?? []).filter((time) => now - time < WINDOW_MS); if (recent.length >= 5) return true; recent.push(now); requestLog.set(ip, recent); return false; }
function failure(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }

export async function POST(request: Request) {
  const key = process.env.SARVAM_API_KEY;
  if (!key) return failure("Voice assistant is not configured yet. Add SARVAM_API_KEY to .env.local.", 503);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return failure("Please wait a moment before trying voice input again.", 429);
  const form = await request.formData().catch(() => null); const audio = form?.get("audio"); const language = typeof form?.get("language") === "string" ? form.get("language") as string : "en-IN";
  if (!(audio instanceof File)) return failure("Please record a voice question first.");
  if (audio.size > MAX_AUDIO_BYTES) return failure("The recording is too large. Keep it under 8 MB.", 413);
  try {
    const sttForm = new FormData(); sttForm.append("file", audio, audio.name || "scrapready-voice.webm"); sttForm.append("model", "saaras:v4"); sttForm.append("mode", "transcribe");
    const sttResponse = await fetch("https://api.sarvam.ai/speech-to-text", { method: "POST", headers: { "api-subscription-key": key }, body: sttForm, cache: "no-store" });
    if (!sttResponse.ok) return failure("Sarvam could not understand that recording. Please try again.", 502);
    const stt = await sttResponse.json() as { transcript?: string; language_code?: string };
    const transcript = stt.transcript?.trim(); if (!transcript) return failure("No speech was detected. Please try again.");
    const chatResponse = await fetch("https://api.sarvam.ai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "api-subscription-key": key }, body: JSON.stringify({ model: "sarvam-105b-conversations", temperature: 0.2, max_tokens: 220, messages: [{ role: "system", content: "You are ScrapReady's concise recycling assistant for Indian households. Answer in simple language. Help with identifying materials, preparation, pickup, locality bulk pickups, and the app's public features. Never invent prices, vendors, approvals, or safety instructions. For hazardous items, recommend an authorised specialist route. Keep replies under 80 words." }, { role: "user", content: transcript }] }), cache: "no-store" });
    if (!chatResponse.ok) return NextResponse.json({ transcript, error: "The voice was transcribed, but the assistant response is temporarily unavailable." }, { status: 502 });
    const chat = await chatResponse.json() as { choices?: Array<{ message?: { content?: string } }> }; const answer = chat.choices?.[0]?.message?.content?.trim() ?? "I could not prepare an answer right now.";
    const ttsResponse = await fetch("https://api.sarvam.ai/text-to-speech", { method: "POST", headers: { "Content-Type": "application/json", "api-subscription-key": key }, body: JSON.stringify({ text: [answer], target_language_code: language, model: "bulbul:v3", speaker: "shubh", speech_sample_rate: 22050 }), cache: "no-store" });
    if (!ttsResponse.ok) return NextResponse.json({ transcript, answer, audio: null }, { status: 200 });
    const tts = await ttsResponse.json() as { audios?: string[] }; return NextResponse.json({ transcript, answer, audio: tts.audios?.[0] ?? null, audioMimeType: "audio/wav" });
  } catch { return failure("Voice assistant is temporarily unavailable. You can continue using the app manually.", 502); }
}
