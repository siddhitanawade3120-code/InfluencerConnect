import type { Filter, Document } from "mongodb";
import type { Prisma } from "@prisma/client";
import {
  FOLLOWER_TIERS,
  type FollowerTier,
  type Niche,
  type SearchFilters,
} from "./types";

export const VV_LOCALITIES = [
  "Vasai-Virar",
  "Vasai",
  "Nalasopara",
  "Virar",
  "Naigaon",
  "Bhayandar",
] as const;

export interface CreatorListQuery {
  city?: string;
  area?: string;
  niches?: Niche[];
  budgetMin?: number;
  budgetMax?: number;
  followerMin?: number;
  followerMax?: number;
  followerTiers?: FollowerTier[];
  activeOnly?: boolean;
}

function applyFollowerRangeFilter(
  parts: Filter<Document>[],
  followerMin?: number,
  followerMax?: number
): void {
  if (followerMin != null && Number.isFinite(followerMin) && followerMin > 0) {
    parts.push({ followerCount: { $gte: followerMin } });
  }
  if (followerMax != null && Number.isFinite(followerMax)) {
    parts.push({ followerCount: { $lte: followerMax } });
  }
}

function applyFollowerRangePrisma(
  and: Prisma.CreatorWhereInput[],
  followerMin?: number,
  followerMax?: number
): void {
  const followerCount: Prisma.IntFilter = {};
  if (followerMin != null && Number.isFinite(followerMin) && followerMin > 0) {
    followerCount.gte = followerMin;
  }
  if (followerMax != null && Number.isFinite(followerMax)) {
    followerCount.lte = followerMax;
  }
  if (Object.keys(followerCount).length > 0) {
    and.push({ followerCount });
  }
}

export function areasForFilter(area: string): string[] {
  if (!area || area === "All Mumbai") return [];
  if (area === "Vasai-Virar") return [...VV_LOCALITIES];
  if ((VV_LOCALITIES as readonly string[]).includes(area)) {
    return [area, "Vasai-Virar"];
  }
  return [area];
}

function followerTierMongoConditions(tiers: FollowerTier[]): Filter<Document>[] {
  return tiers.map((tier) => {
    const def = FOLLOWER_TIERS.find((t) => t.id === tier);
    if (!def) return {};
    if (tier === "mid") {
      return { followerCount: { $gte: def.min } };
    }
    return {
      followerCount: { $gte: def.min, $lt: def.max },
    };
  });
}

