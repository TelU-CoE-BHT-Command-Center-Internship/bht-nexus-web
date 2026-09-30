import styles from "@/components/nexus-manual-submission/nexus-manual-submission.module.css";
import type { ManualSubmissionDomain } from "@/components/nexus-manual-submission/nexus-manual-submission-model";
import { manualSubmissionRoutes } from "@/components/nexus-manual-submission/nexus-manual-submission-routes";
import {
  NexusWorkspaceLinkButton,
  NexusWorkspacePlannedButton,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";

function PlusIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

export function NexusManualSubmissionLink({
  available = true,
  domain,
  label,
}: {
  /** Bila pengajuan belum tersedia, tombol tampil dengan penanda "Segera". */
  available?: boolean;
  domain: ManualSubmissionDomain;
  label: string;
}) {
  if (!available) {
    return (
      <NexusWorkspacePlannedButton tone="primary">
        <span className={styles.triggerIcon}>
          <PlusIcon />
        </span>
        {label}
      </NexusWorkspacePlannedButton>
    );
  }

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
