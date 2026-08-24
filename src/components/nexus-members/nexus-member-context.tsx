import type { ReactNode } from "react";
import styles from "@/components/nexus-members/nexus-member-context.module.css";
import { knownMemberName } from "@/components/nexus-members/nexus-member-identity";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";

type NexusMemberContextProps = {
  action?: ReactNode;
  description?: string;
  label: string;
  memberName: string;
  sourceLabel?: string;
};

function MemberContextIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

export function NexusMemberContext({
  action,
  description,
  label,
  memberName,
  sourceLabel,
}: NexusMemberContextProps) {
  return (
    <section aria-label={label} className={styles.contextCard}>
      <span aria-hidden="true" className={styles.iconWrap}>
        <MemberContextIcon />
      </span>
      <div className={styles.identity}>
        <span className={styles.label}>{label}</span>
        <span className={styles.memberLine}>
          <strong>{memberName}</strong>
          {sourceLabel ? (
            <span className={styles.sourceBadge}>{sourceLabel}</span>
          ) : null}
        </span>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </section>
  );
}

export function NexusMemberContextFilter({
  clearHref,
  memberId,
}: {
  clearHref: string;
  memberId?: string;
}) {
  if (!memberId) return null;

  return (
    <NexusMemberContext
      action={
        <NexusWorkspaceLinkButton href={clearHref}>
          <CloseIcon />
          Hapus filter
        </NexusWorkspaceLinkButton>
      }
      label="Filter anggota aktif"
      memberName={knownMemberName(memberId) ?? "Anggota terpilih"}
    />
  );
}