export function buildMongoCreatorFilter(query: CreatorListQuery): Filter<Document> {
  const parts: Filter<Document>[] = [];

  if (query.activeOnly !== false) {
    parts.push({ isVerifiedActive: true });
  }

  if (query.city) {
    parts.push({ city: query.city });
  }

  if (query.area && query.area !== "All Mumbai") {
    const areas = areasForFilter(query.area);
    if (areas.length) parts.push({ area: { $in: areas } });
  }

  if (
    query.budgetMin != null &&
    query.budgetMax != null &&
    Number.isFinite(query.budgetMin) &&
    Number.isFinite(query.budgetMax)
  ) {
    parts.push({ estimatedRateMax: { $gte: query.budgetMin } });
    parts.push({ estimatedRateMin: { $lte: query.budgetMax } });
  }

  if (query.niches?.length) {
    parts.push({
      $or: query.niches.map((n) => ({
        nicheTags: { $regex: n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
      })),
    });
  }

  if (query.followerMin != null || query.followerMax != null) {
    applyFollowerRangeFilter(parts, query.followerMin, query.followerMax);
  } else if (query.followerTiers?.length) {
    const tierConditions = followerTierMongoConditions(query.followerTiers);
    if (tierConditions.length) {
      parts.push({ $or: tierConditions });
    }
  }

  if (parts.length === 0) return {};
  if (parts.length === 1) return parts[0];
  return { $and: parts };
}

function followerTierPrismaConditions(tiers: FollowerTier[]): Prisma.CreatorWhereInput[] {
  const conditions: Prisma.CreatorWhereInput[] = [];
  for (const tier of tiers) {
    const def = FOLLOWER_TIERS.find((t) => t.id === tier);
    if (!def) continue;
    if (tier === "mid") {
      conditions.push({ followerCount: { gte: def.min } });
    } else {
      conditions.push({ followerCount: { gte: def.min, lt: def.max } });
    }
  }
  return conditions;
}

/** Prisma filter — faster than raw Mongo + separate registry query per field */
export function buildPrismaCreatorWhere(
  query: CreatorListQuery,
  registeredIds: string[]
): Prisma.CreatorWhereInput {
  const and: Prisma.CreatorWhereInput[] = [{ id: { in: registeredIds } }];

  if (query.activeOnly !== false) {
    and.push({ isVerifiedActive: true });
  }

  if (query.city) {
    and.push({ city: query.city });
  }

  if (query.area && query.area !== "All Mumbai") {
    const areas = areasForFilter(query.area);
    if (areas.length) and.push({ area: { in: areas } });
  }

  if (
    query.budgetMin != null &&
    query.budgetMax != null &&
    Number.isFinite(query.budgetMin) &&
    Number.isFinite(query.budgetMax)
  ) {
    and.push({ estimatedRateMax: { gte: query.budgetMin } });
    and.push({ estimatedRateMin: { lte: query.budgetMax } });
  }

  if (query.niches?.length) {
    and.push({
      OR: query.niches.map((n) => ({
        nicheTags: { contains: n },
      })),
    });
  }

  if (query.followerMin != null || query.followerMax != null) {
    applyFollowerRangePrisma(and, query.followerMin, query.followerMax);
  } else if (query.followerTiers?.length) {
    const tierConditions = followerTierPrismaConditions(query.followerTiers);
    if (tierConditions.length) {
      and.push({ OR: tierConditions });
    }
  }

  return { AND: and };
}

export function parseCreatorListQuery(searchParams: URLSearchParams): CreatorListQuery {
  const activeOnly = searchParams.get("activeOnly") !== "false";
  const city = searchParams.get("city") ?? undefined;
  const area = searchParams.get("area") ?? undefined;

  const nichesRaw = searchParams.get("niches");
  const niches = nichesRaw
    ? (nichesRaw.split(",").filter(Boolean) as Niche[])
    : undefined;

  const budgetMin = parseInt(searchParams.get("budgetMin") ?? "", 10);
  const budgetMax = parseInt(searchParams.get("budgetMax") ?? "", 10);

  const tiersRaw = searchParams.get("followerTiers");
  const followerTiers = tiersRaw
    ? (tiersRaw.split(",").filter(Boolean) as FollowerTier[])
    : undefined;

  const followerMin = parseInt(searchParams.get("followerMin") ?? "", 10);
  const followerMax = parseInt(searchParams.get("followerMax") ?? "", 10);

  return {
    activeOnly,
    city: city || undefined,
    area: area || undefined,
    niches: niches?.length ? niches : undefined,
    budgetMin: Number.isFinite(budgetMin) ? budgetMin : undefined,
    budgetMax: Number.isFinite(budgetMax) ? budgetMax : undefined,
    followerMin: Number.isFinite(followerMin) ? followerMin : undefined,
    followerMax: Number.isFinite(followerMax) ? followerMax : undefined,
    followerTiers: followerTiers?.length ? followerTiers : undefined,
  };
}

export function filtersToSearchParams(
  filters: SearchFilters,
  activeOnly = true
): URLSearchParams {
  const params = new URLSearchParams();
  if (!activeOnly) params.set("activeOnly", "false");
  if (filters.city) params.set("city", filters.city);
  if (filters.area) params.set("area", filters.area);
  if (filters.niches.length) params.set("niches", filters.niches.join(","));
  params.set("budgetMin", String(filters.budgetMin));
  params.set("budgetMax", String(filters.budgetMax));
  params.set("followerMin", String(filters.followerMin));
  params.set("followerMax", String(filters.followerMax));
  if (filters.followerTiers.length) {
    params.set("followerTiers", filters.followerTiers.join(","));
  }
  return params;
}

export function searchFiltersToListQuery(filters: SearchFilters): CreatorListQuery {
  return {
    activeOnly: true,
    city: filters.city || undefined,
    area: filters.area || undefined,
    niches: filters.niches.length ? filters.niches : undefined,
    budgetMin: filters.budgetMin,
    budgetMax: filters.budgetMax,
    followerMin: filters.followerMin,
    followerMax: filters.followerMax,
    followerTiers: filters.followerTiers.length ? filters.followerTiers : undefined,
  };
}
