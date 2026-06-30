import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, USER_COOKIE } from "@/lib/auth-session";
import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";

const BRAND_ONLY_PATHS = ["/results", "/shortlist"];
const AUTH_PAGES = ["/login", "/signup"];
const ADMIN_API_PREFIX = "/api/creators/";
const ADMIN_ONLY_API_SUFFIXES = [
  "/import",
  "/scrape",
  "/refresh-all",
  "/refresh-one",
  "/refresh-stale",
];

function dashboardForRole(role: "BRAND" | "CREATOR") {
  return role === "BRAND" ? "/dashboard/brand" : "/dashboard/creator";
}

function isAdminOnlyApi(pathname: string, method: string): boolean {
  if (method !== "POST" && method !== "PATCH" && method !== "DELETE") {
    return false;
  }
  if (pathname === "/api/creators" && method === "POST") return true;
  if (!pathname.startsWith(ADMIN_API_PREFIX)) return false;
  if (ADMIN_ONLY_API_SUFFIXES.some((suffix) => pathname.endsWith(suffix))) {
    return true;
  }
  const rest = pathname.slice(ADMIN_API_PREFIX.length);
  if ((method === "PATCH" || method === "DELETE") && rest && !rest.includes("/")) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Admin pages (except login) require a valid signed admin session
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = request.cookies.get(COOKIE_NAME)?.value;
    if (!adminToken || !(await verifyAdminSessionToken(adminToken))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Block admin-only creator APIs without a valid admin session (cron uses Bearer on refresh-stale)
  if (isAdminOnlyApi(pathname, method)) {
    const adminToken = request.cookies.get(COOKIE_NAME)?.value;
    const isAdmin = adminToken ? await verifyAdminSessionToken(adminToken) : false;
    const cronSecret = process.env.CRON_SECRET?.trim();
    const authHeader = request.headers.get("authorization");
    const isCron =
      pathname.endsWith("/refresh-stale") &&
      !!cronSecret &&
      authHeader === `Bearer ${cronSecret}`;

    if (!isAdmin && !isCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const token = request.cookies.get(USER_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

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
    "/admin/:path*",
    "/api/creators",
    "/api/creators/:path*",
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
