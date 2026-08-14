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
  href: string;
  tone?: "primary" | "secondary";
};

type NexusWorkspaceNoticeProps = {
  children: ReactNode;
  tone?: "danger" | "info" | "success";
};

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
  href,
  tone = "secondary",
}: NexusWorkspaceLinkButtonProps) {
  return (
    <Link
      className={styles.button}
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

export { styles as nexusWorkspaceElementStyles };
