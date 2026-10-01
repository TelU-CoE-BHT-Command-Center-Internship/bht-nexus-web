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
  actions?: ReactNode;
  description: string;
  onResetFilters?: () => void;
  title: string;
  /** Bawaan: `search` bila ada filter yang bisa diatur ulang, selain itu `empty`. */
  tone?: "danger" | "empty" | "search";
};

type NexusWorkspaceLoadErrorProps = {
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  title: string;
};

type NexusWorkspaceResultMetaProps = {
  isUpdating?: boolean;
  onResetFilters?: () => void;
  resultLabel: string;
  updatingLabel?: string;
};

function EmptyStateIcon({ tone }: { tone: "danger" | "empty" | "search" }) {
  if (tone === "danger") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M12 8v4.5M12 16h.01" />
        <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    );
  }
  if (tone === "search") {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5M8.5 8.5l4 4M12.5 8.5l-4 4" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M3.5 13.5 6 5.8A2 2 0 0 1 7.9 4.5h8.2A2 2 0 0 1 18 5.8l2.5 7.7" />
      <path d="M3.5 13.5h4.6l1.4 2.5h5l1.4-2.5h4.6V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18Z" />
    </svg>
  );
}

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

/**
 * Tindakan yang sudah dirancang tetapi belum dapat dipakai. Tombol tetap tampil
 * seperti rancangannya, diberi penanda tertulis "Segera", dapat difokus, dan
 * tidak menjalankan apa pun sehingga tidak ada perubahan yang seolah tersimpan.
 *
 * Penanda diletakkan di bawah label (seperti butir navigasi yang belum
 * tersedia), sehingga lebar dan tinggi tombol sama dengan tombol aslinya dan
 * tata letak di sekitarnya tidak bergeser.
 */
export function NexusWorkspacePlannedButton({
  badgeClassName,
  children,
  className,
  description = "Layanan ini akan segera tersedia",
  plannedLabel = "Segera",
  tone = "secondary",
}: {
  /** Untuk tombol yang menyusut menjadi ikon pada layar sempit. */
  badgeClassName?: string;
  children: ReactNode;
  className?: string;
  description?: string;
  plannedLabel?: string;
  tone?: "danger" | "primary" | "secondary";
}) {
  return (
    <button
      aria-disabled="true"
      className={`${styles.button} ${className ?? ""}`}
      data-planned="true"
      data-tone={tone}
      onClick={(event) => event.preventDefault()}
      title={description}
      type="button"
    >
      <span className={styles.plannedContent}>{children}</span>
      <span
        aria-hidden="true"
        className={`${styles.plannedBadge} ${badgeClassName ?? ""}`}
      >
        {plannedLabel}
      </span>
      <span className={styles.visuallyHidden}>. {description}.</span>
    </button>
  );
}

/** Penanda tertulis untuk bagian rancangan yang segera tersedia. */
export function NexusWorkspacePlannedBadge({
  children = "Segera",
}: {
  children?: ReactNode;
}) {
  return <span className={styles.plannedBadge}>{children}</span>;
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

/**
 * Keadaan sebuah daftar yang tidak menampilkan baris: belum ada data, tidak ada
 * yang cocok dengan filter, atau gagal dimuat. Satu tampilan untuk ketiganya,
 * sehingga setiap ruang kerja terasa sama ketika daftarnya kosong.
 */
export function NexusWorkspaceEmptyState({
  actions,
  description,
  onResetFilters,
  title,
  tone = onResetFilters ? "search" : "empty",
}: NexusWorkspaceEmptyStateProps) {
  return (
    <div
      className={styles.emptyState}
      data-tone={tone}
      role={tone === "danger" ? "alert" : "status"}
    >
      <span aria-hidden="true" className={styles.emptyStateIcon}>
        <EmptyStateIcon tone={tone} />
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
      {actions || onResetFilters ? (
        <div className={styles.emptyStateActions}>
          {onResetFilters ? (
            <NexusWorkspaceButton onClick={onResetFilters} type="button">
              Atur ulang filter
            </NexusWorkspaceButton>
          ) : null}
          {actions}
        </div>
      ) : null}
    </div>
  );
}

/** Daftar yang gagal dimuat, dengan tombol untuk mencoba lagi. */
export function NexusWorkspaceLoadError({
  description,
  onRetry,
  retryLabel = "Coba lagi",
  title,
}: NexusWorkspaceLoadErrorProps) {
  return (
    <NexusWorkspaceEmptyState
      actions={
        onRetry ? (
          <NexusWorkspaceButton onClick={onRetry} type="button">
            {retryLabel}
          </NexusWorkspaceButton>
        ) : undefined
      }
      description={description}
      title={title}
      tone="danger"
    />
  );
}

export { styles as nexusWorkspaceElementStyles };
