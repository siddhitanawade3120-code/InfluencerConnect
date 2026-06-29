import { NextResponse } from "next/server";
import { normalizeInstagramHandle } from "@/lib/auth";
import { previewInstagramProfile } from "@/lib/creator-import";

export const runtime = "nodejs";

/** Public preview for creator signup — scrapes Instagram without saving */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const instagramHandle = normalizeInstagramHandle(body.instagramHandle ?? "");
    const city = (body.city ?? "Mumbai").toString();
    const area = (body.area ?? "Vasai-Virar").toString();

    if (!instagramHandle) {
      return NextResponse.json({ error: "Instagram handle is required" }, { status: 400 });
    }

    const result = await previewInstagramProfile(instagramHandle, { city, area });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ preview: result.preview });
  } catch (err) {
    console.error("POST /api/auth/signup/creator/preview:", err);
    return NextResponse.json({ error: "Instagram preview failed" }, { status: 500 });
  }
}
