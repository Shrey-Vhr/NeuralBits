import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { PasswordResetForm } from "@/components/password-reset-form";

export default function ResetPasswordPage() { return <PageShell><div className="flex justify-center py-4 sm:py-12"><div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--secondary-soft)] text-[var(--primary-strong)]"><LockKeyhole size={22} /></div><h1 className="mt-5 text-2xl font-bold text-[var(--primary-strong)]">Choose a new password</h1><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Use this page after opening the secure reset link from your email.</p><PasswordResetForm /><Link href="/login" className="mt-5 inline-block text-sm font-semibold text-[var(--primary)] hover:underline">Back to sign in</Link></div></div></PageShell>; }
