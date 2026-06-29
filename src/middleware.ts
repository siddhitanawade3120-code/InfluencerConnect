import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, USER_COOKIE } from "@/lib/auth-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(USER_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionToken(token);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }

  if (pathname.startsWith("/dashboard/inquiries")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard/brand") && session.role !== "BRAND") {
    return NextResponse.redirect(new URL("/dashboard/creator", request.url));
  }

  if (pathname.startsWith("/dashboard/creator") && session.role !== "CREATOR") {
    return NextResponse.redirect(new URL("/dashboard/brand", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
