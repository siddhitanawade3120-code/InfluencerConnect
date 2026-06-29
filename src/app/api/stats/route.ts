import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheThrough } from "@/lib/cache";
import { getRegisteredCreatorIds } from "@/lib/creator-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATS_TTL = 60_000;

export async function GET() {
  try {
    const stats = await cacheThrough("marketplace-stats", "public", STATS_TTL, async () => {
      const [registeredCount, brandCount, inquiryCount] = await Promise.all([
        getRegisteredCreatorIds().then((ids) => ids.length),
        prisma.user.count({ where: { role: "BRAND" } }),
        prisma.inquiry.count({
          where: { status: { in: ["PENDING", "NEGOTIATING", "CONFIRMED"] } },
        }),
      ]);

      return {
        registeredCreators: registeredCount,
        brands: brandCount,
        activeDeals: inquiryCount,
      };
    });

    const response = NextResponse.json(stats);
    response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    return response;
  } catch (err) {
    console.error("GET /api/stats:", err);
    return NextResponse.json(
      { registeredCreators: 0, brands: 0, activeDeals: 0 },
      { status: 200 }
    );
  }
}
