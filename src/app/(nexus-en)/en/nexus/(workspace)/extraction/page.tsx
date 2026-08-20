import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Document Extraction",
  description: "Review candidate fields extracted from BHT Nexus documents.",
  robots: { follow: false, index: false },
};

export default function ExtractionPage() {
  redirect("/en/nexus/coming-soon");
}
