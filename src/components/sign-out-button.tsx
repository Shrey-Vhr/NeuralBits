"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter(); const [loading, setLoading] = useState(false);
  async function signOut() { const supabase = createSupabaseBrowserClient(); if (!supabase) return; setLoading(true); await supabase.auth.signOut(); router.push("/"); router.refresh(); }
  return <Button variant="outline" onClick={signOut} disabled={loading}><LogOut size={16} />{loading ? "Signing out…" : "Sign out"}</Button>;
}
