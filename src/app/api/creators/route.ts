import { NextResponse } from "next/server";
import {
  getDb,
  docToCreator,
  type CreatorDocument,
} from "@/lib/mongodb";
import { inputToDbData, type CreatorInput } from "@/lib/creator-mapper";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const COLLECTION = "Creator";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const db = await getDb();
    const filter = activeOnly ? { isVerifiedActive: true } : {};
    const rows = await db
      .collection<CreatorDocument>(COLLECTION)
      .find(filter)
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(rows.map(docToCreator));
  } catch (err) {
    console.error("GET /api/creators:", err);
    return NextResponse.json(
      {
        error:
          "Database connection failed. In MongoDB Atlas: resume cluster, add your IP under Network Access (0.0.0.0/0 for dev), then restart the app.",
      },
      { status: 503 }
    );
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

    const db = await getDb();
    const result = await db.collection(COLLECTION).insertOne({
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    const doc = await db.collection<CreatorDocument>(COLLECTION).findOne({
      _id: result.insertedId,
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
