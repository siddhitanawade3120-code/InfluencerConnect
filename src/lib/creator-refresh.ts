import {
  scrapeInstagramProfile,
  scrapedToCreatorInput,
} from "@/lib/instagram-scraper";
import { inputToDbData, parseJsonArray } from "@/lib/creator-mapper";
import {
  withMongo,
  docToCreator,
  ObjectId,
  isValidObjectId,
  type CreatorDocument,
} from "@/lib/mongodb";

const COLLECTION = "Creator";

export function getStaleDays(): number {
  const raw = process.env.STALE_CREATOR_DAYS?.trim();
  const n = raw ? parseInt(raw, 10) : 1;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function isCreatorStale(lastVerifiedDate: string | Date, days = getStaleDays()): boolean {
  const d = typeof lastVerifiedDate === "string" ? new Date(lastVerifiedDate) : lastVerifiedDate;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d < cutoff;
}

export interface RefreshResult {
  handle: string;
  ok: boolean;
  error?: string;
  creator?: ReturnType<typeof docToCreator>;
}

export async function refreshCreatorFromInstagram(
  handle: string,
  preserve?: Partial<CreatorDocument>
): Promise<RefreshResult> {
  const normalized = handle.replace(/^@/, "").trim().toLowerCase();
  try {
    const scraped = await scrapeInstagramProfile(normalized);
    const creatorData = inputToDbData(
      scrapedToCreatorInput(scraped, {
        city: preserve?.city,
        area: preserve?.area,
        nicheTags: preserve?.nicheTags
          ? parseJsonArray<string>(preserve.nicheTags as string)
          : undefined,
        estimatedRateMin: preserve?.estimatedRateMin,
        estimatedRateMax: preserve?.estimatedRateMax,
        notes: preserve?.notes ?? undefined,
        sourceFound: "auto-refresh",
      })
    );

    const creator = await withMongo(async (db) => {
      const now = new Date();
      const existing = await db.collection<CreatorDocument>(COLLECTION).findOne({
        instagramHandle: creatorData.instagramHandle,
      });

      if (existing) {
        await db.collection(COLLECTION).updateOne(
          { _id: existing._id },
          { $set: { ...creatorData, updatedAt: now } }
        );
        const doc = await db.collection<CreatorDocument>(COLLECTION).findOne({
          _id: existing._id,
        });
        return docToCreator(doc!);
      }

      const result = await db.collection(COLLECTION).insertOne({
        ...creatorData,
        createdAt: now,
        updatedAt: now,
      });
      const doc = await db.collection<CreatorDocument>(COLLECTION).findOne({
        _id: result.insertedId,
      });
      return docToCreator(doc!);
    });

    return { handle: normalized, ok: true, creator };
  } catch (err) {
    return {
      handle: normalized,
      ok: false,
      error: err instanceof Error ? err.message : "Refresh failed",
    };
  }
}

export interface RefreshStaleOptions {
  limit?: number;
  activeOnly?: boolean;
}

export interface RefreshStaleSummary {
  refreshed: number;
  failed: number;
  skipped: number;
  total: number;
  handles: string[];
  errors: { handle: string; error: string }[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let lastAutoRefreshAt = 0;

export function canRunAutoRefresh(minIntervalMs = 60_000): boolean {
  const now = Date.now();
  if (now - lastAutoRefreshAt < minIntervalMs) return false;
  lastAutoRefreshAt = now;
  return true;
}

export async function refreshStaleCreators(
  options: RefreshStaleOptions = {}
): Promise<RefreshStaleSummary> {
  const limit = Math.max(1, options.limit ?? 3);
  const activeOnly = options.activeOnly !== false;

  const filter = activeOnly ? { isVerifiedActive: true } : {};
  const rows = await withMongo((db) =>
    db
      .collection<CreatorDocument>(COLLECTION)
      .find(filter)
      .sort({ lastVerifiedDate: 1 })
      .toArray()
  );

  const stale = rows.filter((r) => isCreatorStale(r.lastVerifiedDate));
  const batch = stale.slice(0, limit);

  const summary: RefreshStaleSummary = {
    refreshed: 0,
    failed: 0,
    skipped: rows.length - stale.length,
    total: batch.length,
    handles: [],
    errors: [],
  };

  for (const doc of batch) {
    const result = await refreshCreatorFromInstagram(doc.instagramHandle, doc);
    if (result.ok) {
      summary.refreshed += 1;
      summary.handles.push(result.handle);
    } else {
      summary.failed += 1;
      summary.errors.push({
        handle: result.handle,
        error: result.error ?? "Unknown error",
      });
    }
  }

  return summary;
}

export interface RefreshAllOptions {
  activeOnly?: boolean;
  delayMs?: number;
}

export async function refreshAllCreators(
  options: RefreshAllOptions = {}
): Promise<RefreshStaleSummary> {
  const activeOnly = options.activeOnly !== false;
  const delayMs = options.delayMs ?? 1500;

  const filter = activeOnly ? { isVerifiedActive: true } : {};
  const rows = await withMongo((db) =>
    db
      .collection<CreatorDocument>(COLLECTION)
      .find(filter)
      .sort({ instagramHandle: 1 })
      .toArray()
  );

  const summary: RefreshStaleSummary = {
    refreshed: 0,
    failed: 0,
    skipped: 0,
    total: rows.length,
    handles: [],
    errors: [],
  };

  for (let i = 0; i < rows.length; i++) {
    if (i > 0 && delayMs > 0) await sleep(delayMs);
    const doc = rows[i];
    const result = await refreshCreatorFromInstagram(doc.instagramHandle, doc);
    if (result.ok) {
      summary.refreshed += 1;
      summary.handles.push(result.handle);
    } else {
      summary.failed += 1;
      summary.errors.push({
        handle: result.handle,
        error: result.error ?? "Unknown error",
      });
    }
  }

  return summary;
}

export async function refreshCreatorById(id: string): Promise<RefreshResult> {
  if (!isValidObjectId(id)) {
    return { handle: id, ok: false, error: "Invalid creator id" };
  }

  const doc = await withMongo((db) =>
    db.collection<CreatorDocument>(COLLECTION).findOne({ _id: new ObjectId(id) })
  );

  if (!doc) {
    return { handle: id, ok: false, error: "Creator not found" };
  }
  return refreshCreatorFromInstagram(doc.instagramHandle, doc);
}
