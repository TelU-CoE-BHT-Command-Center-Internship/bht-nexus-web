import { cookies } from "next/headers";
import type { ApiSession, ApiSessionUser } from "@/lib/api-auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

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

  const body = (await response.json().catch(() => null)) as {
    data?: { session: ApiSession; user: ApiSessionUser };
    success?: boolean;
  } | null;

  if (body === null || body.success !== true || body.data === undefined) {
    return null;
  }

  return body.data;
}
