import { NextResponse } from "next/server";
import {
  withMongo,
  docToCreator,
  hasDatabaseUrl,
  type CreatorDocument,
} from "@/lib/mongodb";
import { inputToDbData, type CreatorInput } from "@/lib/creator-mapper";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLLECTION = "Creator";

function dbErrorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Database connection failed";
  const hint = !hasDatabaseUrl()
    ? "Add DATABASE_URL in Netlify env vars (scope: All), then Clear cache and redeploy."
    : message.toLowerCase().includes("timed out") ||
        message.toLowerCase().includes("server selection")
      ? "MongoDB Atlas → Network Access → Add IP 0.0.0.0/0 (Allow from anywhere)."
      : "Check DATABASE_URL password and that the Atlas cluster is running.";
  return NextResponse.json(
    { error: message, hasDatabaseUrl: hasDatabaseUrl(), hint },
    { status: 503 }
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";
    const filter = activeOnly ? { isVerifiedActive: true } : {};

    const rows = await withMongo((db) =>
      db
        .collection<CreatorDocument>(COLLECTION)
        .find(filter)
        .sort({ updatedAt: -1 })
        .toArray()
    );

    return NextResponse.json(rows.map(docToCreator));
  } catch (err) {
    console.error("GET /api/creators:", err);
    return dbErrorResponse(err);
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
