import type { Metadata } from "next";
import { NexusAuditDenials } from "@/components/nexus-audit-denials/nexus-audit-denials";

export const metadata: Metadata = {
  title: "Penolakan Akses",
  description: "Statistik penolakan akses BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function NexusAuditDenialsPage() {
  return <NexusAuditDenials />;
}
