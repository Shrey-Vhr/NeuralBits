import { AuthCard } from "@/components/auth-card";
import { PageShell } from "@/components/page-shell";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return <PageShell><div className="flex justify-center py-4 sm:py-12"><AuthCard mode="login" nextPath={params.next?.startsWith("/") ? params.next : "/dashboard"} /></div></PageShell>;
}
