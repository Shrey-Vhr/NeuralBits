import { RegistrationForm } from "@/components/registration-form";
import { PageShell } from "@/components/page-shell";

// @next-codemod-ignore Cache Components adoption: this page reads the selected registration role.
export const instant = false;

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) { const params = await searchParams; const role = params.role === "vendor" ? "vendor" : "seller"; return <PageShell><div className="flex justify-center py-4 sm:py-12"><RegistrationForm role={role} /></div></PageShell>; }
