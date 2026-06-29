import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, USER_COOKIE } from "@/lib/auth-session";

const BRAND_ONLY_PATHS = ["/results", "/shortlist"];
const AUTH_PAGES = ["/login", "/signup"];

function dashboardForRole(role: "BRAND" | "CREATOR") {
  return role === "BRAND" ? "/dashboard/brand" : "/dashboard/creator";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(USER_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // Logged-in users should not see login/signup pages
  if (
    session &&
    (AUTH_PAGES.includes(pathname) || pathname.startsWith("/signup/"))
  ) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const safeRedirect =
      redirectParam?.startsWith("/dashboard") ? redirectParam : null;
    return NextResponse.redirect(
      new URL(safeRedirect ?? dashboardForRole(session.role), request.url)
    );
  }

  // Logged-in creators should not browse the brand discovery flow
  if (session?.role === "CREATOR") {
    if (pathname === "/" || BRAND_ONLY_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard/creator", request.url));
    }
    if (pathname.startsWith("/creators/")) {
      return NextResponse.redirect(new URL("/dashboard/creator", request.url));
    }
  }

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
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
  matcher: [
    "/",
    "/login",
    "/signup",
    "/signup/:path*",
    "/results",
    "/shortlist",
    "/creators/:path*",
    "/dashboard/:path*",
  ],
};
