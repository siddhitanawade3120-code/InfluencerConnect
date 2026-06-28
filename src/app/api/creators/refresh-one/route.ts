import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { refreshCreatorById } from "@/lib/creator-refresh";

/** Admin: re-scrape one creator by id (used for progress UI during bulk refresh) */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = (body.id ?? "").toString();
    if (!id) {
      return NextResponse.json({ error: "Creator id is required" }, { status: 400 });
    }

    const result = await refreshCreatorById(id);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Refresh failed", handle: result.handle },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      handle: result.handle,
      creator: result.creator,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
