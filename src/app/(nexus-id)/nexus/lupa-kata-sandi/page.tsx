import type { Metadata } from "next";
import { NexusPasswordRecovery } from "@/components/nexus-login/nexus-password-recovery";

export const metadata: Metadata = {
  title: "Atur ulang kata sandi",
  description:
    "Atur ulang kata sandi akun BHT Nexus dengan kode verifikasi email.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IndonesianNexusPasswordRecoveryPage() {
  return <NexusPasswordRecovery locale="id" mode="reset" />;
}
