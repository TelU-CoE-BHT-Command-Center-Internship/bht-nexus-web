import type { Metadata } from "next";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";

export const metadata: Metadata = {
  title: "BHT Nexus in English",
  description:
    "BHT Nexus is currently available in Indonesian. The English version will be available soon.",
  robots: { follow: false, index: false },
};

export default function EnglishWorkspaceComingSoonPage() {
  return (
    <NexusWorkspacePage
      description="BHT Nexus is currently available in Indonesian."
      descriptionId="english-workspace-description"
      title="BHT Nexus in English"
      titleId="english-workspace-title"
    >
      <NexusWorkspaceState
        actions={
          <NexusWorkspaceLinkButton href="/nexus/dashboard" tone="primary">
            Continue in Indonesian
          </NexusWorkspaceLinkButton>
        }
        description="Please continue in Indonesian to access BHT Nexus services and information. Thank you for your patience."
        eyebrow="Coming soon"
        title="The English version will be available soon"
      />
    </NexusWorkspacePage>
  );
}
