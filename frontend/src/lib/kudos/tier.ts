import type { KudoTier } from "@/types/kudos";

export const TIER_THRESHOLDS: ReadonlyArray<{
  tier: KudoTier;
  min: number;
}> = [
  { tier: "legend", min: 100 },
  { tier: "super", min: 30 },
  { tier: "rising", min: 10 },
  { tier: "new", min: 0 },
];

export function computeTier(received: number): KudoTier {
  const safe = Math.max(0, received | 0);
  for (const { tier, min } of TIER_THRESHOLDS) {
    if (safe >= min) return tier;
  }
  return "new";
}
