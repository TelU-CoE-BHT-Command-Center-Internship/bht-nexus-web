import type { Metadata } from "next";
import { NexusUserAccess } from "@/components/nexus-access-policy/nexus-user-access";
import {
  nexusPreviewWorkspaceAccess,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceNoAccess } from "@/components/nexus-workspace-ui/nexus-workspace-state";

export const metadata: Metadata = {
  title: "Akses Khusus Pengguna",
  description:
    "Sesuaikan hak akses satu akun terhadap hak akses bawaan perannya.",
  robots: {
    follow: false,
    index: false,
  },
};

type NexusUserAccessPageProps = {
  searchParams: Promise<{ account?: string | string[] }>;
};

const PAGE_DESCRIPTION =
  "Sesuaikan hak akses satu akun terhadap hak akses bawaan perannya.";

export default async function NexusUserAccessPage({
  searchParams,
}: NexusUserAccessPageProps) {
  const access = nexusPreviewWorkspaceAccess;
  const params = await searchParams;
  const account = Array.isArray(params.account)
    ? params.account[0]
    : params.account;

  if (
    !nexusWorkspaceCanOpen(access, "administration") ||
    !access.administrationCapabilities.canManageUserOverrides
  ) {
    return (
      <NexusWorkspacePage
        description={PAGE_DESCRIPTION}
        descriptionId="user-access-no-access-description"
        title="Akses Khusus Pengguna"
        titleId="user-access-no-access-title"
      >
        <NexusWorkspaceNoAccess
          description="Akun Anda belum memiliki kewenangan untuk meninjau atau menyetel akses khusus pengguna."
          returnHref="/nexus/administrasi"
          returnLabel="Kembali ke Administrasi"
          title="Akses Khusus Pengguna tidak tersedia untuk akun Anda"
        />
      </NexusWorkspacePage>
    );
  }

  return (
    <NexusUserAccess
      capabilities={access.administrationCapabilities}
      initialAccountId={account}
    />
  );
}
