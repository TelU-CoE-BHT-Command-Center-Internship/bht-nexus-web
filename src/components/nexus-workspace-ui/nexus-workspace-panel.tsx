import type { ReactNode } from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-page.module.css";

type NexusWorkspaceStackProps = {
  children: ReactNode;
};

/** Vertical rhythm for pages that stack several panels. */
export function NexusWorkspaceStack({ children }: NexusWorkspaceStackProps) {
  return <div className={styles.stack}>{children}</div>;
}

type NexusWorkspacePanelProps = {
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
  id: string;
  label?: string;
  title?: string;
};

/**
 * Bordered panel with an optional heading. Without `title` the panel renders
 * headless and takes its accessible name from `label`.
 */
export function NexusWorkspacePanel({
  action,
  children,
  flush = false,
  id,
  label,
  title,
}: NexusWorkspacePanelProps) {
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

type NexusWorkspaceFootnoteProps = {
  children: ReactNode;
};

export function NexusWorkspaceFootnote({
  children,
}: NexusWorkspaceFootnoteProps) {
  return <p className={styles.footnote}>{children}</p>;
}
