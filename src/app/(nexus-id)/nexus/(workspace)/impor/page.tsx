import type { Metadata } from "next";
import { nexusFirstAccessibleHref } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusWorkspaceCanOpen } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { getNexusWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-session";
import { NexusImport } from "@/components/nexus-import/nexus-import";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceNoAccess } from "@/components/nexus-workspace-ui/nexus-workspace-state";

export const metadata: Metadata = {
  title: "Impor Spreadsheet",
  description:
    "Unggah spreadsheet publikasi, periksa hasilnya, lalu kirim ke Tinjauan.",
  robots: { follow: false, index: false },
};

export default async function NexusImportPage() {
  const access = await getNexusWorkspaceAccess();

  if (!nexusWorkspaceCanOpen(access, "import")) {
    return (
      <NexusWorkspacePage
        description="Impor spreadsheet publikasi."
        descriptionId="import-no-access-description"
        title="Impor Spreadsheet"
        titleId="import-no-access-title"
      >
        <NexusWorkspaceNoAccess
          description="Akun Anda belum memiliki izin untuk membuka Impor Spreadsheet. Silakan kembali ke ruang kerja atau hubungi pengelola jika akses tersebut diperlukan."
          returnHref={nexusFirstAccessibleHref(access)}
          returnLabel="Kembali ke ruang kerja"
          title="Impor Spreadsheet tidak tersedia untuk akun Anda"
        />
      </NexusWorkspacePage>
    );
  }

  return <NexusImport canUpload={access.importCapabilities.canUpload} />;
}
