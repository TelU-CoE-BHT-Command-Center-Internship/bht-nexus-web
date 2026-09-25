import type { Metadata } from "next";
import { NexusPasswordRecovery } from "@/components/nexus-login/nexus-password-recovery";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset a BHT Nexus password with an email verification code.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function EnglishNexusPasswordRecoveryPage() {
  return <NexusPasswordRecovery locale="en" mode="reset" />;
}
