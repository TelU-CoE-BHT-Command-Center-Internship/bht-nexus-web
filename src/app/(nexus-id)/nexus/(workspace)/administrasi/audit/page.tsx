import type { Metadata } from "next";
import { NexusAuditDenials } from "@/components/nexus-audit-denials/nexus-audit-denials";
import { nexusAuditDenialsContent } from "@/components/nexus-audit-denials/nexus-audit-denials-content";
import { nexusFirstAccessibleHref } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusAdministrationHomeHref } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { getNexusWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-session";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceNoAccess } from "@/components/nexus-workspace-ui/nexus-workspace-state";

const AUDIT_HREF = "/nexus/administrasi/audit";

export const metadata: Metadata = {
  title: "Penolakan Akses",
  description: "Statistik penolakan akses BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function NexusAuditDenialsPage() {
  const access = await getNexusWorkspaceAccess();
  const capabilities = access.administrationCapabilities;

  if (!capabilities.canReadAudit) {
    return (
      <NexusWorkspacePage
        description={nexusAuditDenialsContent.description}
        descriptionId="audit-denials-no-access-description"
        title={nexusAuditDenialsContent.title}
        titleId="audit-denials-no-access-title"
      >
        <NexusWorkspaceNoAccess
          description="Akun Anda belum memiliki kewenangan untuk meninjau catatan penolakan akses."
          returnHref={nexusFirstAccessibleHref(access)}
          returnLabel="Kembali ke ruang kerja"
          title="Penolakan Akses tidak tersedia untuk akun Anda"
        />
      </NexusWorkspacePage>
    );
  }

  const administrationHref = nexusAdministrationHomeHref(capabilities);

  return (
    <NexusAuditDenials
      administrationHref={
        administrationHref === AUDIT_HREF ? undefined : administrationHref
      }
    />
  );
}
