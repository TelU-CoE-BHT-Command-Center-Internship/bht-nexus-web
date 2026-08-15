import type { Metadata } from "next";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";

export const metadata: Metadata = {
  title: "Data Reviews",
  description: "Review data candidates before they become official.",
  robots: { follow: false, index: false },
};

export default function ReviewsPage() {
  return (
    <NexusWorkspacePage
      description="The unified Audit KM review workflow is currently available in Indonesian only."
      descriptionId="reviews-language-description"
      title="Data Reviews"
      titleId="reviews-language-title"
    >
      <NexusWorkspaceState
        actions={
          <NexusWorkspaceLinkButton href="/nexus/tinjauan" tone="primary">
            Open Indonesian Reviews
          </NexusWorkspaceLinkButton>
        }
        description="The previous English review screen is not presented as a translation because it uses a different workflow. English parity will be exposed after the same review contract is available."
        eyebrow="Language availability"
        title="This language version is not available yet"
      />
    </NexusWorkspacePage>
  );
}
