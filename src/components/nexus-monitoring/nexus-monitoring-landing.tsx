import Link from "next/link";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import type { NexusMonitoringCategory } from "@/components/nexus-monitoring/nexus-monitoring-categories";
import { NEXUS_EVALUATION_PERIOD } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import {
  MonitoringBadge,
  MonitoringCard,
  MonitoringMetricCard,
} from "@/components/nexus-monitoring/nexus-monitoring-ui";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M4 10h12M10.5 4.5 16 10l-5.5 5.5" />
    </svg>
  );
}

export function NexusMonitoringLanding({
  categories,
}: {
  categories: readonly NexusMonitoringCategory[];
}) {
  const indicators = categories.reduce(
    (sum, category) => sum + category.indicators,
    0,
  );
  const monitored = categories.filter(
    (category) => category.state === "monitored",
  );
  const connectedRecords = categories.reduce(
    (sum, category) => sum + category.records,
    0,
  );

  return (
    <NexusWorkspacePage
      description="Pemantauan indikator KM CoE BHT. Angka pada halaman ini dibaca dari data resmi yang sudah lolos Tinjauan, sehingga setiap capaian dapat ditelusuri sampai rekam pembentuknya."
      descriptionId="monitoring-landing-description"
      meta={`Periode evaluasi ${NEXUS_EVALUATION_PERIOD}`}
      title="Monitoring KM"
      titleId="monitoring-landing-title"
    >
      <div className={styles.grid}>
        <div className={styles.spanFull}>
          <div className={styles.metricGrid}>
            <MonitoringMetricCard
              badge={{ label: `${categories.length} kategori` }}
              icon="chart"
              label="Indikator KM pada workbook"
              value={indicators}
            />
            <MonitoringMetricCard
              badge={{
                label: `${monitored.length} kategori`,
                tone: "success",
              }}
              icon="target"
              label="Indikator dengan pemantauan"
              value={monitored.reduce(
                (sum, category) => sum + category.indicators,
                0,
              )}
            />
          </div>
        </div>

        <div className={styles.spanFull}>
          <MonitoringCard
            description={`Kategori mengikuti daftar indikator KM CoE BHT. Kategori yang belum dipantau tidak ditampilkan sebagai capaian nol; keadaan sumbernya ditulis apa adanya. Saat ini ${connectedRecords} rekam resmi sudah terkait indikator KM.`}
            headingId="monitoring-landing-categories"
            inlineHeader={false}
            title="Kategori indikator KM"
          >
            <div className={styles.categoryGrid}>
              {categories.map((category) => (
                <article
                  className={styles.categoryCard}
                  data-monitored={category.state === "monitored"}
                  key={category.category}
                >
                  <div className={styles.categoryTop}>
                    <div>
                      <h3>{category.category}</h3>
                      <span className={styles.categoryCount}>
                        {`${category.indicators} indikator`}
                      </span>
                    </div>
                    <MonitoringBadge
                      tone={
                        category.state === "monitored" ? "success" : "neutral"
                      }
                    >
                      {category.stateLabel}
                    </MonitoringBadge>
                  </div>
                  <p className={styles.categoryDetail}>{category.detail}</p>
                  <div className={styles.categoryFoot}>
                    <span className={styles.categoryCount}>
                      {category.records > 0
                        ? `${category.records} rekam resmi terkait`
                        : "Belum ada rekam resmi terkait"}
                    </span>
                    {category.href ? (
                      <Link
                        className={styles.inlineLink}
                        href={category.href}
                        prefetch={false}
                      >
                        {`Buka pemantauan ${category.category}`}
                        <ArrowRightIcon />
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </MonitoringCard>
        </div>
      </div>
    </NexusWorkspacePage>
  );
}
