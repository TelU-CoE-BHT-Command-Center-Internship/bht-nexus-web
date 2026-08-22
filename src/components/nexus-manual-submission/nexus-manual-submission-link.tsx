import styles from "@/components/nexus-manual-submission/nexus-manual-submission.module.css";
import type { ManualSubmissionDomain } from "@/components/nexus-manual-submission/nexus-manual-submission-model";
import { manualSubmissionRoutes } from "@/components/nexus-manual-submission/nexus-manual-submission-routes";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";

function PlusIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

export function NexusManualSubmissionLink({
  domain,
  label,
}: {
  domain: ManualSubmissionDomain;
  label: string;
}) {
  return (
    <NexusWorkspaceLinkButton
      href={manualSubmissionRoutes[domain].formHref}
      tone="primary"
    >
      <span className={styles.triggerIcon}>
        <PlusIcon />
      </span>
      {label}
    </NexusWorkspaceLinkButton>
  );
}
