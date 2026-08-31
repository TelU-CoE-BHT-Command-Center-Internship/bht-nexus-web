import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-elements.module.css";

type NexusWorkspaceButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: "danger" | "primary" | "secondary";
};

type NexusWorkspaceBackLinkProps = {
  href: string;
  label: string;
};

type NexusWorkspaceCardProps = {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  title?: string;
};

type NexusWorkspaceFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  hint?: string;
  label: string;
};

type NexusWorkspaceLinkButtonProps = {
  children: ReactNode;
  className?: string;
  href: string;
  tone?: "primary" | "secondary";
};

type NexusWorkspaceNoticeProps = {
  children: ReactNode;
  tone?: "danger" | "info" | "success";
};

type NexusWorkspaceEmptyStateProps = {
  description: string;
  onResetFilters?: () => void;
  title: string;
};

type NexusWorkspaceResultMetaProps = {
  isUpdating?: boolean;
  onResetFilters?: () => void;
  resultLabel: string;
  updatingLabel?: string;
};

function ArrowBackIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M19 12H5M10 7l-5 5 5 5" />
    </svg>
  );
}

export function NexusWorkspaceBackLink({
  href,
  label,
}: NexusWorkspaceBackLinkProps) {
  return (
    <Link className={styles.backLink} href={href} prefetch={false}>
      <ArrowBackIcon />
      <span>{label}</span>
    </Link>
  );
}

export function NexusWorkspaceButton({
  children,
  className,
  tone = "secondary",
  ...props
}: NexusWorkspaceButtonProps) {
  return (
    <button
      className={`${styles.button} ${className ?? ""}`}
      data-tone={tone}
      {...props}
    >
      {children}
    </button>
  );
}

export function NexusWorkspaceCard({
  actions,
  children,
  description,
  title,
}: NexusWorkspaceCardProps) {
  return (
    <section className={styles.card}>
      {title || description || actions ? (
        <header className={styles.cardHeader}>
          <div>
            {title ? <h3>{title}</h3> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className={styles.cardActions}>{actions}</div> : null}
        </header>
      ) : null}
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

export function NexusWorkspaceField({
  hint,
  id,
  label,
  ...props
}: NexusWorkspaceFieldProps) {
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <input id={id} {...props} />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function NexusWorkspaceLinkButton({
  children,
  className,
  href,
  tone = "secondary",
}: NexusWorkspaceLinkButtonProps) {
  return (
    <Link
      className={`${styles.button} ${className ?? ""}`}
      data-tone={tone}
      href={href}
      prefetch={false}
    >
      {children}
    </Link>
  );
}

export function NexusWorkspaceNotice({
  children,
  tone = "info",
}: NexusWorkspaceNoticeProps) {
  return (
    <p aria-live="polite" className={styles.notice} data-tone={tone}>
      {children}
    </p>
  );
}

/**
 * Baris jumlah hasil dan tombol atur ulang filter. Dipakai bersama oleh setiap
 * ruang kerja yang menampilkan daftar hasil pencarian.
 */
export function NexusWorkspaceResultMeta({
  isUpdating = false,
  onResetFilters,
  resultLabel,
  updatingLabel = "Memperbarui hasil",
}: NexusWorkspaceResultMetaProps) {
  return (
    <div aria-live="polite" className={styles.resultMeta}>
      <p>{isUpdating ? updatingLabel : resultLabel}</p>
      {onResetFilters ? (
        <button onClick={onResetFilters} type="button">
          Atur ulang filter
        </button>
      ) : null}
    </div>
  );
}

/** Keadaan kosong untuk tabel ruang kerja. */
export function NexusWorkspaceEmptyState({
  description,
  onResetFilters,
  title,
}: NexusWorkspaceEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <strong>{title}</strong>
      <p>{description}</p>
      {onResetFilters ? (
        <NexusWorkspaceButton onClick={onResetFilters} type="button">
          Atur ulang filter
        </NexusWorkspaceButton>
      ) : null}
    </div>
  );
}

export { styles as nexusWorkspaceElementStyles };
