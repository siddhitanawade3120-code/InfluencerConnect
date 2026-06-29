import { NextResponse } from "next/server";
import {
  withMongo,
  docToCreator,
  isValidObjectId,
  ObjectId,
  type CreatorDocument,
} from "@/lib/mongodb";
import { inputToDbData, parseJsonArray, type CreatorInput } from "@/lib/creator-mapper";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLLECTION = "Creator";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const doc = await withMongo((db) =>
      db.collection<CreatorDocument>(COLLECTION).findOne({ _id: new ObjectId(id) })
    );

    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(docToCreator(doc));
  } catch (err) {
    console.error("GET /api/creators/[id]:", err);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = (await request.json()) as Partial<CreatorInput>;

    const doc = await withMongo(async (db) => {
      const existing = await db.collection<CreatorDocument>(COLLECTION).findOne({
        _id: new ObjectId(id),
      });

      if (!existing) return null;

      const merged: CreatorInput = {
        instagramHandle: body.instagramHandle ?? existing.instagramHandle,
        fullName: body.fullName ?? existing.fullName,
        city: body.city ?? existing.city,
        area: body.area ?? existing.area,
        nicheTags: body.nicheTags ?? parseJsonArray(existing.nicheTags),
        followerCount: body.followerCount ?? existing.followerCount,
        avgEngagementRate: body.avgEngagementRate ?? existing.avgEngagementRate,
        estimatedRateMin: body.estimatedRateMin ?? existing.estimatedRateMin,
        estimatedRateMax: body.estimatedRateMax ?? existing.estimatedRateMax,
        contactMethod: body.contactMethod ?? existing.contactMethod,
        contactValue: body.contactValue ?? existing.contactValue,
        lastVerifiedDate:
          body.lastVerifiedDate ?? existing.lastVerifiedDate.toISOString().split("T")[0],
        profilePicUrl: body.profilePicUrl ?? existing.profilePicUrl,
        accountType: body.accountType ?? existing.accountType,
        isVerifiedActive: body.isVerifiedActive ?? existing.isVerifiedActive,
        recentPostCountChecked:
          body.recentPostCountChecked !== undefined
            ? body.recentPostCountChecked
            : existing.recentPostCountChecked,
        avgLikes: body.avgLikes !== undefined ? body.avgLikes : existing.avgLikes,
        avgComments:
          body.avgComments !== undefined ? body.avgComments : existing.avgComments,
        contentStyle:
          body.contentStyle !== undefined ? body.contentStyle : existing.contentStyle,
        previousBrandCollabs:
          body.previousBrandCollabs !== undefined
            ? body.previousBrandCollabs
            : existing.previousBrandCollabs,
        language: body.language ?? parseJsonArray<string>(existing.language),
        sourceFound:
          body.sourceFound !== undefined ? body.sourceFound : existing.sourceFound,
        notes: body.notes !== undefined ? body.notes : existing.notes,
      };

      await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...inputToDbData(merged), updatedAt: new Date() } }
      );

      return db.collection<CreatorDocument>(COLLECTION).findOne({ _id: new ObjectId(id) });
    });

    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(docToCreator(doc));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update creator";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const deleted = await withMongo(async (db) => {
      const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    });

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
