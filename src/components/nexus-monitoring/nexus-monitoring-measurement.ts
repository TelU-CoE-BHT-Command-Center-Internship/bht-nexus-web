import {
  NEXUS_EVALUATION_PERIOD,
  type NexusEvaluationPeriodId,
  type NexusIndicatorEvaluation,
  type NexusMonitoringSourceFamily,
  nexusIndicatorEvaluation,
  nexusMonitoringSourceHouses,
  nexusRisetEvaluations,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import {
  type NexusEvaluationQuarter,
  nexusQuarters,
} from "@/components/nexus-monitoring/nexus-monitoring-quarter";
import {
  getNexusMonitoringRecords,
  type NexusMonitoringRecord,
} from "@/components/nexus-monitoring/nexus-monitoring-sources";
import type { NexusKmIndicatorId } from "@/content/nexus-km-indicators";

/**
 * Keadaan indikator yang seluruhnya objektif. Ambang seperti "on track" atau
 * "at risk" tidak dipakai karena workbook KM 2026 tidak menetapkan aturan laju
 * pencapaian; menambahkannya berarti mengarang penilaian.
 */
export type NexusIndicatorStatus =
  | "belum-ada-realisasi"
  | "belum-dapat-dihitung"
  | "belum-tercapai"
  | "target-belum-tersedia"
  | "tercapai";

export type NexusIndicatorStatusTone =
  | "danger"
  | "neutral"
  | "success"
  | "waiting";

export const nexusIndicatorStatusLabels: Record<NexusIndicatorStatus, string> =
  {
    "belum-ada-realisasi": "Belum ada realisasi",
    "belum-dapat-dihitung": "Belum dapat dihitung",
    "belum-tercapai": "Belum tercapai",
    "target-belum-tersedia": "Target belum tersedia",
    tercapai: "Tercapai",
  };

export const nexusIndicatorStatusTones: Record<
  NexusIndicatorStatus,
  NexusIndicatorStatusTone
> = {
  "belum-ada-realisasi": "neutral",
  "belum-dapat-dihitung": "neutral",
  "belum-tercapai": "waiting",
  "target-belum-tersedia": "neutral",
  tercapai: "success",
};

export type NexusQuarterBreakdown =
  | {
      available: true;
      counts: Record<NexusEvaluationQuarter, number>;
      field: string;
      /** Rekam yang tanggal bisnisnya belum tercatat, jadi tidak masuk triwulan mana pun. */
      undated: number;
    }
  | { available: false; field: string; reason: string };

export type NexusIndicatorMeasurement = {
  /** `false` ketika sumber realisasinya belum dimodelkan sama sekali. */
  computable: boolean;
  /** Selisih realisasi terhadap target; `null` bila salah satunya tidak ada. */
  difference: number | null;
  evaluation: NexusIndicatorEvaluation;
  period: NexusEvaluationPeriodId;
  /** Rasio realisasi terhadap target. Nilainya boleh melebihi 1. */
  progress: number | null;
  quarterly: NexusQuarterBreakdown;
  realization: number | null;
  records: readonly NexusMonitoringRecord[];
  status: NexusIndicatorStatus;
};

const modeledFamilies: readonly NexusMonitoringSourceFamily[] = [
  "activities",
  "contracts",
  "intellectual-property",
  "publications",
];

/**
 * Rekam yang boleh menyumbang realisasi satu indikator: rekam resmi pada
 * periode evaluasi yang sama, dengan kaitan KM yang eksplisit. Kandidat yang
 * masih berada di Tinjauan tidak pernah sampai ke sini karena rumah data resmi
 * hanya memuat rekam yang sudah lolos.
 */
function eligibleRecords(
  indicatorId: NexusKmIndicatorId,
  period: NexusEvaluationPeriodId,
  records: readonly NexusMonitoringRecord[],
) {
  const byPublicId = new Map<string, NexusMonitoringRecord>();

  for (const record of records) {
    if (record.evaluationPeriod !== period) continue;
    if (!record.kmIds.includes(indicatorId)) continue;
    // Satu rekam resmi hanya boleh dihitung sekali untuk indikator yang sama.
    if (byPublicId.has(record.publicId)) continue;
    byPublicId.set(record.publicId, record);
  }

  return [...byPublicId.values()];
}

function quarterBreakdown(
  field: string,
  records: readonly NexusMonitoringRecord[],
): NexusQuarterBreakdown {
  const counts: Record<NexusEvaluationQuarter, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };
  let dated = 0;
  let undated = 0;
  const reasons = new Set<string>();

  for (const record of records) {
    if (record.businessDate.available) {
      counts[record.businessDate.quarter] += 1;
      dated += 1;
      continue;
    }
    undated += 1;
    reasons.add(record.businessDate.reason);
  }

  if (dated === 0) {
    return {
      available: false,
      field,
      reason:
        records.length === 0
          ? "Belum ada rekam resmi yang membentuk realisasi indikator ini."
          : [...reasons].join(" "),
    };
  }

  return { available: true, counts, field, undated };
}

