import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Document Q&A",
  description: "Ask source-grounded questions in BHT Nexus.",
  robots: { follow: false, index: false },
};

export default function DocumentQuestionsPage() {
  redirect("/en/nexus/coming-soon");
}
