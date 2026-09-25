import { type NextRequest, NextResponse } from "next/server";
import { nexusApiPathIsForwarded } from "@/components/nexus-api/nexus-api-routes";
import {
  NEXUS_REQUEST_PATH_HEADER,
  nexusSessionCookieNames,
  nexusSignInPathForReturn,
  nexusWorkspacePathIsProtected,
} from "@/components/nexus-session/nexus-session-routes";

/**
 * Peramban selalu berbicara dengan asal ruang kerja yang sama. Permintaan
 * `/api/*` yang memang dipakai ruang kerja diteruskan ke layanan BHT Nexus
 * sehingga cookie sesi dan CSRF tetap milik asal ini, tidak bergantung pada
 * cookie pihak ketiga, dan alamat layanan tidak pernah dikirim ke peramban.
 */
function forwardApiRequest(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!nexusApiPathIsForwarded(pathname)) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Alamat layanan tidak ditemukan." },
      { status: 404 },
    );
  }

  const apiOrigin = process.env.BHT_NEXUS_API_ORIGIN;
  if (!apiOrigin) {
    return NextResponse.json(
      {
        code: "SERVICE_NOT_CONFIGURED",
        message: "Layanan BHT Nexus belum dikonfigurasi.",
      },
      { status: 503 },
    );
  }

  return NextResponse.rewrite(new URL(`${pathname}${search}`, apiOrigin));
}

/**
 * Pemeriksaan optimistis: tanpa cookie sesi, ruang kerja langsung diarahkan ke
 * halaman masuk beserta alamat tujuan. Keabsahan sesi tetap diperiksa pada
 * layout ruang kerja terhadap layanan server.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return forwardApiRequest(request);
  }

  if (!nexusWorkspacePathIsProtected(pathname)) {
    return NextResponse.next();
  }

  const hasSessionCookie = nexusSessionCookieNames.some((name) =>
    Boolean(request.cookies.get(name)?.value),
  );
  if (hasSessionCookie) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(NEXUS_REQUEST_PATH_HEADER, `${pathname}${search}`);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.redirect(
    new URL(nexusSignInPathForReturn(`${pathname}${search}`), request.url),
  );
}

export const config = {
  matcher: ["/api/:path*", "/nexus/:path*", "/en/nexus/:path*"],
};
