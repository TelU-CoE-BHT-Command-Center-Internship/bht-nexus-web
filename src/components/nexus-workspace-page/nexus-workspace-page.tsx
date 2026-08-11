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
  title: string;
};

export function WorkspacePageHeader({
  actions,
  description,
  title,
}: WorkspacePageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeaderCopy}>
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
  label?: string;
  title?: string;
};

export function WorkspacePanel({
  action,
  children,
  flush = false,
  id,
  label,
  title,
}: WorkspacePanelProps) {
  return (
    <section
      aria-label={title ? undefined : label}
      aria-labelledby={title ? `${id}-title` : undefined}
      className={styles.panel}
    >
      {title ? (
        <div className={styles.panelHeader}>
          <h3 className={styles.panelHeading} id={`${id}-title`}>
            {title}
          </h3>
          {action}
        </div>
      ) : null}
      <div className={styles.panelBody} data-flush={flush}>
        {children}
      </div>
    </section>
  );
}

type WorkspaceFootnoteProps = {
  children: ReactNode;
};

export function WorkspaceFootnote({ children }: WorkspaceFootnoteProps) {
  return <p className={styles.footnote}>{children}</p>;
}
