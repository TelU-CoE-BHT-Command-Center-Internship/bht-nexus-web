import type { ReactNode } from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-page.module.css";

export type NexusWorkspaceMetric = {
  icon: ReactNode;
  id: string;
  label: string;
  tone: "completed" | "needs-fix" | "waiting";
  unit: string;
  value: number;
};

type NexusWorkspacePageProps = {
  children: ReactNode;
  description: string;
  descriptionId: string;
  meta?: string;
  title: string;
  titleId: string;
};

type NexusWorkspaceMetricsProps = {
  metrics: readonly NexusWorkspaceMetric[];
};

export function NexusWorkspacePage({
  children,
  description,
  descriptionId,
  meta,
  title,
  titleId,
}: NexusWorkspacePageProps) {
  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className={styles.page}
    >
      <header className={styles.header}>
        <div>
          <h2 id={titleId}>{title}</h2>
          <p id={descriptionId}>{description}</p>
        </div>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
      </header>
      {children}
    </section>
  );
}

export function NexusWorkspaceMetrics({ metrics }: NexusWorkspaceMetricsProps) {
  return (
    <div className={styles.summaryGrid}>
      {metrics.map((metric) => (
        <article
          aria-label={`${metric.label}: ${metric.value} ${metric.unit}`}
          className={styles.summaryCard}
          data-tone={metric.tone}
          key={metric.id}
        >
          <span aria-hidden="true" className={styles.iconWrap}>
            {metric.icon}
          </span>
          <div className={styles.cardCopy}>
            <h3>{metric.label}</h3>
            <p>
              <strong>{metric.value}</strong>
              <span>{metric.unit}</span>
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
