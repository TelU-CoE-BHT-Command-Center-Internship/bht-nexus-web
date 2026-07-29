import type { Metadata, Viewport } from "next";
import { inter } from "@/app/fonts";
import { SiteHeader } from "@/components/site-header/site-header";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Center of Excellence Biomedical & Healthcare Technology",
    template: "%s | CoE BHT",
  },
  description:
    "A center for biomedical and healthcare technology research, innovation, education, and collaboration at Telkom University.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={inter.variable} lang="en">
      <body>
        <SiteHeader locale="en" />
        {children}
      </body>
    </html>
  );
}
