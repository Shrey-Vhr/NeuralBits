import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteFooter } from "@/components/site-footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] grain">
      <AppSidebar />
      <main className="min-h-screen px-4 pb-20 pt-20 sm:px-6 md:ml-72 md:pt-10 lg:px-12"><div className="mx-auto max-w-[1280px]">{children}<SiteFooter /></div></main>
    </div>
  );
}
