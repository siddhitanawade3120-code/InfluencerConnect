import { jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

export const USER_COOKIE = "user_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function getSessionSecretString(): string {
  return (
    process.env.SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "influconnect-dev-session-secret"
  );
}

function getSessionSecret(): Uint8Array {
  return new TextEncoder().encode(getSessionSecretString());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const userId = payload.sub;
    const email = payload.email;
    const role = payload.role;
    if (typeof userId !== "string" || typeof email !== "string" || typeof role !== "string") {
      return null;
    }
    if (role !== "BRAND" && role !== "CREATOR") return null;
    return { userId, email, role: role as UserRole };
  } catch {
    return null;
  }
}
