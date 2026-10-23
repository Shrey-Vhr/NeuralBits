import { Sparkles } from "lucide-react";
import Image from "next/image";

export function CleanCityVisual({ compact = false }: { compact?: boolean }) {
  return <div className={`relative overflow-hidden rounded-[2rem] bg-[#dcefe4] ${compact ? "min-h-64" : "min-h-[22rem] sm:min-h-[27rem]"}`}><Image src="/home-collection.png" alt="A household handing separated recyclable materials to a collection worker" fill priority={!compact} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-t from-[#103b28]/40 via-transparent to-transparent" /><div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-[#315d31] shadow-sm backdrop-blur"><Sparkles size={14} /> Cleaner streets start here</div></div>;
}
