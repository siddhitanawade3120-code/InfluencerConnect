import { refreshCreatorFromInstagram } from "@/lib/creator-refresh";
import {
  scrapeInstagramProfile,
  scrapedToCreatorInput,
  type ScrapeResult,
} from "@/lib/instagram-scraper";
import { cacheThrough } from "@/lib/cache";
import type { Creator } from "@/lib/types";

export interface EnsureCreatorOptions {
  city?: string;
  area?: string;
  sourceFound?: string;
}

export type EnsureCreatorResult =
  | { ok: true; creator: Creator }
  | { ok: false; error: string };

export interface InstagramPreview {
  instagramHandle: string;
  fullName: string;
  profilePicUrl: string;
  followerCount: number;
  avgEngagementRate: number;
  avgLikes?: number;
  avgComments?: number;
  nicheTags: string[];
  estimatedRateMin: number;
  estimatedRateMax: number;
  contentStyle?: string;
  bio?: string;
}

function scrapedToPreview(
  scraped: ScrapeResult,
  options: EnsureCreatorOptions
): InstagramPreview {
  const input = scrapedToCreatorInput(scraped, {
    city: options.city,
    area: options.area,
    sourceFound: "preview",
  });
  return {
    instagramHandle: input.instagramHandle,
    fullName: input.fullName,
    profilePicUrl: input.profilePicUrl,
    followerCount: input.followerCount,
    avgEngagementRate: input.avgEngagementRate,
    avgLikes: input.avgLikes ?? undefined,
    avgComments: input.avgComments ?? undefined,
    nicheTags: input.nicheTags,
    estimatedRateMin: input.estimatedRateMin,
    estimatedRateMax: input.estimatedRateMax,
    contentStyle: input.contentStyle ?? undefined,
    bio: input.notes ?? undefined,
  };
}

/** Scrape only — does not write to database. Cached 2 min per handle. */
export async function previewInstagramProfile(
  handle: string,
  options: EnsureCreatorOptions = {}
): Promise<{ ok: true; preview: InstagramPreview } | { ok: false; error: string }> {
  const normalized = handle.replace(/^@/, "").trim().toLowerCase();
  if (!normalized) {
    return { ok: false, error: "Instagram handle is required" };
  }

  try {
    const preview = await cacheThrough(
      "ig-preview",
      `${normalized}:${options.city ?? ""}:${options.area ?? ""}`,
      120_000,
      async () => {
        const scraped = await scrapeInstagramProfile(normalized);
        return scrapedToPreview(scraped, options);
      }
    );
    return { ok: true, preview };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Instagram preview failed",
    };
  }
}

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
