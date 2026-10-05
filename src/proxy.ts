import { type NextRequest, NextResponse } from "next/server";
import { NEXUS_REQUEST_PATH_HEADER } from "@/lib/nexus-request-path";

/**
 * Layout ruang kerja tidak menerima pathname. Header ini membawa halaman yang
 * diminta supaya pengguna yang sesinya berakhir kembali ke halaman yang sama
 * setelah masuk. Pemeriksaan sesi tetap sepenuhnya dilakukan layout.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    NEXUS_REQUEST_PATH_HEADER,
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/nexus/:path*", "/en/nexus/:path*"],
};
