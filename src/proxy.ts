import { type NextRequest, NextResponse } from "next/server";
import { NEXUS_REQUEST_PATH_HEADER } from "@/lib/nexus-request-path";

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");
const apiProxyHeader = process.env.API_PROXY_REQUEST_HEADER?.split("=", 2);

/**
 * Layout ruang kerja tidak menerima pathname. Header ini membawa halaman yang
 * diminta supaya pengguna yang sesinya berakhir kembali ke halaman yang sama
 * setelah masuk. Pemeriksaan sesi tetap sepenuhnya dilakukan layout.
 *
 * Bila API_PROXY_TARGET diisi, permintaan /api/* diteruskan ke server itu
 * sehingga browser hanya berbicara dengan alamat web dan cookie sesi berada
 * di alamat yang sama.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    if (!apiProxyTarget) return NextResponse.next();
    if (apiProxyHeader?.length === 2) {
      requestHeaders.set(apiProxyHeader[0], apiProxyHeader[1]);
    }
    return NextResponse.rewrite(
      new URL(`${pathname}${search}`, apiProxyTarget),
      { request: { headers: requestHeaders } },
    );
  }

  requestHeaders.set(NEXUS_REQUEST_PATH_HEADER, `${pathname}${search}`);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/api/:path*", "/nexus/:path*", "/en/nexus/:path*"],
};
