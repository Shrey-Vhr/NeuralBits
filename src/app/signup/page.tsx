import { AuthCard } from "@/components/auth-card";
import { PageShell } from "@/components/page-shell";

export default function SignupPage() { return <PageShell><div className="flex justify-center py-4 sm:py-12"><AuthCard mode="signup" /></div></PageShell>; }
