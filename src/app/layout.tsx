import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BHT-Nexus",
  description: "Dashboard, pengelolaan informasi, dan layanan digital CoE BHT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
