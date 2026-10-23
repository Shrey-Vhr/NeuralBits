import { redirect } from "next/navigation";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) { const params = await searchParams; redirect(`/profile${params.next?.startsWith("/") ? `?next=${encodeURIComponent(params.next)}` : ""}`); }
