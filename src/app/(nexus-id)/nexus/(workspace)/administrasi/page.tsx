import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getNexusAdministrationContent } from "@/components/nexus-administration/nexus-administration-content";
import { NexusAdministrationLive } from "@/components/nexus-administration/nexus-administration-server";
import { nexusFirstAccessibleHref } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import {
  nexusAdministrationHomeHref,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { getNexusWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-session";
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
  const access = await getNexusWorkspaceAccess();
  const params = await searchParams;

  const capabilities = access.administrationCapabilities;
  const administrationHome = nexusAdministrationHomeHref(capabilities);

  /* Akun yang hanya berwenang atas Peran atau catatan penolakan akses
     diarahkan ke permukaan Administrasi yang boleh dibukanya. */
  if (
    nexusWorkspaceCanOpen(access, "administration") &&
    !capabilities.canReadAccounts &&
    administrationHome
  ) {
    redirect(administrationHome);
  }

  if (
    !nexusWorkspaceCanOpen(access, "administration") ||
    !capabilities.canReadAccounts
  ) {
    return (
      <NexusWorkspacePage
        description={content.description}
        descriptionId="administration-no-access-description"
        title={content.title}
        titleId="administration-no-access-title"
      >
        <NexusWorkspaceNoAccess
          description="Akun Anda belum memiliki kewenangan untuk meninjau atau mengelola akun pengguna."
          returnHref={nexusFirstAccessibleHref(access)}
          returnLabel="Kembali ke ruang kerja"
          title="Administrasi tidak tersedia untuk akun Anda"
        />
      </NexusWorkspacePage>
    );
  }

  return (
    <NexusAdministrationLive
      canOpenAudit={capabilities.canReadAudit}
      canOpenMembers={nexusWorkspaceCanOpen(access, "members")}
      canReadMembers={nexusWorkspaceCanOpen(access, "members")}
      capabilities={capabilities}
      content={content}
      hasInitialAccountContext={Object.hasOwn(params, "account")}
      hasInitialInviteMemberContext={Object.hasOwn(params, "inviteMember")}
      initialAccountId={firstSearchParam(params.account)}
      initialInviteMemberId={firstSearchParam(params.inviteMember)}
    />
  );
}
