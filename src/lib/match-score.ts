import type { Creator } from "./types";

export interface MatchScoreInput {
  brandBudgetMin?: number;
  brandBudgetMax?: number;
}

/** Weighted match score 0–100 for brand–creator fit */
export function computeMatchScore(
  creator: Creator,
  { brandBudgetMin, brandBudgetMax }: MatchScoreInput
): number {
  const creatorMid = (creator.estimatedRateMin + creator.estimatedRateMax) / 2;

  let budgetScore = 50;
  if (
    brandBudgetMin != null &&
    brandBudgetMax != null &&
    Number.isFinite(brandBudgetMin) &&
    Number.isFinite(brandBudgetMax)
  ) {
    const brandMid = (brandBudgetMin + brandBudgetMax) / 2;
    const diff = Math.abs(creatorMid - brandMid);
    const scale = Math.max(brandMid, creatorMid, 1000);
    budgetScore = Math.max(0, 100 - (diff / scale) * 100);
  }

  const engagementScore = Math.min((creator.avgEngagementRate / 12) * 100, 100);

  const verifiedAt = new Date(creator.lastVerifiedDate).getTime();
  const daysSince = (Date.now() - verifiedAt) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, Math.min(100, 100 - (daysSince / 60) * 100));

  return Math.round(
    budgetScore * 0.45 + engagementScore * 0.35 + recencyScore * 0.2
  );
}

export type CreatorWithMatchScore = Creator & { matchScore: number };

export function sortCreatorsByMatchScore(
  creators: Creator[],
  budget: MatchScoreInput
): CreatorWithMatchScore[] {
  return creators
    .map((c) => ({ ...c, matchScore: computeMatchScore(c, budget) }))
    .sort((a, b) => b.matchScore - a.matchScore);
}
