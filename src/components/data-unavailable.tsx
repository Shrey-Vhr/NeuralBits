import { AlertTriangle } from "lucide-react";

export function DataUnavailable({ message = "The live content service is unavailable. Please try again later." }: { message?: string }) {
  return <div className="mt-8 rounded-2xl border border-[#f1dfaa] bg-[#fffaf0] p-6"><div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-[#9a7310]" size={22} /><div><h2 className="font-bold text-[#6f5206]">Live content unavailable</h2><p className="mt-2 text-sm leading-6 text-[#7b5a08]">{message}</p></div></div></div>;
}
