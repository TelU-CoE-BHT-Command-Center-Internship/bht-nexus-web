import Image from "next/image";
import microscopicCellsImage from "@/assets/research/microscopic-cells.webp";
import styles from "@/components/research-focus/research-focus.module.css";
import type { ResearchCategory } from "@/components/research-focus/research-focus-content";

type ResearchMetricsProps = {
  title: string;
  subtitle: string;
  categories: ResearchCategory[];
};

export function ResearchMetrics({
  title,
  subtitle,
  categories,
}: ResearchMetricsProps) {
  return (
    <aside className={styles.metrics} aria-labelledby="research-metrics-title">
      <Image
        className={styles.metricsImage}
        src={microscopicCellsImage}
        alt=""
        fill
        sizes="100vw"
      />

      <div className={styles.metricsContent}>
        <header className={styles.metricsHeading}>
          <h3 className={styles.metricsTitle} id="research-metrics-title">
            {title}
          </h3>
          <p className={styles.metricsSubtitle}>{subtitle}</p>
        </header>

        <dl className={styles.metricsGrid}>
          {categories.map((category) => (
            <div className={styles.metric} key={category.id}>
              <dt className={styles.metricTerm}>
                <span className={styles.metricValue}>
                  {category.topics.length}
                </span>
                <span className={styles.metricLabel}>{category.label}</span>
              </dt>
              <dd className={styles.metricDescription}>{category.summary}</dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}
