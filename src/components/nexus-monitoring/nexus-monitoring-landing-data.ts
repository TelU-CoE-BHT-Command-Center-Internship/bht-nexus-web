import { getNexusMonitoringCategories } from "@/components/nexus-monitoring/nexus-monitoring-categories";
import { NEXUS_EVALUATION_PERIOD } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { nexusMonitoringIndicatorProgress } from "@/components/nexus-monitoring/nexus-monitoring-indicator-progress";
import { summarizeRiset } from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import { getNexusMonitoringRecords } from "@/components/nexus-monitoring/nexus-monitoring-sources";
import { nexusMonitoringUpdates } from "@/components/nexus-monitoring/nexus-monitoring-updates";
import { buildRisetView } from "@/components/nexus-monitoring/nexus-monitoring-view";

/**
 * Satu penyiapan data untuk kerangka Monitoring KM. Ringkasan dan alamat
 * domain memakai fungsi yang sama supaya kartu, grafik, tabel, dan pembaruan
 * selalu dibaca dari satu perhitungan yang sama.
 */
export function getNexusMonitoringLandingData() {
  const records = getNexusMonitoringRecords();
  const targetSummary = summarizeRiset(NEXUS_EVALUATION_PERIOD, records);

  return {
    categories: getNexusMonitoringCategories(records),
    indicatorProgress: nexusMonitoringIndicatorProgress(records),
    risetView: buildRisetView(NEXUS_EVALUATION_PERIOD),
    targetSummary: {
      notComputable: targetSummary.notComputable,
      notReached: targetSummary.notReached,
      period: targetSummary.period,
      reached: targetSummary.reached,
    },
    updates: nexusMonitoringUpdates(records),
  };
}
