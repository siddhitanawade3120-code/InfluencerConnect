import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  adminSessionCookieOptions,
  COOKIE_NAME,
  createAdminSessionToken,
  getAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!getAdminPassword()) {
    return NextResponse.json(
      { error: "Admin login is not configured. Set ADMIN_PASSWORD on the server." },
      { status: 503 }
    );
  }

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookieOptions(token));

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
