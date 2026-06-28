import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "changeme";
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token === getAdminPassword();
}

export { COOKIE_NAME };
