"use client";

import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import {
  MonitoringDomainTargetChart,
  type MonitoringDomainTargetPoint,
  MonitoringRadialChart,
} from "@/components/nexus-monitoring/nexus-monitoring-charts";
import type { NexusMonitoringDomain } from "@/components/nexus-monitoring/nexus-monitoring-domains";
import { MonitoringNumber } from "@/components/nexus-monitoring/nexus-monitoring-number";
import {
  MonitoringBadge,
  MonitoringCard,
  MonitoringChartFrame,
} from "@/components/nexus-monitoring/nexus-monitoring-ui";
import type { NexusKmIndicatorCategory } from "@/content/nexus-km-indicators";

/**
 * Status target satu domain pada periode berjalan. Domain yang belum punya
 * metadata evaluasi tidak dikirim ke sini; grafik menandainya sebagai belum
 * dihitung, bukan sebagai capaian nol.
 */
export type NexusMonitoringDomainStatus = {
  category: NexusKmIndicatorCategory;
  notReached: number;
  reached: number;
};

export type NexusMonitoringTargetSummary = {
  domains: readonly NexusMonitoringDomainStatus[];
  notComputable: number;
  notReached: number;
  period: string;
  reached: number;
};

function targetPoints(
  domains: readonly NexusMonitoringDomain[],
  targetSummary: NexusMonitoringTargetSummary,
): readonly MonitoringDomainTargetPoint[] {
  const statusByCategory = new Map(
    targetSummary.domains.map((domain) => [domain.category, domain]),
  );

  return domains.flatMap((domain) => {
    if (!domain.category) return [];
    const status = statusByCategory.get(domain.category);
    const computed = status ? status.reached + status.notReached : 0;

    return [
      {
        id: domain.id,
        label: domain.chartLabel,
        notReached: status?.notReached ?? 0,
        reached: status?.reached ?? 0,
        unavailable: domain.indicators - computed,
      },
    ];
  });
}

export function NexusMonitoringSummaryAnalytics({
  domains,
  targetSummary,
}: {
  domains: readonly NexusMonitoringDomain[];
  targetSummary: NexusMonitoringTargetSummary;
}) {
  const points = targetPoints(domains, targetSummary);
  const totalIndicators = domains.reduce(
    (sum, domain) => sum + (domain.category ? domain.indicators : 0),
    0,
  );
  const computed = targetSummary.reached + targetSummary.notReached;
  const unavailable = totalIndicators - computed;
  const reachedShare = computed === 0 ? 0 : targetSummary.reached / computed;

  return (
    <div className={styles.summaryAnalyticsGrid}>
      <MonitoringCard
        actions={
          <span className={styles.summaryChartUnit}>Jumlah indikator</span>
        }
        description={`Status indikator terhadap target tahunan ${targetSummary.period} di setiap domain.`}
        headingId="monitoring-summary-domain-targets"
        title="Pemenuhan Target per Domain"
      >
        <MonitoringChartFrame
          fluid
          label={`Grafik batang bertumpuk status target tahunan ${targetSummary.period} pada sembilan domain KM. ${targetSummary.reached} indikator memenuhi target, ${targetSummary.notReached} belum memenuhi, dan ${unavailable} indikator belum dihitung.`}
        >
          <MonitoringDomainTargetChart height={270} points={points} />
        </MonitoringChartFrame>
      </MonitoringCard>

      <section
        aria-labelledby="monitoring-summary-target-gauge"
        className={`${styles.targetCard} ${styles.summaryTargetCard}`}
      >
        <div className={styles.targetPanel}>
          <div className={styles.cardHeading}>
            <h3 id="monitoring-summary-target-gauge">
              Capaian terhadap Target Tahunan
            </h3>
            <p>Indikator terhitung yang sudah memenuhi target.</p>
          </div>
          <div className={styles.targetChartWrap}>
            <div className={styles.targetChart}>
              <MonitoringRadialChart
                centerLabel="indikator memenuhi target"
                height={310}
                nameOffsetY={-34}
                share={reachedShare}
                valueLabel={`${targetSummary.reached} / ${computed}`}
                valueOffsetY={-64}
              />
            </div>
            <span className={styles.targetPill}>
              <MonitoringBadge>
                {`${computed} dari ${totalIndicators} indikator dapat dihitung`}
              </MonitoringBadge>
            </span>
          </div>
        </div>
        <div className={styles.targetFooter}>
          <div>
            <p>Memenuhi</p>
            <strong>
              <MonitoringNumber value={targetSummary.reached} />
            </strong>
          </div>
          <span aria-hidden="true" className={styles.targetDivider} />
          <div>
            <p>Belum memenuhi</p>
            <strong>
              <MonitoringNumber value={targetSummary.notReached} />
            </strong>
          </div>
          <span aria-hidden="true" className={styles.targetDivider} />
          <div>
            <p>Belum dihitung</p>
            <strong>
              <MonitoringNumber value={unavailable} />
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}