function resolveStatus(
  realization: number | null,
  target: number | null,
): NexusIndicatorStatus {
  if (realization === null) return "belum-dapat-dihitung";
  if (target === null) return "target-belum-tersedia";
  if (realization === 0) return "belum-ada-realisasi";
  return realization >= target ? "tercapai" : "belum-tercapai";
}

export function measureIndicator(
  indicatorId: NexusKmIndicatorId,
  period: NexusEvaluationPeriodId = NEXUS_EVALUATION_PERIOD,
  records: readonly NexusMonitoringRecord[] = getNexusMonitoringRecords(),
): NexusIndicatorMeasurement | undefined {
  const evaluation = nexusIndicatorEvaluation(indicatorId);
  if (!evaluation) return undefined;

  const computable = modeledFamilies.includes(evaluation.sourceFamily);
  const contributing = computable
    ? eligibleRecords(indicatorId, period, records)
    : [];
  const realization = computable ? contributing.length : null;
  const target = evaluation.target.value;
  const progress =
    realization !== null && target !== null && target > 0
      ? realization / target
      : null;

  return {
    computable,
    difference:
      realization !== null && target !== null ? realization - target : null,
    evaluation,
    period,
    progress,
    quarterly: computable
      ? quarterBreakdown(evaluation.businessDateLabel, contributing)
      : {
          available: false,
          field: evaluation.businessDateLabel,
          reason: "Sumber realisasi indikator ini belum terhubung.",
        },
    realization,
    records: contributing,
    status: resolveStatus(realization, target),
  };
}

export function measureRisetIndicators(
  period: NexusEvaluationPeriodId = NEXUS_EVALUATION_PERIOD,
  records: readonly NexusMonitoringRecord[] = getNexusMonitoringRecords(),
): readonly NexusIndicatorMeasurement[] {
  return nexusRisetEvaluations
    .map((evaluation) =>
      measureIndicator(evaluation.indicator.id, period, records),
    )
    .filter((measurement): measurement is NexusIndicatorMeasurement =>
      Boolean(measurement),
    );
}

export type NexusRisetSummary = {
  /** Rekam resmi berbeda yang membentuk realisasi seluruh indikator Riset. */
  contributingRecords: number;
  measurements: readonly NexusIndicatorMeasurement[];
  notComputable: number;
  notReached: number;
  period: NexusEvaluationPeriodId;
  reached: number;
  /** Bagian indikator yang sudah mencapai target, 0–1. */
  reachedShare: number;
  sourceBreakdown: readonly NexusRisetSourceShare[];
  total: number;
};

export type NexusRisetSourceShare = {
  family: NexusMonitoringSourceFamily;
  href: string;
  indicators: number;
  label: string;
  records: number;
  share: number;
};

export function summarizeRiset(
  period: NexusEvaluationPeriodId = NEXUS_EVALUATION_PERIOD,
  records: readonly NexusMonitoringRecord[] = getNexusMonitoringRecords(),
): NexusRisetSummary {
  const measurements = measureRisetIndicators(period, records);
  const reached = measurements.filter((item) => item.status === "tercapai");
  const notComputable = measurements.filter(
    (item) => item.status === "belum-dapat-dihitung",
  );
  const contributing = new Set<string>();
  const byFamily = new Map<
    NexusMonitoringSourceFamily,
    { indicators: number; label: string; href: string; records: Set<string> }
  >();

  for (const measurement of measurements) {
    const family = measurement.evaluation.sourceFamily;
    const bucket = byFamily.get(family) ?? {
      href: "",
      indicators: 0,
      label: "",
      records: new Set<string>(),
    };
    bucket.indicators += 1;
    for (const record of measurement.records) {
      bucket.href = record.house.href;
      bucket.label = record.house.label;
      bucket.records.add(record.publicId);
      contributing.add(record.publicId);
    }
    byFamily.set(family, bucket);
  }

  const totalRecords = [...byFamily.values()].reduce(
    (sum, bucket) => sum + bucket.records.size,
    0,
  );
  const sourceBreakdown = [...byFamily.entries()]
    .map(([family, bucket]) => ({
      family,
      href: nexusMonitoringSourceHouses[family].href,
      indicators: bucket.indicators,
      label: nexusMonitoringSourceHouses[family].label,
      records: bucket.records.size,
      share: totalRecords === 0 ? 0 : bucket.records.size / totalRecords,
    }))
    .sort((first, second) => second.records - first.records);

  return {
    contributingRecords: contributing.size,
    measurements,
    notComputable: notComputable.length,
    notReached: measurements.length - reached.length - notComputable.length,
    period,
    reached: reached.length,
    reachedShare:
      measurements.length === 0 ? 0 : reached.length / measurements.length,
    sourceBreakdown,
    total: measurements.length,
  };
}

/** Jumlah rekam per triwulan yang siap dipakai grafik dan ringkasan teks. */
export function quarterSeries(breakdown: NexusQuarterBreakdown) {
  if (!breakdown.available) return null;
  return nexusQuarters.map((quarter) => breakdown.counts[quarter]);
}
