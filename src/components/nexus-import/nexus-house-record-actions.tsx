import styles from "@/components/nexus-import/nexus-house-record-actions.module.css";
import { NexusManualSubmissionLink } from "@/components/nexus-manual-submission/nexus-manual-submission-link";
import type { ManualSubmissionDomain } from "@/components/nexus-manual-submission/nexus-manual-submission-model";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";

function SpreadsheetIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <rect height="14" rx="1.6" width="14" x="3" y="3" />
      <path d="M3 7.5h14M3 12h14M8 3v14" />
    </svg>
  );
}

/**
 * Tindakan kepala halaman rumah data: impor Excel untuk banyak rekam sekaligus
 * dan formulir Ajukan untuk satu rekam. Keduanya memakai isian yang sama dan
 * berakhir di Tinjauan; tiap tombol hanya tampil bagi akun yang berhak.
 */
export function NexusHouseRecordActions({
  domain,
  label,
}: {
  domain: ManualSubmissionDomain;
  label: string;
}) {
  const { capabilities } = useNexusReviewSession();

  return (
    <div className={styles.actions}>
      {capabilities.canImport ? (
        <NexusWorkspaceLinkButton
          href={`/nexus/impor?rumah=${encodeURIComponent(domain)}`}
        >
          <span className={styles.icon}>
            <SpreadsheetIcon />
          </span>
          Impor Excel
        </NexusWorkspaceLinkButton>
      ) : null}
      <NexusManualSubmissionLink domain={domain} label={label} />
    </div>
  );
}
