"use client";

import { useState } from "react";
import { LoaderCircle, X } from "lucide-react";

export function CancelPickupButton({ pickupId }: { pickupId: string }) { const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null); async function cancel() { if (!window.confirm("Cancel this pickup request?")) return; setLoading(true); setError(null); const response = await fetch(`/api/pickups/${pickupId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "cancelled" }) }); const body = await response.json().catch(() => ({})); setLoading(false); if (!response.ok) setError(body.error ?? "This pickup could not be cancelled."); else window.location.reload(); } return <div className="mt-4">{error && <p role="alert" className="mb-2 text-xs text-[#9b3028]">{error}</p>}<button type="button" onClick={cancel} disabled={loading} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#b54747] px-3 text-xs font-bold text-[#9b3028] disabled:opacity-50">{loading ? <LoaderCircle className="animate-spin" size={14} /> : <X size={14} />}Cancel request</button></div>; }
