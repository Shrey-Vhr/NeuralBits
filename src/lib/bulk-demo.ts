export type BulkDemoView = "households" | "vendor";
export type BulkStopStatus = "waiting" | "joined" | "collected";
export type BulkDemoStatus = "requested" | "ready" | "accepted" | "completed";
export type BulkDemoParticipant = { id: string; name: string; weightKg: number; points: number; status: BulkStopStatus };
export type BulkDemoState = { status: BulkDemoStatus; view: BulkDemoView; participants: BulkDemoParticipant[] };
export const BULK_DEMO_KEY = "scrapready-bulk-demo-v2";
export const initialBulkDemoState: BulkDemoState = {
  status: "requested", view: "households", participants: [
    { id: "household-a", name: "Household A", weightKg: 4, points: 40, status: "waiting" },
    { id: "household-b", name: "Household B", weightKg: 3, points: 30, status: "waiting" },
    { id: "household-c", name: "Household C", weightKg: 5, points: 50, status: "waiting" },
  ],
};
export function readBulkDemo(): BulkDemoState { if (typeof window === "undefined") return initialBulkDemoState; try { const parsed = JSON.parse(localStorage.getItem(BULK_DEMO_KEY) ?? "null") as Partial<BulkDemoState> | null; return parsed?.participants ? { ...initialBulkDemoState, ...parsed } as BulkDemoState : initialBulkDemoState; } catch { return initialBulkDemoState; } }
export function writeBulkDemo(state: BulkDemoState) { localStorage.setItem(BULK_DEMO_KEY, JSON.stringify(state)); }
