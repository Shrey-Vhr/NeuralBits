import type { Material } from "@/lib/content";

export type RewardRate = { materialSlug: string; label: string; pointsPerKg: number; eligible: boolean; demoOnly: true };

// Illustrative demo configuration. These are not market prices or production rewards.
export const demoRewardRates: RewardRate[] = [
  { materialSlug: "paper", label: "Newspaper", pointsPerKg: 5, eligible: true, demoOnly: true },
  { materialSlug: "cardboard", label: "Cardboard", pointsPerKg: 6, eligible: true, demoOnly: true },
  { materialSlug: "plastic", label: "PET plastic bottles", pointsPerKg: 10, eligible: true, demoOnly: true },
  { materialSlug: "iron-steel", label: "Iron / steel", pointsPerKg: 8, eligible: true, demoOnly: true },
  { materialSlug: "aluminium", label: "Aluminium", pointsPerKg: 15, eligible: true, demoOnly: true },
];

export function getDemoRewardRate(materialSlug: string) { return demoRewardRates.find((rate) => rate.materialSlug === materialSlug && rate.eligible); }
export function getEligibleDemoRates(materials: Material[]) { return demoRewardRates.map((rate) => ({ ...rate, material: materials.find((material) => material.slug === rate.materialSlug) })).filter((rate) => rate.material); }
export function calculateDemoPoints(weightKg: number, pointsPerKg: number) { return Math.round(weightKg * pointsPerKg * 100) / 100; }
