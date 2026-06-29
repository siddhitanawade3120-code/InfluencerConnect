import { NextResponse } from "next/server";
import {
  withMongo,
  docToCreator,
  type CreatorDocument,
} from "@/lib/mongodb";
import { inputToDbData, type CreatorInput } from "@/lib/creator-mapper";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { dbToCreator } from "@/lib/creator-mapper";
import {
  buildPrismaCreatorWhere,
  parseCreatorListQuery,
} from "@/lib/creator-query";
import { sortCreatorsByMatchScore } from "@/lib/match-score";
import {
  canBrowseCreatorDirectory,
  redactCreatorContact,
  shouldShowCreatorContact,
} from "@/lib/marketplace-access";
import { getRegisteredCreatorIds } from "@/lib/creator-registry";
import { cacheThrough } from "@/lib/cache";
import type { Creator } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLLECTION = "Creator";
const LIST_CACHE_TTL = 30_000;

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!canBrowseCreatorDirectory(user)) {
      return NextResponse.json(
        { error: "Creator search is only available to brand accounts" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listQuery = parseCreatorListQuery(searchParams);
    const cacheKey = `${user?.id ?? "guest"}:${searchParams.toString()}`;

    const creators = await cacheThrough(
      "creator-list",
      cacheKey,
      LIST_CACHE_TTL,
      async () => {
        const registeredIds = await getRegisteredCreatorIds();
        if (registeredIds.length === 0) return [] as Creator[];

        const where = buildPrismaCreatorWhere(listQuery, registeredIds);
        const rows = await prisma.creator.findMany({ where });

        let list = rows.map(dbToCreator);
        const brandProfile = user?.role === "BRAND" ? user.brandProfile : null;

        if (brandProfile) {
          list = sortCreatorsByMatchScore(list, {
            brandBudgetMin: brandProfile.budgetMin,
            brandBudgetMax: brandProfile.budgetMax,
          });
        } else {
          list.sort((a, b) => b.followerCount - a.followerCount);
        }

        return list;
      }
    );

    const showContact = shouldShowCreatorContact(user);
    const response = NextResponse.json(
      creators.map((c) => redactCreatorContact(c, showContact))
    );
    response.headers.set("Cache-Control", "private, max-age=15, stale-while-revalidate=30");
    return response;
  } catch (err) {
    console.error("GET /api/creators:", err);
    const message = err instanceof Error ? err.message : "Database connection failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreatorInput;
    const data = inputToDbData(body);
    const now = new Date();

    const doc = await withMongo(async (db) => {
      const result = await db.collection(COLLECTION).insertOne({
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      return db.collection<CreatorDocument>(COLLECTION).findOne({
        _id: result.insertedId,
      });
    });

    if (!doc) {
      return NextResponse.json({ error: "Failed to read saved creator" }, { status: 500 });
    }

    return NextResponse.json(docToCreator(doc), { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create creator";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
