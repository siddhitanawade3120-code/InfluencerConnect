import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  canRunAutoRefresh,
  getStaleDays,
  refreshStaleCreators,
} from "@/lib/creator-refresh";

function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminAuthenticated();
    const isCron = isCronAuthorized(request);

    if (!isAdmin && !isCron) {
      if (!canRunAutoRefresh()) {
        return NextResponse.json({
          refreshed: 0,
          failed: 0,
          skipped: 0,
          total: 0,
          handles: [],
          errors: [],
          message: "Auto-refresh cooldown active",
        });
      }
    }

    const body = await request.json().catch(() => ({}));
    const requestedLimit =
      typeof body.limit === "number" ? body.limit : parseInt(String(body.limit ?? ""), 10);

    let limit = 3;
    if (isAdmin || isCron) {
      limit = Number.isFinite(requestedLimit) ? Math.min(requestedLimit, 50) : 10;
    } else {
      limit = Number.isFinite(requestedLimit) ? Math.min(requestedLimit, 3) : 3;
    }

    const activeOnly = body.activeOnly !== false;
    const summary = await refreshStaleCreators({ limit, activeOnly });

    return NextResponse.json({
      ...summary,
      staleAfterDays: getStaleDays(),
      message:
        summary.refreshed > 0
          ? `Refreshed ${summary.refreshed} creator(s) from Instagram`
          : summary.failed > 0
            ? "Refresh attempted but failed"
            : "All creators are up to date",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    console.error("POST /api/creators/refresh-stale:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
