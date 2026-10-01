import type { ReactNode } from "react";
import { NexusWorkspaceLinkButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-state.module.css";

type NexusWorkspaceStateProps = {
  actions?: ReactNode;
  description: string;
  eyebrow: string;
  /** `false` bila keadaan berada di dalam panel yang sudah berbingkai. */
  framed?: boolean;
  title: string;
  tone?: "danger" | "info";
};

function StateIcon({ tone }: { tone: "danger" | "info" }) {
  return tone === "danger" ? (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M12 8v4.5M12 16h.01" />
      <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  ) : (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

/**
 * Keadaan satu halaman atau bagian halaman yang tidak dapat menampilkan isinya:
 * gagal dimuat, tidak ditemukan, belum tersedia, atau akses dibatasi. Tampil
 * sebagai panel selebar konten dengan isi di tengah, sama seperti keadaan
 * kosong pada daftar.
 */
export function NexusWorkspaceState({
  actions,
  description,
  eyebrow,
  framed = true,
  title,
  tone = "info",
}: NexusWorkspaceStateProps) {
  return (
    <section
      aria-live="polite"
      className={styles.state}
      data-framed={framed || undefined}
      data-tone={tone}
      role={tone === "danger" ? "alert" : undefined}
    >
      <span aria-hidden="true" className={styles.icon}>
        <StateIcon tone={tone} />
      </span>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  );
}

export function NexusWorkspaceNoAccess({
  description = "Akun Anda belum memiliki izin untuk membuka data ini. Silakan kembali atau hubungi pengelola jika Anda memerlukan akses.",
  eyebrow = "Akses dibatasi",
  returnHref,
  returnLabel,
  title = "Anda tidak memiliki akses untuk meninjau data ini",
}: {
  description?: string;
  eyebrow?: string;
  returnHref: string;
  returnLabel: string;
  title?: string;
}) {
  return (
    <NexusWorkspaceState
      actions={
        <NexusWorkspaceLinkButton href={returnHref}>
          {returnLabel}
        </NexusWorkspaceLinkButton>
      }
      description={description}
      eyebrow={eyebrow}
      title={title}
      tone="danger"
    />
  );
}
