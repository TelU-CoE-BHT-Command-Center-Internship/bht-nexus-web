import Image from "next/image";
import microscopicCellsImage from "@/assets/research/microscopic-cells.webp";
import styles from "@/components/research-focus/research-focus.module.css";
import type { ResearchCategory } from "@/components/research-focus/research-focus-content";

type ResearchMetricsProps = {
  title: string;
  categories: ResearchCategory[];
};

export function ResearchMetrics({ title, categories }: ResearchMetricsProps) {
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
        <p className={styles.metricsTitle} id="research-metrics-title">
          {title}
        </p>

        <dl className={styles.metricsGrid}>
          {categories.map((category) => (
            <div className={styles.metric} key={category.id}>
              <dt>{category.label}</dt>
              <dd>{category.topics.length}</dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}
