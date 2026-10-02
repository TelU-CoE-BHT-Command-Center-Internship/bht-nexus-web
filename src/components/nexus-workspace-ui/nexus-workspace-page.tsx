import type { ReactNode } from "react";
import { NexusClusterFilterBar } from "@/components/nexus-cluster-scope/nexus-cluster-filter-bar";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-page.module.css";

export type NexusWorkspaceMetric = {
  icon: ReactNode;
  id: string;
  label: string;
  tone: "completed" | "needs-fix" | "waiting";
  unit: string;
  /** `null` selama angka masih dimuat. */
  value: number | null;
};

type NexusWorkspacePageProps = {
  actions?: ReactNode;
  children: ReactNode;
  clusterScope?: boolean;
  description: string;
  descriptionId: string;
  meta?: string;
  title: string;
  titleId: string;
};

type NexusWorkspaceMetricsProps = {
  metrics: readonly NexusWorkspaceMetric[];
  /** Data sumber gagal dimuat: angka ditampilkan kosong, bukan nol. */
  unavailable?: boolean;
};

export function NexusWorkspacePage({
  actions,
  children,
  clusterScope = false,
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
        {actions ? <div className={styles.actions}>{actions}</div> : null}
        {meta ? <span className={styles.meta}>{meta}</span> : null}
      </header>
      {clusterScope ? <NexusClusterFilterBar /> : null}
      {children}
    </section>
  );
}

export function NexusWorkspaceMetrics({
  metrics,
  unavailable = false,
}: NexusWorkspaceMetricsProps) {
  return (
    <div className={styles.summaryGrid}>
      {metrics.map((metric) => (
        <article
          aria-busy={(!unavailable && metric.value === null) || undefined}
          aria-label={
            unavailable
              ? `${metric.label}: belum tersedia`
              : metric.value === null
                ? `${metric.label}: sedang dimuat`
                : `${metric.label}: ${metric.value} ${metric.unit}`
          }
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
              <strong>{unavailable ? "–" : (metric.value ?? "–")}</strong>
              <span>{metric.unit}</span>
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
