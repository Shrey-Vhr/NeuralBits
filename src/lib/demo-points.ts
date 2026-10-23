export const DEMO_TRANSACTION_ID = "DEMO-SCRAP-PLASTIC-001";
export const DEMO_POINTS_PER_KG = 10;
export const MULTI_MATERIAL_DEMO_TRANSACTION_ID = "DEMO-MULTI-MATERIAL-PICKUP-001";
export type DemoPointsActivity = { id: string; points: number; material: string; weightKg: number; createdAt: string; breakdown?: Array<{ material: string; weightKg: number; points: number }> };
export type DemoPointsState = { balance: number; totalEarned: number; activity: DemoPointsActivity[] };
const KEY = "scrapready-demo-points-v1";
export const emptyDemoPoints: DemoPointsState = { balance: 0, totalEarned: 0, activity: [] };
export function readDemoPoints(): DemoPointsState { if (typeof window === "undefined") return emptyDemoPoints; try { return JSON.parse(localStorage.getItem(KEY) ?? JSON.stringify(emptyDemoPoints)) as DemoPointsState; } catch { return emptyDemoPoints; } }
export function awardDemoPoints(): DemoPointsState { const state = readDemoPoints(); if (state.activity.some((entry) => entry.id === DEMO_TRANSACTION_ID)) return state; const entry = { id: DEMO_TRANSACTION_ID, points: 30, material: "Plastic bottles", weightKg: 3, createdAt: new Date().toISOString() }; const next = { balance: state.balance + entry.points, totalEarned: state.totalEarned + entry.points, activity: [entry, ...state.activity] }; localStorage.setItem(KEY, JSON.stringify(next)); return next; }
export function awardMultiMaterialDemoPoints(): DemoPointsState { const state = readDemoPoints(); if (state.activity.some((entry) => entry.id === MULTI_MATERIAL_DEMO_TRANSACTION_ID)) return state; const entry = { id: MULTI_MATERIAL_DEMO_TRANSACTION_ID, points: 48, material: "Newspaper · PET plastic bottles · Iron / steel", weightKg: 6, createdAt: new Date().toISOString(), breakdown: [{ material: "Newspaper", weightKg: 2, points: 10 }, { material: "PET plastic bottles", weightKg: 3, points: 30 }, { material: "Iron / steel", weightKg: 1, points: 8 }] }; const next = { balance: state.balance + entry.points, totalEarned: state.totalEarned + entry.points, activity: [entry, ...state.activity] }; localStorage.setItem(KEY, JSON.stringify(next)); return next; }
export function awardBulkDemoPoints(entries: Array<{ id: string; points: number; weightKg: number; material?: string }>): DemoPointsState {
  const state = readDemoPoints();
  const newEntries = entries.filter((entry) => !state.activity.some((activity) => activity.id === entry.id)).map((entry) => ({ ...entry, material: entry.material ?? "Plastic bottles", createdAt: new Date().toISOString() }));
  if (newEntries.length === 0) return state;
  const points = newEntries.reduce((total, entry) => total + entry.points, 0);
  const next = { balance: state.balance + points, totalEarned: state.totalEarned + points, activity: [...newEntries, ...state.activity] };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
export function resetBulkDemoPoints(): DemoPointsState {
  const state = readDemoPoints();
  const activity = state.activity.filter((entry) => !entry.id.startsWith("DEMO-BULK-"));
  const total = activity.reduce((sum, entry) => sum + entry.points, 0);
  const next = { balance: total, totalEarned: total, activity };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
