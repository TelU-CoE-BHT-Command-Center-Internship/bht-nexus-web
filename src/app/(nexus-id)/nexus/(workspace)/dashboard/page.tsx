import type { Metadata } from "next";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { NEXUS_CLUSTER_COOKIE } from "@/components/nexus-cluster-scope/nexus-cluster-cookie";
import { NexusDashboardOverview } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview";
import { getNexusDashboardOverviewContent } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-content";
import { loadNexusDashboardLiveContent } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-server";
import { nexusWorkspaceCanOpen } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { getNexusWorkspaceAccess } from "@/components/nexus-dashboard-shell/nexus-workspace-session";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";
import { getServerSession } from "@/lib/api-server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Ruang kerja internal BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function NexusDashboardPage() {
  await connection();
  const session = await getServerSession();
  const access = await getNexusWorkspaceAccess();
  if (!nexusWorkspaceCanOpen(access, "dashboard"))
    return (
      <NexusWorkspaceState
        title="Dashboard tidak tersedia untuk akun ini"
        description="Hubungi pengelola akun jika Anda memerlukan akses ke ringkasan dashboard."
        eyebrow="Akses dibatasi"
      />
    );
  const viewerName =
    session.kind === "authenticated" ? session.user.name : "Pengguna";
  const preference = (await cookies()).get(NEXUS_CLUSTER_COOKIE)?.value;
  const divisionPublicId =
    session.kind === "authenticated" &&
    session.dataScope?.kind === "all" &&
    preference &&
    /^[0-9a-f-]{36}$/i.test(preference)
      ? preference
      : undefined;
  const live = await loadNexusDashboardLiveContent(divisionPublicId);
  const content = getNexusDashboardOverviewContent(
    viewerName,
    new Date(),
    live,
  );

  return <NexusDashboardOverview content={content} />;
}
