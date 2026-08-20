import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Data Reviews",
  description: "Review data candidates before they become official.",
  robots: { follow: false, index: false },
};

export default function ReviewsPage() {
  redirect("/en/nexus/coming-soon");
}
