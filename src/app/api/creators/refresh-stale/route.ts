import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
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
  const isAdmin = await isAdminAuthenticated();
  const isCron = isCronAuthorized(request);

  if (!isAdmin && !isCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const requestedLimit =
      typeof body.limit === "number" ? body.limit : parseInt(String(body.limit ?? ""), 10);

    const limit = Number.isFinite(requestedLimit) ? Math.min(requestedLimit, 50) : 10;
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
