import type { Metadata } from "next";
import { NexusPasswordRecovery } from "@/components/nexus-login/nexus-password-recovery";

export const metadata: Metadata = {
  title: "Activate account",
  description: "Activate an invited BHT Nexus account by creating a password.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function EnglishNexusActivationPage() {
  return <NexusPasswordRecovery locale="en" mode="activation" />;
}
