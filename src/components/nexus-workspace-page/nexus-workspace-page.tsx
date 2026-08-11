import type { ReactNode } from "react";
import styles from "@/components/nexus-workspace-page/nexus-workspace-page.module.css";

type WorkspacePageProps = {
  children: ReactNode;
};

export function WorkspacePage({ children }: WorkspacePageProps) {
  return <div className={styles.page}>{children}</div>;
}

type WorkspacePageHeaderProps = {
  actions?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function WorkspacePageHeader({
  actions,
  description,
  eyebrow,
  title,
}: WorkspacePageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeaderCopy}>
        <p className={styles.pageEyebrow}>{eyebrow}</p>
        <h2 className={styles.pageTitle}>{title}</h2>
        <p className={styles.pageDescription}>{description}</p>
      </div>
      {actions ? <div className={styles.pageActions}>{actions}</div> : null}
    </header>
  );
}

type WorkspacePanelProps = {
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
  id: string;
  subtitle?: string;
  title: string;
};

export function WorkspacePanel({
  action,
  children,
  flush = false,
  id,
  subtitle,
  title,
}: WorkspacePanelProps) {
  return (
    <section aria-labelledby={`${id}-title`} className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelHeading}>
          <h3 id={`${id}-title`}>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className={styles.panelBody} data-flush={flush}>
        {children}
      </div>
    </section>
  );
}

type WorkspaceNoteProps = {
  children: ReactNode;
  tone?: "info" | "warning";
};

export function WorkspaceNote({ children, tone = "info" }: WorkspaceNoteProps) {
  return (
    <p className={styles.note} data-tone={tone}>
      {children}
    </p>
  );
}
