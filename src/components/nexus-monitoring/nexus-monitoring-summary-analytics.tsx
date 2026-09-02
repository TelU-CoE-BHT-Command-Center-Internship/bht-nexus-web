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

export type NexusMonitoringTargetSummary = {
  notComputable: number;
  notReached: number;
  period: string;
  reached: number;
};

function targetPoints(
  domains: readonly NexusMonitoringDomain[],
  targetSummary: NexusMonitoringTargetSummary,
): readonly MonitoringDomainTargetPoint[] {
  return domains.flatMap((domain) => {
    if (!domain.category) return [];
    const isRiset = domain.category === "Riset";
    return [
      {
        id: domain.id,
        label: domain.chartLabel,
        notReached: isRiset ? targetSummary.notReached : 0,
        reached: isRiset ? targetSummary.reached : 0,
        unavailable: isRiset ? targetSummary.notComputable : domain.indicators,
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
          label={`Grafik batang bertumpuk status target tahunan ${targetSummary.period} pada sembilan domain KM. Riset memiliki ${targetSummary.reached} indikator memenuhi target dan ${targetSummary.notReached} belum memenuhi; ${unavailable} indikator pada domain lain belum dihitung.`}
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
