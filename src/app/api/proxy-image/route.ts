import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { isProxiedImageUrl } from "@/lib/proxy-image";

function fetchViaCurl(url: string): Promise<Buffer> {
  const curl = process.platform === "win32" ? "curl.exe" : "curl";
  return new Promise((resolve, reject) => {
    execFile(
      curl,
      [
        "-sL",
        "--max-time",
        "12",
        "-H",
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "-H",
        "Referer: https://www.instagram.com/",
        url,
      ],
      { maxBuffer: 8 * 1024 * 1024 },
      (err, stdout) => {
        if (err) reject(err);
        else resolve(Buffer.from(stdout, "latin1"));
      }
    );
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || !isProxiedImageUrl(url)) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const buffer = await fetchViaCurl(url);
    if (buffer.length < 100) throw new Error("empty");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
