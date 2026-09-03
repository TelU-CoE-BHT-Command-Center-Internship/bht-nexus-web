import {
  NEXUS_EVALUATION_PERIOD,
  type NexusEvaluationPeriodId,
  nexusIndicatorHref,
  nexusMonitoringSourceHouses,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import {
  type NexusIndicatorMeasurement,
  type NexusIndicatorStatus,
  nexusIndicatorStatusLabels,
  nexusIndicatorStatusTones,
  summarizeRiset,
} from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import {
  getNexusMonitoringRecords,
  type NexusMonitoringRecord,
} from "@/components/nexus-monitoring/nexus-monitoring-sources";
import type { MonitoringTone } from "@/components/nexus-monitoring/nexus-monitoring-ui";
import type { NexusKmIndicatorId } from "@/content/nexus-km-indicators";

/**
 * Bentuk tampilan untuk ikhtisar domain Riset. Modul ini hanya menyiapkan angka
 * yang dibaca Ringkasan dan ikhtisar domain; penyajian rincian satu indikator
 * disiapkan ulang pada paket kerja tersendiri.
 */
export type MonitoringIndicatorSummary = {
  detailHref: string;
  houseHref: string;
  houseLabel: string;
  id: NexusKmIndicatorId;
  label: string;
  number: number;
  /** Rasio realisasi terhadap target dalam persen; boleh melebihi 100. */
  progressPercent: number | null;
  realization: number | null;
  status: NexusIndicatorStatus;
  statusLabel: string;
  statusTone: MonitoringTone;
  target: number | null;
};

export type MonitoringSourceShareView = {
  href: string;
  id: string;
  indicators: number;
  label: string;
  records: number;
  share: number;
};

/**
 * Jarak realisasi sebuah indikator terhadap targetnya sendiri. Nilainya adalah
 * selisih apa adanya; tidak ada ambang "berisiko" atau "kritis" karena workbook
 * KM 2026 tidak menetapkan aturan seperti itu.
 */
export type MonitoringGapView = {
  detailHref: string;
  gap: number;
  id: NexusKmIndicatorId;
  label: string;
  progressPercent: number | null;
  realization: number;
  target: number;
};

export type MonitoringRisetView = {
  /** Indikator Riset yang realisasinya sudah dapat dihitung dari data resmi. */
  computable: number;
  contributingRecords: number;
  gaps: readonly MonitoringGapView[];
  indicators: readonly MonitoringIndicatorSummary[];
  notComputable: number;
  notReached: number;
  period: NexusEvaluationPeriodId;
  reached: number;
  reachedShare: number;
  sources: readonly MonitoringSourceShareView[];
  total: number;
};

function indicatorSummary(
  measurement: NexusIndicatorMeasurement,
): MonitoringIndicatorSummary {
  const { evaluation } = measurement;
  const house = nexusMonitoringSourceHouses[evaluation.sourceFamily];

  return {
    detailHref: nexusIndicatorHref(evaluation.indicator.id),
    houseHref: house.href,
    houseLabel: house.label,
    id: evaluation.indicator.id,
    label: evaluation.indicator.label,
    number: evaluation.indicator.number,
    progressPercent:
      measurement.progress === null
        ? null
        : Math.round(measurement.progress * 100),
    realization: measurement.realization,
    status: measurement.status,
    statusLabel: nexusIndicatorStatusLabels[measurement.status],
    statusTone: nexusIndicatorStatusTones[measurement.status],
    target: evaluation.target.value,
  };
}

/**
 * Indikator yang realisasinya masih di bawah target, diurutkan dari selisih
 * terbesar. Daftar ini menjawab "mana yang paling jauh dari targetnya sendiri",
 * bukan menilai laju pencapaian.
 */
function targetGaps(
  indicators: readonly MonitoringIndicatorSummary[],
): readonly MonitoringGapView[] {
  return indicators
    .flatMap((indicator) => {
      const { realization, target } = indicator;
      if (realization === null || target === null) return [];
      if (realization >= target) return [];

      return [
        {
          detailHref: indicator.detailHref,
          gap: target - realization,
          id: indicator.id,
          label: indicator.label,
          progressPercent: indicator.progressPercent,
          realization,
          target,
        },
      ];
    })
    .sort(
      (first, second) =>
        second.gap - first.gap ||
        first.id.localeCompare(second.id, "id-ID", { numeric: true }),
    );
}

export function buildRisetView(
  period: NexusEvaluationPeriodId = NEXUS_EVALUATION_PERIOD,
  records: readonly NexusMonitoringRecord[] = getNexusMonitoringRecords(),
): MonitoringRisetView {
  const summary = summarizeRiset(period, records);
  const indicators = summary.measurements.map(indicatorSummary);

  return {
    computable: summary.computable,
    contributingRecords: summary.contributingRecords,
    gaps: targetGaps(indicators),
    indicators,
    notComputable: summary.notComputable,
    notReached: summary.notReached,
    period: summary.period,
    reached: summary.reached,
    reachedShare: summary.reachedShare,
    sources: summary.sourceBreakdown.map((source) => ({
      href: source.href,
      id: source.family,
      indicators: source.indicators,
      label: source.label,
      records: source.records,
      share: source.share,
    })),
    total: summary.total,
  };
}
