import { timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getSessionSecretString } from "@/lib/auth-session";

export const COOKIE_NAME = "admin_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getAdminSigningSecret(): Uint8Array {
  return new TextEncoder().encode(`${getSessionSecretString()}:admin`);
}

/** Returns null in production when ADMIN_PASSWORD is missing or still the default. */
export function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim() ?? "";
  if (!password) {
    return process.env.NODE_ENV === "production" ? null : "changeme";
  }
  if (process.env.NODE_ENV === "production" && password === "changeme") {
    return null;
  }
  return password;
}

function passwordsMatch(input: string, expected: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyAdminPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  return passwordsMatch(input, expected);
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE}s`)
    .sign(getAdminSigningSecret());
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getAdminSigningSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminSessionToken(token);
}

export function adminSessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  };
}
