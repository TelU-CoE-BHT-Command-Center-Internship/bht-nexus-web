import type { Metadata, Viewport } from "next";
import { inter } from "@/app/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "BHT Nexus",
    template: "%s | BHT Nexus",
  },
  description:
    "The internal digital workspace for CoE Biomedical & Healthcare Technology.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function EnglishNexusLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={inter.variable} lang="en">
      <body>{children}</body>
    </html>
  );
}
