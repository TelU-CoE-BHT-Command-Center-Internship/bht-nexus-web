import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Data Collection",
  description: "Manage public profile collection jobs in BHT Nexus.",
  robots: { follow: false, index: false },
};

export default function CollectionPage() {
  redirect("/en/nexus/coming-soon");
}
