import Link from "next/link";
import { Camera, CircleUserRound, Home, MapPin, PackageCheck } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/scan", label: "Scan", icon: Camera },
  { href: "/vendors", label: "Vendors", icon: MapPin },
  { href: "/pickups", label: "Pickups", icon: PackageCheck },
  { href: "/profile", label: "Profile", icon: CircleUserRound },
];

export function MobileNav() {
  return (
    <nav aria-label="Mobile tab navigation" className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--primary-strong)]">
            <Icon size={19} strokeWidth={1.8} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
