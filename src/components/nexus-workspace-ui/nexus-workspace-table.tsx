import type { ReactNode } from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-table.module.css";

type NexusWorkspaceTableSectionProps = {
  children: ReactNode;
  guidance: string;
  summary: ReactNode;
  title: string;
  titleId: string;
};

export function NexusWorkspaceTableSection({
  children,
  guidance,
  summary,
  title,
  titleId,
}: NexusWorkspaceTableSectionProps) {
  return (
    <section aria-labelledby={titleId} className={styles.section}>
      <header className={styles.header}>
        <div>
          <h3 id={titleId}>{title}</h3>
          <p>{summary}</p>
        </div>
        <p className={styles.guidance}>{guidance}</p>
      </header>

      <div className={styles.shell}>{children}</div>
    </section>
  );
}
