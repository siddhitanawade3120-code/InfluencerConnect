import type { CurrentUser } from "@/lib/auth";
import type { Creator } from "@/lib/types";

/** Brands and anonymous visitors may browse the creator directory. Creators may not. */
export function canBrowseCreatorDirectory(user: CurrentUser | null): boolean {
  return !user || user.role === "BRAND";
}

export function canViewCreatorProfile(
  user: CurrentUser | null,
  creatorId: string
): boolean {
  if (canBrowseCreatorDirectory(user)) return true;
  if (user?.role === "CREATOR") {
    return user.creatorProfile?.creatorId === creatorId;
  }
  return false;
}

export function shouldShowCreatorContact(user: CurrentUser | null): boolean {
  return user?.role === "BRAND";
}

export function redactCreatorContact(creator: Creator, showContact: boolean): Creator {
  if (showContact) return creator;
  return {
    ...creator,
    contactValue: "",
    contactMethod: "dm_only",
  };
}
