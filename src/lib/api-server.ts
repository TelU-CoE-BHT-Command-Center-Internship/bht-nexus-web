import { cookies } from "next/headers";
import type { ApiSession, ApiSessionUser } from "@/lib/api-auth";

const API_BASE_URL =
  process.env.API_INTERNAL_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3001/api/v1";

export async function getServerSession(): Promise<{
  session: ApiSession;
  user: ApiSessionUser;
} | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  if (cookieHeader === "") {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    cache: "no-store",
    headers: { Cookie: cookieHeader },
  });

  if (!response.ok) {
    return null;
  }

  // /auth/me is a better-auth-mounted route - it returns {session, user}
  // directly, not wrapped in this app's {success, data} envelope.
  const body = (await response.json().catch(() => null)) as {
    session?: ApiSession;
    user?: ApiSessionUser;
  } | null;

  if (body === null || body.session === undefined || body.user === undefined) {
    return null;
  }

  return { session: body.session, user: body.user };
}
