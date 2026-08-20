import type { ReactNode } from "react";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-state.module.css";

type NexusWorkspaceStateProps = {
  actions?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
  tone?: "danger" | "info";
};

export function NexusWorkspaceState({
  actions,
  description,
  eyebrow,
  title,
  tone = "info",
}: NexusWorkspaceStateProps) {
  return (
    <section aria-live="polite" className={styles.state} data-tone={tone}>
      <span aria-hidden="true" className={styles.icon}>
        {tone === "danger" ? "!" : "i"}
      </span>
      <div className={styles.copy}>
        <span>{eyebrow}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  );
}

export function NexusWorkspaceNoAccess({
  returnHref,
  returnLabel,
}: {
  returnHref: string;
  returnLabel: string;
}) {
  return (
    <NexusWorkspaceState
      actions={
        <NexusWorkspaceLinkButton href={returnHref}>
          {returnLabel}
        </NexusWorkspaceLinkButton>
      }
      description="Akun Anda belum memiliki izin untuk membuka data ini. Silakan kembali atau hubungi pengelola jika Anda memerlukan akses."
      eyebrow="Akses dibatasi"
      title="Anda tidak memiliki akses untuk meninjau data ini"
      tone="danger"
    />
  );
}
