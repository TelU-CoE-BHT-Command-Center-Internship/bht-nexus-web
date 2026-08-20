import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Documents",
  description: "Manage authorised documents in BHT Nexus.",
  robots: { follow: false, index: false },
};

export default function DocumentsPage() {
  redirect("/en/nexus/coming-soon");
}
