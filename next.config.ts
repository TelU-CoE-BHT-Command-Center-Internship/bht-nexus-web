import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: "standalone",
  // Bila API_PROXY_TARGET diisi, /api/* diteruskan ke server itu sehingga
  // browser hanya berbicara dengan alamat web dan cookie sesi berada di sana.
  async rewrites() {
    return apiProxyTarget
      ? [
          {
            source: "/api/:path*",
            destination: `${apiProxyTarget}/api/:path*`,
          },
        ]
      : [];
  },
};

export default nextConfig;
