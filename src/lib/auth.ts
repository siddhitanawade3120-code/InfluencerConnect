import { SignJWT } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { User, BrandProfile, CreatorProfile, UserRole } from "@prisma/client";
import {
  USER_COOKIE,
  verifySessionToken,
  getSessionSecretString,
  type SessionPayload,
} from "@/lib/auth-session";

export { USER_COOKIE, type SessionPayload, type UserRole };
export { verifySessionToken, getSessionSecretString };

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type CurrentUser = User & {
  brandProfile: BrandProfile | null;
  creatorProfile: CreatorProfile | null;
};

function getSessionSecret(): Uint8Array {
  return new TextEncoder().encode(getSessionSecretString());
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSessionSecret());
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      brandProfile: true,
      creatorProfile: true,
    },
  });
}

export function sessionCookieOptions(token: string) {
  return {
    name: USER_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: USER_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeInstagramHandle(handle: string): string {
  return handle.replace(/^@/, "").trim().toLowerCase();
}
