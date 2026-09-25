import type { Metadata } from "next";
import { NexusPasswordRecovery } from "@/components/nexus-login/nexus-password-recovery";

export const metadata: Metadata = {
  title: "Aktifkan akun",
  description:
    "Aktifkan akun BHT Nexus dari undangan dengan membuat kata sandi.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IndonesianNexusActivationPage() {
  return <NexusPasswordRecovery locale="id" mode="activation" />;
}
