import type { ReactNode } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6 md:pb-12 lg:px-8">{children}</main>
      <MobileNav />
    </div>
  );
}
