"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function PasswordResetForm() {
  const [password, setPassword] = useState(""); const [confirmation, setConfirmation] = useState(""); const [error, setError] = useState<string | null>(null); const [message, setMessage] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(null); setMessage(null); if (password !== confirmation) { setError("Passwords do not match."); return; } const supabase = createSupabaseBrowserClient(); if (!supabase) { setError("Supabase is not configured."); return; } setLoading(true); const { error: updateError } = await supabase.auth.updateUser({ password }); setLoading(false); if (updateError) setError(updateError.message); else setMessage("Password updated. You can now sign in with your new password."); }
  return <form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-semibold"><span className="flex items-center gap-2"><LockKeyhole size={15} /> New password</span><input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" /></label><label className="block text-sm font-semibold">Confirm password<input required minLength={6} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" /></label>{error && <p role="alert" className="rounded-xl bg-[#fff0ef] p-3 text-sm text-[#9b3028]">{error}</p>}{message && <p role="status" className="rounded-xl bg-[var(--secondary-soft)] p-3 text-sm leading-6 text-[var(--primary-strong)]">{message}</p>}<Button type="submit" disabled={loading}>{loading && <LoaderCircle className="animate-spin" size={16} />}Update password</Button></form>;
}
