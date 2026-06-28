import type { Creator as DbCreator } from "@prisma/client";
import type { Creator, Niche } from "./types";

export function parseJsonArray<T extends string>(json: string | null | undefined): T[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return json.split(",").map((s) => s.trim()).filter(Boolean) as T[];
  }
}

export function toJsonArray(values: string[]): string {
  return JSON.stringify(values);
}

export function dbToCreator(row: DbCreator): Creator {
  return {
    id: row.id,
    instagramHandle: row.instagramHandle,
    fullName: row.fullName,
    city: row.city,
    area: row.area,
    nicheTags: parseJsonArray<Niche>(row.nicheTags),
    followerCount: row.followerCount,
    avgEngagementRate: row.avgEngagementRate,
    estimatedRateMin: row.estimatedRateMin,
    estimatedRateMax: row.estimatedRateMax,
    contactMethod: row.contactMethod,
    contactValue: row.contactValue,
    lastVerifiedDate: row.lastVerifiedDate.toISOString().split("T")[0],
    profilePicUrl: row.profilePicUrl,
    accountType: row.accountType,
    isVerifiedActive: row.isVerifiedActive,
    recentPostCountChecked: row.recentPostCountChecked ?? undefined,
    avgLikes: row.avgLikes ?? undefined,
    avgComments: row.avgComments ?? undefined,
    contentStyle: row.contentStyle ?? undefined,
    previousBrandCollabs: row.previousBrandCollabs ?? undefined,
    language: parseJsonArray<string>(row.language),
    sourceFound: row.sourceFound ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export interface CreatorInput {
  instagramHandle: string;
  fullName: string;
  city: string;
  area: string;
  nicheTags: string[];
  followerCount: number;
  avgEngagementRate: number;
  estimatedRateMin: number;
  estimatedRateMax: number;
  contactMethod: string;
  contactValue: string;
  lastVerifiedDate: string;
  profilePicUrl: string;
  accountType: string;
  isVerifiedActive: boolean;
  recentPostCountChecked?: number | null;
  avgLikes?: number | null;
  avgComments?: number | null;
  contentStyle?: string | null;
  previousBrandCollabs?: string | null;
  language?: string[];
  sourceFound?: string | null;
  notes?: string | null;
}

export function inputToDbData(input: CreatorInput) {
  return {
    instagramHandle: input.instagramHandle.replace(/^@/, ""),
    fullName: input.fullName,
    city: input.city,
    area: input.area,
    nicheTags: toJsonArray(input.nicheTags),
    followerCount: input.followerCount,
    avgEngagementRate: input.avgEngagementRate,
    estimatedRateMin: input.estimatedRateMin,
    estimatedRateMax: input.estimatedRateMax,
    contactMethod: input.contactMethod,
    contactValue: input.contactValue,
    lastVerifiedDate: new Date(input.lastVerifiedDate),
    profilePicUrl: input.profilePicUrl,
    accountType: input.accountType,
    isVerifiedActive: input.isVerifiedActive,
    recentPostCountChecked: input.recentPostCountChecked ?? null,
    avgLikes: input.avgLikes ?? null,
    avgComments: input.avgComments ?? null,
    contentStyle: input.contentStyle ?? null,
    previousBrandCollabs: input.previousBrandCollabs ?? null,
    language: input.language?.length ? toJsonArray(input.language) : null,
    sourceFound: input.sourceFound ?? null,
    notes: input.notes ?? null,
  };
}
