import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import type { ContentStatus } from "@/lib/content";

export function ContentStatus({ status }: { status: ContentStatus }) {
  const approved = status === "approved";
  const label = approved ? "Approved guide" : status === "pending_review" ? "Pending review" : status === "draft" ? "Draft" : "Archived";
  const Icon = approved ? CheckCircle2 : status === "archived" ? AlertTriangle : Clock3;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${approved ? "bg-[#e2f4e9] text-[var(--primary-strong)]" : "bg-[#fff4d6] text-[#7b5a08]"}`}><Icon size={13} /> {label}</span>;
}
