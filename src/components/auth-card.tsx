"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { syncProfileFromAuthUser } from "@/lib/profile-sync";
import { Button } from "@/components/ui/button";

type AuthMode = "login" | "signup" | "forgot";

export function AuthCard({ mode, nextPath = "/dashboard" }: { mode: AuthMode; nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const supabase = createSupabaseBrowserClient();
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const title = isSignup ? "Create your ScrapReady account" : isForgot ? "Reset your password" : "Welcome back";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null); setMessage(null);
    if (!supabase) { setError("Supabase is not configured for this environment."); return; }
    setLoading(true);
    const origin = window.location.origin;
    let authError: { message: string } | null = null;
    let hasSession = false;
    if (isForgot) {
      const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` });
      authError = result.error;
    } else if (isSignup) {
      const result = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName }, emailRedirectTo: `${origin}/auth/callback` } });
      authError = result.error;
      hasSession = Boolean(result.data.session);
    } else {
      const result = await supabase.auth.signInWithPassword({ email, password });
      authError = result.error;
      hasSession = Boolean(result.data.session);
      if (!result.error && result.data.user) await syncProfileFromAuthUser(supabase, result.data.user);
    }
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    if (isForgot) { setMessage("If an account exists for that email, a password reset link has been sent."); return; }
    if (isSignup && !hasSession) { setMessage("Check your email to verify your account before signing in."); return; }
    router.push(nextPath); router.refresh();
  }

  return <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--secondary-soft)] text-[var(--primary-strong)]"><LockKeyhole size={22} /></div><h1 className="mt-5 text-2xl font-bold text-[var(--primary-strong)]">{title}</h1><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{isForgot ? "We will email a secure link if the address is registered." : "Use email and password to access your private ScrapReady account."}</p><form onSubmit={submit} className="mt-6 space-y-4">{isSignup && <label className="block text-sm font-semibold text-[var(--foreground)]">Display name<span className="sr-only"> (optional)</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" placeholder="Your name" /></label>}<label className="block text-sm font-semibold text-[var(--foreground)]"><span className="flex items-center gap-2"><Mail size={15} /> Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]" placeholder="you@example.com" /></label>{!isForgot && <label className="block text-sm font-semibold text-[var(--foreground)]"><span className="flex items-center gap-2"><LockKeyhole size={15} /> Password</span><span className="mt-2 flex min-h-11 items-center rounded-xl border border-[var(--border)] pr-3 focus-within:ring-2 focus-within:ring-[var(--ring)]"><input required minLength={6} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border-0 px-3 text-sm outline-none" placeholder="At least 6 characters" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>}{error && <p role="alert" className="rounded-xl bg-[#fff0ef] p-3 text-sm leading-6 text-[#9b3028]">{error}</p>}{message && <p role="status" className="rounded-xl bg-[var(--secondary-soft)] p-3 text-sm leading-6 text-[var(--primary-strong)]">{message}</p>}<Button type="submit" className="w-full" disabled={loading}>{loading ? <><LoaderCircle className="animate-spin" size={17} /> Working…</> : <>{isSignup ? "Create account" : isForgot ? "Send reset link" : "Sign in"}<ArrowRight size={17} /></>}</Button></form><div className="mt-6 flex flex-wrap gap-x-3 gap-y-2 text-sm text-[var(--muted-foreground)]">{mode === "login" && <><Link href="/forgot-password" className="font-semibold text-[var(--primary)] hover:underline">Forgot password?</Link><span>·</span><Link href="/signup" className="font-semibold text-[var(--primary)] hover:underline">Create an account</Link></>}{mode === "signup" && <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">Already have an account? Sign in</Link>}{mode === "forgot" && <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">Back to sign in</Link>}</div></div>;
}
