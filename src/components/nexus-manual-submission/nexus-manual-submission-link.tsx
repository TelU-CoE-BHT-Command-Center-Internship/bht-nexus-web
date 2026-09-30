import styles from "@/components/nexus-manual-submission/nexus-manual-submission.module.css";
import type { ManualSubmissionDomain } from "@/components/nexus-manual-submission/nexus-manual-submission-model";
import { manualSubmissionRoutes } from "@/components/nexus-manual-submission/nexus-manual-submission-routes";
import { manualSubmissionAvailable } from "@/components/nexus-manual-submission/nexus-manual-submission-server";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
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

/**
 * Tombol menuju formulir pengajuan. Bila pengajuan jenis data ini belum
 * tersedia, atau akun belum dapat mengirim pengajuan, tombolnya tetap tampil
 * dengan penanda "Segera".
 */
export function NexusManualSubmissionLink({
  domain,
  label,
}: {
  domain: ManualSubmissionDomain;
  label: string;
}) {
  const { capabilities } = useNexusReviewSession();

  if (!capabilities.canSubmitRecord || !manualSubmissionAvailable(domain)) {
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
