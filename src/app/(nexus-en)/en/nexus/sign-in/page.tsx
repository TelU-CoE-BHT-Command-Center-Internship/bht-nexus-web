import type { Metadata } from "next";
import { NexusLogin } from "@/components/nexus-login/nexus-login";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the internal BHT Nexus digital workspace.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function EnglishNexusLoginPage() {
  return <NexusLogin locale="en" />;
}
