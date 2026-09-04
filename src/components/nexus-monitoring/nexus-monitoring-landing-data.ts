import { getNexusMonitoringCategories } from "@/components/nexus-monitoring/nexus-monitoring-categories";
import {
  NEXUS_EVALUATION_PERIOD,
  nexusMonitoredCategories,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { nexusMonitoringIndicatorProgress } from "@/components/nexus-monitoring/nexus-monitoring-indicator-progress";
import { summarizeCategory } from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import { getNexusMonitoringRecords } from "@/components/nexus-monitoring/nexus-monitoring-sources";
import { nexusMonitoringUpdates } from "@/components/nexus-monitoring/nexus-monitoring-updates";
import {
  buildDomainView,
  type MonitoringDomainView,
} from "@/components/nexus-monitoring/nexus-monitoring-view";
import type { NexusKmIndicatorCategory } from "@/content/nexus-km-indicators";

/**
 * Satu penyiapan data untuk kerangka Monitoring KM. Ringkasan dan setiap
 * ikhtisar domain memakai fungsi yang sama supaya kartu, grafik, tabel, dan
 * pembaruan selalu dibaca dari satu perhitungan yang sama.
 */
export function getNexusMonitoringLandingData() {
  const records = getNexusMonitoringRecords();
  const domainViews = Object.fromEntries(
    nexusMonitoredCategories.map((category) => [
      category,
      buildDomainView(category, NEXUS_EVALUATION_PERIOD, records),
    ]),
  ) as Record<NexusKmIndicatorCategory, MonitoringDomainView | undefined>;

  const domainStatuses = nexusMonitoredCategories.map((category) => {
    const summary = summarizeCategory(
      category,
      NEXUS_EVALUATION_PERIOD,
      records,
    );
    return {
      category,
      notComputable: summary.notComputable,
      notReached: summary.notReached,
      reached: summary.reached,
    };
  });

  const totals = domainStatuses.reduce(
    (sum, domain) => ({
      notComputable: sum.notComputable + domain.notComputable,
      notReached: sum.notReached + domain.notReached,
      reached: sum.reached + domain.reached,
    }),
    { notComputable: 0, notReached: 0, reached: 0 },
  );

  return {
    categories: getNexusMonitoringCategories(records),
    domainViews,
    indicatorProgress: nexusMonitoringIndicatorProgress(records),
    targetSummary: {
      domains: domainStatuses.map(({ category, notReached, reached }) => ({
        category,
        notReached,
        reached,
      })),
      notComputable: totals.notComputable,
      notReached: totals.notReached,
      period: NEXUS_EVALUATION_PERIOD,
      reached: totals.reached,
    },
    updates: nexusMonitoringUpdates(records),
  };
}
