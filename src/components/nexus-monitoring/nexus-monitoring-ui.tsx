import Link from "next/link";
import type { ReactNode } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import { MonitoringNumber } from "@/components/nexus-monitoring/nexus-monitoring-number";
import {
  type NexusWorkspaceIconName,
  NexusWorkspaceIconPaths,
} from "@/components/nexus-workspace-ui/nexus-workspace-icons";

export type MonitoringTone = "danger" | "neutral" | "success" | "waiting";

export function MonitoringIcon({ name }: { name: NexusWorkspaceIconName }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <NexusWorkspaceIconPaths name={name} />
    </svg>
  );
}

export function MonitoringBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: MonitoringTone;
}) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {children}
    </span>
  );
}

type MonitoringCardProps = {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  headingId?: string;
  inlineHeader?: boolean;
  title: string;
};

export function MonitoringCard({
  actions,
  children,
  description,
  headingId,
  inlineHeader = true,
  title,
}: MonitoringCardProps) {
  return (
    <section aria-labelledby={headingId} className={styles.card}>
      <header className={styles.cardHeader} data-inline={inlineHeader}>
        <div className={styles.cardHeading}>
          <h3 id={headingId}>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className={styles.cardActions}>{actions}</div> : null}
      </header>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

type MonitoringMetricCardProps = {
  badge?: { label: string; tone?: MonitoringTone };
  detail?: string;
  fallback?: string;
  icon: NexusWorkspaceIconName;
  label: string;
  tone?: "blue" | "gold" | "green" | "violet";
  unit?: string;
  value: number | null;
  variant?: "default" | "summary";
};

export function MonitoringMetricCard({
  badge,
  detail,
  fallback,
  icon,
  label,
  tone = "blue",
  unit,
  value,
  variant = "default",
}: MonitoringMetricCardProps) {
  return (
    <article
      className={styles.metricCard}
      data-tone={tone}
      data-variant={variant}
    >
      <span className={styles.metricIcon}>
        <MonitoringIcon name={icon} />
      </span>
      <div className={styles.metricFoot}>
        <div className={styles.metricCopy}>
          <span>{label}</span>
          <strong className={styles.metricValue}>
            <MonitoringNumber fallback={fallback} value={value} />
            {unit && value !== null ? <small>{unit}</small> : null}
          </strong>
          {detail ? (
            <span className={styles.metricDetail}>{detail}</span>
          ) : null}
        </div>
        {badge ? (
          <MonitoringBadge tone={badge.tone}>{badge.label}</MonitoringBadge>
        ) : null}
      </div>
    </article>
  );
}

export type MonitoringDistributionItem = {
  detail: string;
  href?: string;
  id: string;
  label: string;
  share: number;
  value: number;
};

export function MonitoringDistributionList({
  items,
  valueLabel,
}: {
  items: readonly MonitoringDistributionItem[];
  valueLabel: (item: MonitoringDistributionItem) => string;
}) {
  return (
    <ul className={styles.distribution}>
      {items.map((item) => (
        <li className={styles.distributionRow} key={item.id}>
          <div className={styles.distributionCopy}>
            <strong>
              {item.href ? (
                <Link href={item.href} prefetch={false}>
                  {item.label}
                </Link>
              ) : (
                item.label
              )}
            </strong>
            <span>{item.detail}</span>
          </div>
          <div className={styles.distributionMeter}>
            <span aria-hidden="true" className={styles.distributionTrack}>
              <span style={{ width: `${Math.round(item.share * 100)}%` }} />
            </span>
            <strong>{valueLabel(item)}</strong>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MonitoringUnavailable({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className={styles.unavailable}>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export type MonitoringValueRow = {
  id: string;
  label: string;
  values: readonly string[];
};

/**
 * Padanan tekstual sebuah grafik. Grafik tidak pernah menjadi satu-satunya
 * cara membaca angka penting, sehingga nilainya selalu dapat dibuka di sini.
 */
export function MonitoringValueTable({
  caption,
  columns,
  rowHeader,
  rows,
  summaryLabel = "Lihat nilainya dalam tabel",
}: {
  caption: string;
  columns: readonly string[];
  rowHeader: string;
  rows: readonly MonitoringValueRow[];
  summaryLabel?: string;
}) {
  return (
    <details className={styles.valueDisclosure}>
      <summary>{summaryLabel}</summary>
      <div>
        <table className={styles.valueTable}>
          <caption>{caption}</caption>
          <thead>
            <tr>
              <th scope="col">{rowHeader}</th>
              {columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                {row.values.map((value, index) => (
                  <td key={`${row.id}-${columns[index] ?? index}`}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/**
 * Bingkai grafik. Grafiknya diumumkan sebagai satu gambar bernama supaya
 * pembaca layar tidak menyusuri label sumbu satu per satu; nilai persisnya
 * tetap tersedia pada tabel di bawah grafik.
 */
export function MonitoringChartFrame({
  children,
  fluid = false,
  label,
  wide = false,
}: {
  children: ReactNode;
  fluid?: boolean;
  label: string;
  wide?: boolean;
}) {
  return (
    <div className={styles.chartScroll} data-fluid={fluid}>
      <div
        aria-label={label}
        className={styles.chartInner}
        data-fluid={fluid}
        data-wide={wide}
        role="img"
      >
        {children}
      </div>
    </div>
  );
}

export function MonitoringChartSummary({ children }: { children: ReactNode }) {
  return <p className={styles.chartSummary}>{children}</p>;
}

export { styles as monitoringStyles };
