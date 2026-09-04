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
  summarizeCategory,
} from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import {
  getNexusMonitoringRecords,
  type NexusMonitoringRecord,
} from "@/components/nexus-monitoring/nexus-monitoring-sources";
import type { MonitoringTone } from "@/components/nexus-monitoring/nexus-monitoring-ui";
import type {
  NexusKmIndicatorCategory,
  NexusKmIndicatorId,
} from "@/content/nexus-km-indicators";

/**
 * Bentuk tampilan untuk ikhtisar satu domain KM. Modul ini hanya menyiapkan
 * angka yang dibaca Ringkasan dan ikhtisar domain; penyajian rincian satu
 * indikator disiapkan ulang pada paket kerja tersendiri.
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
  /** Tulisan target apa adanya ketika workbook tidak memuat satu angka. */
  targetLiteral: string | null;
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

export type MonitoringDomainView = {
  category: NexusKmIndicatorCategory;
  /** Indikator domain yang capaiannya dapat dibandingkan dengan targetnya. */
  computable: number;
  contributingRecords: number;
  gaps: readonly MonitoringGapView[];
  indicators: readonly MonitoringIndicatorSummary[];
  /** Rentang indikator domain, mis. `KM-9 sampai KM-18`. */
  indicatorRange: string;
  /** Nama domain apa adanya, dipakai seluruh teks ikhtisar. */
  label: string;
  notComputable: number;
  /** Alasan sebuah indikator belum dapat dihitung, apa adanya menurut sumber. */
  notes: readonly string[];
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
    targetLiteral: evaluation.target.literal,
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

/**
 * Keterangan mengapa sebagian indikator belum dapat dihitung. Alasannya diambil
 * dari sumbernya sendiri—target yang belum tercatat, target gabungan yang tidak
 * dapat dibandingkan sebagai satu angka, atau nilai yang memang bukan jumlah
 * rekam—supaya keadaan itu tidak berhenti sebagai label tanpa penjelasan.
 */
function computabilityNotes(
  measurements: readonly NexusIndicatorMeasurement[],
): readonly string[] {
  const notes: string[] = [];

  const withoutTarget = measurements
    .filter((measurement) => measurement.status === "target-belum-tersedia")
    .map((measurement) => measurement.evaluation.indicator.id);
  if (withoutTarget.length > 0) {
    notes.push(
      `Workbook KM 2026 belum mencatat target untuk ${withoutTarget.join(", ")}, sehingga capaiannya belum dapat dihitung.`,
    );
  }

  for (const measurement of measurements) {
    const { evaluation } = measurement;
    if (evaluation.target.literal !== null) {
      notes.push(
        `Target ${evaluation.indicator.id} tercatat sebagai ${evaluation.target.literal} yang menggabungkan jumlah dan nilai rupiah, sehingga tidak dibandingkan sebagai satu angka.`,
      );
    }
    if (evaluation.realization.kind === "unavailable") {
      notes.push(
        `${evaluation.indicator.id}: ${evaluation.realization.reason}`,
      );
    }
  }

  return notes;
}

function indicatorRange(indicators: readonly MonitoringIndicatorSummary[]) {
  const first = indicators[0];
  const last = indicators[indicators.length - 1];
  if (!first || !last) return "Belum ada indikator";
  return first.id === last.id ? first.id : `${first.id} sampai ${last.id}`;
}

export function buildDomainView(
  category: NexusKmIndicatorCategory,
  period: NexusEvaluationPeriodId = NEXUS_EVALUATION_PERIOD,
  records: readonly NexusMonitoringRecord[] = getNexusMonitoringRecords(),
): MonitoringDomainView {
  const summary = summarizeCategory(category, period, records);
  const indicators = summary.measurements.map(indicatorSummary);

  return {
    category,
    computable: summary.computable,
    contributingRecords: summary.contributingRecords,
    gaps: targetGaps(indicators),
    indicators,
    indicatorRange: indicatorRange(indicators),
    label: category,
    notComputable: summary.notComputable,
    notes: computabilityNotes(summary.measurements),
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
