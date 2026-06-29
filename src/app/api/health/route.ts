import { NextResponse } from "next/server";
import { hasDatabaseUrl, withMongo } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Quick check: is DATABASE_URL set and can we reach MongoDB? */
export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      {
        ok: false,
        hasDatabaseUrl: false,
        db: false,
        hint: "Add DATABASE_URL in Netlify → Environment variables (scope: All), then Clear cache and redeploy.",
      },
      { status: 503 }
    );
  }

  try {
    const count = await withMongo((db) =>
      db.collection("Creator").countDocuments()
    );
    return NextResponse.json({
      ok: true,
      hasDatabaseUrl: true,
      db: true,
      creators: count,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection failed";
    return NextResponse.json(
      {
        ok: false,
        hasDatabaseUrl: true,
        db: false,
        error: message,
        hint: "MongoDB Atlas → Network Access → 0.0.0.0/0, then redeploy.",
      },
      { status: 503 }
    );
  }
}
