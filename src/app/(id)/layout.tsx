import type { Metadata, Viewport } from "next";
import { inter } from "@/app/fonts";
import { SiteHeader } from "@/components/site-header/site-header";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "CoE Biomedical & Healthcare Technology",
    template: "%s | CoE BHT",
  },
  description:
    "Pusat riset, inovasi, pendidikan, dan kolaborasi Biomedical & Healthcare Technology di Telkom University.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function IndonesianLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={inter.variable} lang="id">
      <body>
        <SiteHeader locale="id" />
        {children}
      </body>
    </html>
  );
}
