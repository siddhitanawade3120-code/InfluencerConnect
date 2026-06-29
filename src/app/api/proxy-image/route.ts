import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { isProxiedImageUrl } from "@/lib/proxy-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://www.instagram.com/",
  Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
};

async function fetchViaHttp(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.length < 100) throw new Error("empty response");
  const contentType = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  return { buffer, contentType };
}

function fetchViaCurl(url: string): Promise<Buffer> {
  const curl = process.platform === "win32" ? "curl.exe" : "curl";
  return new Promise((resolve, reject) => {
    execFile(
      curl,
      ["-sL", "--max-time", "12", "-H", `User-Agent: ${HEADERS["User-Agent"]}`, "-H", `Referer: ${HEADERS.Referer}`, url],
      { maxBuffer: 8 * 1024 * 1024 },
      (err, stdout) => {
        if (err) reject(err);
        else resolve(Buffer.from(stdout, "latin1"));
      }
    );
  });
}

async function fetchImage(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  try {
    return await fetchViaHttp(url);
  } catch {
    const buffer = await fetchViaCurl(url);
    if (buffer.length < 100) throw new Error("empty response");
    return { buffer, contentType: "image/jpeg" };
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || !isProxiedImageUrl(url)) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const { buffer, contentType } = await fetchImage(url);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("GET /api/proxy-image:", err);
    return new NextResponse(null, { status: 502 });
  }
}
