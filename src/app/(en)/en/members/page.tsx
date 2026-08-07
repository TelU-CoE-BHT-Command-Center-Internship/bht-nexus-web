import type { Metadata } from "next";
import { MembersPage } from "@/components/members/members-page";

export const metadata: Metadata = {
  title: "Members",
  description:
    "Meet the Head and Management Team of the Center of Excellence Biomedical & Healthcare Technology at Telkom University.",
};

export default function EnglishMembersPage() {
  return <MembersPage locale="en" />;
}
