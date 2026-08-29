import type { Metadata } from "next";
import { NexusRoleManagement } from "@/components/nexus-access-policy/nexus-role-management";
import {
  nexusPreviewWorkspaceAccess,
  nexusWorkspaceCanOpen,
} from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceNoAccess } from "@/components/nexus-workspace-ui/nexus-workspace-state";

export const metadata: Metadata = {
  title: "Peran & Hak Akses",
  description: "Atur hak akses bawaan untuk setiap peran pengguna BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

type NexusRolePageProps = {
  searchParams: Promise<{ role?: string | string[] }>;
};

const PAGE_DESCRIPTION =
  "Atur hak akses bawaan untuk setiap peran pengguna BHT Nexus.";

export default async function NexusRolePage({
  searchParams,
}: NexusRolePageProps) {
  const access = nexusPreviewWorkspaceAccess;
  const params = await searchParams;
  const role = Array.isArray(params.role) ? params.role[0] : params.role;

  if (
    !nexusWorkspaceCanOpen(access, "administration") ||
    !access.administrationCapabilities.canManageRoles
  ) {
    return (
      <NexusWorkspacePage
        description={PAGE_DESCRIPTION}
        descriptionId="role-management-no-access-description"
        title="Peran & Hak Akses"
        titleId="role-management-no-access-title"
      >
        <NexusWorkspaceNoAccess
          description="Akun Anda belum memiliki kewenangan untuk meninjau atau menyetel peran dan hak akses."
          returnHref="/nexus/administrasi"
          returnLabel="Kembali ke Administrasi"
          title="Peran & Hak Akses tidak tersedia untuk akun Anda"
        />
      </NexusWorkspacePage>
    );
  }

  return (
    <NexusRoleManagement
      capabilities={access.administrationCapabilities}
      hasInitialRoleContext={Object.hasOwn(params, "role")}
      initialRoleId={role}
    />
  );
}
