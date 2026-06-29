import { refreshCreatorFromInstagram } from "@/lib/creator-refresh";
import type { Creator } from "@/lib/types";

export interface EnsureCreatorOptions {
  city?: string;
  area?: string;
  sourceFound?: string;
}

export type EnsureCreatorResult =
  | { ok: true; creator: Creator }
  | { ok: false; error: string };

/**
 * Scrape Instagram and upsert the public creator directory entry.
 * Used on creator signup so brands can discover them immediately.
 */
export async function ensureCreatorFromInstagram(
  handle: string,
  options: EnsureCreatorOptions = {}
): Promise<EnsureCreatorResult> {
  const normalized = handle.replace(/^@/, "").trim().toLowerCase();
  if (!normalized) {
    return { ok: false, error: "Instagram handle is required" };
  }

  const result = await refreshCreatorFromInstagram(normalized, {
    city: options.city ?? "Mumbai",
    area: options.area ?? "Vasai-Virar",
    sourceFound: options.sourceFound ?? "creator-signup",
  });

  if (!result.ok || !result.creator) {
    return {
      ok: false,
      error:
        result.error ??
        "Could not load your Instagram profile. Make sure the account is public and the handle is correct.",
    };
  }

  return { ok: true, creator: result.creator };
}
