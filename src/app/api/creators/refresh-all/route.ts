import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { refreshAllCreators } from "@/lib/creator-refresh";

/** Admin: re-scrape ALL creators from Instagram (followers, engagement, etc.) */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const activeOnly = body.activeOnly !== false;
    const summary = await refreshAllCreators({ activeOnly });

    const message =
      summary.total === 0
        ? "No creators to refresh"
        : summary.failed === 0
          ? `All ${summary.refreshed} creator(s) updated from Instagram`
          : `Updated ${summary.refreshed}/${summary.total} from Instagram (${summary.failed} failed)`;

    return NextResponse.json({ ...summary, message });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    console.error("POST /api/creators/refresh-all:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
