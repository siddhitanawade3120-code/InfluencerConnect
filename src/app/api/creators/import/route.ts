import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { scrapeInstagramProfile, scrapedToCreatorInput } from "@/lib/instagram-scraper";
import { refreshCreatorFromInstagram } from "@/lib/creator-refresh";
import { getDb, docToCreator, type CreatorDocument } from "@/lib/mongodb";
import { inputToDbData } from "@/lib/creator-mapper";

const COLLECTION = "Creator";

/** Scrape Instagram by username and save to database */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const username = (body.username ?? body.instagramHandle ?? "").toString();

    const db = await getDb();
    const handle = username.replace(/^@/, "").trim().toLowerCase();
    const existing = await db.collection<CreatorDocument>(COLLECTION).findOne({
      instagramHandle: handle,
    });

    if (existing) {
      const result = await refreshCreatorFromInstagram(handle, {
        city: body.city ?? existing.city,
        area: body.area ?? existing.area,
        nicheTags: body.nicheTags?.length
          ? JSON.stringify(body.nicheTags)
          : existing.nicheTags,
        estimatedRateMin: body.estimatedRateMin ?? existing.estimatedRateMin,
        estimatedRateMax: body.estimatedRateMax ?? existing.estimatedRateMax,
        notes: body.notes ?? existing.notes,
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error ?? "Import failed" }, { status: 400 });
      }

      return NextResponse.json({
        creator: result.creator,
        updated: true,
        message: `@${handle} refreshed from Instagram`,
      });
    }

    const scraped = await scrapeInstagramProfile(username);
    const creatorData = inputToDbData(
      scrapedToCreatorInput(scraped, {
        city: body.city,
        area: body.area,
        nicheTags: body.nicheTags,
        estimatedRateMin: body.estimatedRateMin,
        estimatedRateMax: body.estimatedRateMax,
        notes: body.notes,
        sourceFound: body.sourceFound ?? "scraper-instagram",
      })
    );

    const now = new Date();
    const result = await db.collection(COLLECTION).insertOne({
      ...creatorData,
      createdAt: now,
      updatedAt: now,
    });

    const doc = await db.collection<CreatorDocument>(COLLECTION).findOne({
      _id: result.insertedId,
    });

    return NextResponse.json(
      {
        creator: docToCreator(doc!),
        updated: false,
        message: `@${handle} imported from Instagram`,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    console.error("POST /api/creators/import:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
