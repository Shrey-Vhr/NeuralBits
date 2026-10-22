"use client";

import Link from "next/link";
import { useState } from "react";
import { Leaf, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/vendors", label: "Vendors" },
  { href: "/pickups", label: "Pickups" },
  { href: "/profile", label: "Profile" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
            <Leaf size={19} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight text-[var(--primary-strong)]">ScrapReady</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--surface)] hover:text-[var(--primary-strong)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/scan" className="hidden sm:block">
            <Button size="sm">Identify an item</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile navigation" className="border-t border-[var(--border)] bg-white px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface)]">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
