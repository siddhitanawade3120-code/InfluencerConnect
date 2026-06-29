import { prisma } from "@/lib/prisma";
import { isValidObjectId } from "@/lib/mongodb";
import { cacheGet, cacheInvalidate, cacheSet } from "@/lib/cache";

const REGISTRY_CACHE = "registered-creators";
const REGISTRY_TTL_MS = 60_000;

/** Directory creator IDs that have a signed-up creator account linked */
export async function getRegisteredCreatorIds(): Promise<string[]> {
  const cached = cacheGet<string[]>(REGISTRY_CACHE, "ids");
  if (cached) return cached;

  const profiles = await prisma.creatorProfile.findMany({
    where: { creatorId: { not: null } },
    select: { creatorId: true },
  });
  const ids = profiles
    .map((p) => p.creatorId)
    .filter((id): id is string => !!id && isValidObjectId(id));

  cacheSet(REGISTRY_CACHE, "ids", ids, REGISTRY_TTL_MS);
  return ids;
}

export function invalidateRegisteredCreatorCache(): void {
  cacheInvalidate(REGISTRY_CACHE);
  cacheInvalidate("creator-list");
  cacheInvalidate("marketplace-stats");
}

export async function isRegisteredCreator(creatorId: string): Promise<boolean> {
  if (!isValidObjectId(creatorId)) return false;
  const ids = await getRegisteredCreatorIds();
  return ids.includes(creatorId);
}
