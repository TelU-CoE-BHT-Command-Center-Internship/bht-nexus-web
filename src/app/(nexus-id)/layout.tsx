import type { Metadata, Viewport } from "next";
import { inter } from "@/app/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "BHT Nexus",
    template: "%s | BHT Nexus",
  },
  description:
    "Ruang kerja digital internal CoE Biomedical & Healthcare Technology.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function IndonesianNexusLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={inter.variable} data-scroll-behavior="smooth" lang="id">
      <body>{children}</body>
    </html>
  );
}
