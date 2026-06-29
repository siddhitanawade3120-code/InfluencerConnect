import { prisma } from "@/lib/prisma";
import { isValidObjectId, ObjectId } from "@/lib/mongodb";

/** Directory creator IDs that have a signed-up creator account linked */
export async function getRegisteredCreatorIds(): Promise<string[]> {
  const profiles = await prisma.creatorProfile.findMany({
    where: { creatorId: { not: null } },
    select: { creatorId: true },
  });
  return profiles
    .map((p) => p.creatorId)
    .filter((id): id is string => !!id && isValidObjectId(id));
}

export async function isRegisteredCreator(creatorId: string): Promise<boolean> {
  if (!isValidObjectId(creatorId)) return false;
  const profile = await prisma.creatorProfile.findFirst({
    where: { creatorId },
    select: { id: true },
  });
  return !!profile;
}

export function toObjectIds(ids: string[]): ObjectId[] {
  return ids.map((id) => new ObjectId(id));
}
