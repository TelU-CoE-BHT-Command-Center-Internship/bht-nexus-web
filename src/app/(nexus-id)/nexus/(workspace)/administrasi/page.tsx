import type { Metadata } from "next";
import { NexusAdministration } from "@/components/nexus-administration/nexus-administration";
import { getNexusAdministrationContent } from "@/components/nexus-administration/nexus-administration-content";
import {
  nexusPreviewWorkspaceAccess,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceNoAccess } from "@/components/nexus-workspace-ui/nexus-workspace-state";

export const metadata: Metadata = {
  title: "Administrasi",
  description: "Kelola akun dan akses pengguna BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

type NexusAdministrationPageProps = {
  searchParams: Promise<{
    account?: string | string[];
    inviteMember?: string | string[];
  }>;
};

function firstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NexusAdministrationPage({
  searchParams,
}: NexusAdministrationPageProps) {
  const content = getNexusAdministrationContent();
  const access = nexusPreviewWorkspaceAccess;
  const params = await searchParams;

  if (!nexusWorkspaceCanOpen(access, "administration")) {
    return (
      <NexusWorkspacePage
        description={content.description}
        descriptionId="administration-no-access-description"
        title={content.title}
        titleId="administration-no-access-title"
      >
        <NexusWorkspaceNoAccess
          description="Akun Anda belum memiliki kewenangan untuk meninjau atau mengelola akun pengguna."
          returnHref="/nexus/dashboard"
          returnLabel="Kembali ke Dashboard"
          title="Administrasi tidak tersedia untuk akun Anda"
        />
      </NexusWorkspacePage>
    );
  }

  return (
    <NexusAdministration
      capabilities={access.administrationCapabilities}
      content={content}
      initialAccountId={firstSearchParam(params.account)}
      initialInviteMemberId={firstSearchParam(params.inviteMember)}
    />
  );
}
