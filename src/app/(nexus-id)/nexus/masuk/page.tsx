import type { Metadata } from "next";
import { NexusLogin } from "@/components/nexus-login/nexus-login";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke ruang kerja digital internal BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IndonesianNexusLoginPage() {
  return <NexusLogin locale="id" />;
}
