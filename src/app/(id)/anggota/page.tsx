import type { Metadata } from "next";
import { MembersPage } from "@/components/members/members-page";

export const metadata: Metadata = {
  title: "Anggota",
  description:
    "Kenali Ketua dan Tim Pengurus Center of Excellence Biomedical & Healthcare Technology Telkom University.",
};

export default function IndonesianMembersPage() {
  return <MembersPage locale="id" />;
}
