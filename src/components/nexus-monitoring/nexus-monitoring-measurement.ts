import {
  type NexusMonitoringEligibility,
  resolveRecordEligibility,
} from "@/components/nexus-monitoring/nexus-monitoring-eligibility";
import {
  type NexusEvaluationPeriodId,
  type NexusIndicatorEvaluation,
  type NexusIndicatorTarget,
  type NexusMonitoringSourceFamily,
  nexusCategoryEvaluations,
  nexusEvaluations,
  nexusIndicatorEvaluation,
  nexusMonitoringSourceHouses,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import type { NexusEvaluationQuarter } from "@/components/nexus-monitoring/nexus-monitoring-quarter";
import {
  monitoringRecordQuarter,
  type NexusMonitoringRecord,
  resolveRecordPeriod,
} from "@/components/nexus-monitoring/nexus-monitoring-sources";
import type { NexusMonitoringTargetLookup } from "@/components/nexus-monitoring/nexus-monitoring-targets";
import type {
  NexusKmIndicatorCategory,
  NexusKmIndicatorId,
} from "@/content/nexus-km-indicators";

/**
 * Masukan satu pengukuran Monitoring: periode yang diukur, rekam resmi yang
 * berlaku pada sesi, dan target periode tersebut. Tidak ada fungsi pengukuran
 * yang membaca data sendiri, sehingga seluruh halaman memakai satu kebenaran.
 */
export type NexusMonitoringInput = {
  period: NexusEvaluationPeriodId;
  records: readonly NexusMonitoringRecord[];
  targets: NexusMonitoringTargetLookup;
};

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

/**
 * Keadaan satu rekam resmi terhadap realisasi satu indikator pada satu periode.
 *
 * Rekam yang tertaut belum tentu dihitung: tahunnya dapat berada di luar
 * periode, ketentuan indikatornya dapat tidak terpenuhi, atau bidang yang
 * menentukan belum tercatat sehingga ketentuannya belum dapat diperiksa.
 * Ketiganya dibedakan supaya selisih antara jumlah rekam tertaut dan angka
 * realisasi selalu dapat dijelaskan.
 */
export type NexusRecordCountingStatus =
  | { state: "counted" }
  | { reason: string; state: "needs-verification" }
  | { reason: string; state: "not-counted" };

export type NexusCountingState = NexusRecordCountingStatus["state"];

export const nexusCountingLabels: Record<NexusCountingState, string> = {
  counted: "Dihitung",
  "needs-verification": "Perlu verifikasi",
  "not-counted": "Belum dihitung",
};

/** Satu rekam resmi tertaut beserta alasan dihitung atau tidaknya. */
export type NexusAssessedRecord = {
  counting: NexusRecordCountingStatus;
  eligibility: NexusMonitoringEligibility;
  record: NexusMonitoringRecord;
};

export type NexusQuarterBreakdown =
  | {
      available: true;
      counts: Record<NexusEvaluationQuarter, number>;
      field: string;
      /** Rekam dihitung yang tanggalnya belum tercatat, jadi di luar keempat TW. */
      undated: number;
    }
  | { available: false; field: string; reason: string };

export type NexusIndicatorMeasurement = {
  /** `false` ketika sumber realisasinya belum dimodelkan sama sekali. */
  computable: boolean;
  /** Rekam resmi yang benar-benar membentuk realisasi indikator ini. */
  contributing: readonly NexusMonitoringRecord[];
  /** Selisih realisasi terhadap target; `null` bila salah satunya tidak ada. */
  difference: number | null;
  evaluation: NexusIndicatorEvaluation;
  /** Seluruh rekam tertaut, termasuk yang belum dihitung, beserta alasannya. */
  linked: readonly NexusAssessedRecord[];
  needsVerification: number;
  notCounted: number;
  period: NexusEvaluationPeriodId;
  /** Rasio realisasi terhadap target. Nilainya boleh melebihi 1. */
  progress: number | null;
  quarterly: NexusQuarterBreakdown;
  realization: number | null;
  status: NexusIndicatorStatus;
  /** Target periode yang berlaku saat pengukuran dibuat. */
  target: NexusIndicatorTarget;
};

const modeledFamilies: readonly NexusMonitoringSourceFamily[] = [
  "academic",
  "activities",
  "contracts",
  "intellectual-property",
  "publications",
];

/**
 * Rekam resmi yang tertaut ke satu indikator. Kaitan KM menyatakan rekam itu
 * dilaporkan pada indikator tersebut; apakah rekam itu ikut membentuk
 * realisasinya ditentukan kemudian oleh periode dan ketentuan indikatornya.
 * Kandidat yang masih berada di Tinjauan tidak pernah sampai ke sini karena
 * rumah data resmi hanya memuat rekam yang sudah lolos.
 */
function linkedRecords(
  indicatorId: NexusKmIndicatorId,
  records: readonly NexusMonitoringRecord[],
) {
  const byPublicId = new Map<string, NexusMonitoringRecord>();

  for (const record of records) {
    if (!record.kmIds.includes(indicatorId)) continue;
    // Satu rekam resmi hanya boleh muncul sekali untuk indikator yang sama.
    if (byPublicId.has(record.publicId)) continue;
    byPublicId.set(record.publicId, record);
  }

  return [...byPublicId.values()];
}

/**
 * Menilai satu rekam tertaut: periode dulu, baru ketentuan indikatornya.
 * Ketentuan yang belum dapat diperiksa tidak pernah dianggap terpenuhi.
 */
function assessRecord(
  indicatorId: NexusKmIndicatorId,
  period: NexusEvaluationPeriodId,
  record: NexusMonitoringRecord,
  unavailableReason: string | null,
): NexusAssessedRecord {
  const eligibility = resolveRecordEligibility(indicatorId, record);
  const membership = resolveRecordPeriod(record, period);

  if (membership.state === "out-of-period") {
    return {
      counting: { reason: membership.reason, state: "not-counted" },
      eligibility,
      record,
    };
  }

  if (eligibility.state === "ineligible") {
    return {
      counting: { reason: eligibility.reason, state: "not-counted" },
      eligibility,
      record,
    };
  }

  if (eligibility.state === "undetermined") {
    return {
      counting: { reason: eligibility.reason, state: "needs-verification" },
      eligibility,
      record,
    };
  }

  if (unavailableReason !== null) {
    return {
      counting: { reason: unavailableReason, state: "not-counted" },
      eligibility,
      record,
    };
  }

  return { counting: { state: "counted" }, eligibility, record };
}

function quarterBreakdown(
  field: string,
  period: NexusEvaluationPeriodId,
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
    const quarter = monitoringRecordQuarter(record, period);
    if (quarter !== null) {
      counts[quarter] += 1;
      dated += 1;
      continue;
    }
    undated += 1;
    if (!record.businessDate.available) {
      reasons.add(
        `${record.businessDate.reason} Triwulan dilaporkan juga belum tercatat.`,
      );
    }
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

/**
 * Status indikator. Target gabungan seperti `9/1M` memang tercatat pada
 * workbook, tetapi tidak dapat dibandingkan sebagai satu angka, sehingga
 * indikatornya dinyatakan belum dapat dihitung dan bukan tanpa target.
 */
function resolveStatus(
  realization: number | null,
  target: NexusIndicatorTarget,
): NexusIndicatorStatus {
  if (realization === null) return "belum-dapat-dihitung";
  if (target.value === null) {
    return target.literal === null
      ? "target-belum-tersedia"
      : "belum-dapat-dihitung";
  }
  if (realization === 0) return "belum-ada-realisasi";
  return realization >= target.value ? "tercapai" : "belum-tercapai";
}

export function measureIndicator(
  indicatorId: NexusKmIndicatorId,
  input: NexusMonitoringInput,
): NexusIndicatorMeasurement | undefined {
  const evaluation = nexusIndicatorEvaluation(indicatorId);
  if (!evaluation) return undefined;
  const { period, records } = input;
  const targetDefinition = input.targets(indicatorId);

  const countable =
    evaluation.realization.kind === "record-count" &&
    modeledFamilies.includes(evaluation.sourceFamily);
  const unavailableReason = countable
    ? null
    : evaluation.realization.kind === "unavailable"
      ? evaluation.realization.reason
      : "Sumber realisasi indikator ini belum terhubung.";

  const linked = linkedRecords(indicatorId, records).map((record) =>
    assessRecord(indicatorId, period, record, unavailableReason),
  );
  const contributing = linked
    .filter((item) => item.counting.state === "counted")
    .map((item) => item.record);

  const realization = countable ? contributing.length : null;
  const target = targetDefinition.value;
  const progress =
    realization !== null && target !== null && target > 0
      ? realization / target
      : null;

  return {
    computable: countable,
    contributing,
    difference:
      realization !== null && target !== null ? realization - target : null,
    evaluation,
    linked,
    needsVerification: linked.filter(
      (item) => item.counting.state === "needs-verification",
    ).length,
    notCounted: linked.filter((item) => item.counting.state === "not-counted")
      .length,
    period,
    progress,
    quarterly: countable
      ? quarterBreakdown(evaluation.businessDateLabel, period, contributing)
      : {
          available: false,
          field: evaluation.businessDateLabel,
          reason: unavailableReason ?? "",
        },
    realization,
    status: resolveStatus(realization, targetDefinition),
    target: targetDefinition,
  };
}

function measureEvaluations(
  evaluations: readonly NexusIndicatorEvaluation[],
  input: NexusMonitoringInput,
): readonly NexusIndicatorMeasurement[] {
  return evaluations
    .map((evaluation) => measureIndicator(evaluation.indicator.id, input))
    .filter((measurement): measurement is NexusIndicatorMeasurement =>
      Boolean(measurement),
    );
}

/** Pengukuran seluruh indikator satu kategori KM. */
export function measureCategoryIndicators(
  category: NexusKmIndicatorCategory,
  input: NexusMonitoringInput,
): readonly NexusIndicatorMeasurement[] {
  return measureEvaluations(nexusCategoryEvaluations(category), input);
}

/** Pengukuran seluruh indikator yang metadata evaluasinya sudah tersedia. */
export function measureMonitoredIndicators(
  input: NexusMonitoringInput,
): readonly NexusIndicatorMeasurement[] {
  return measureEvaluations(nexusEvaluations, input);
}

/**
 * Perbandingan rekam tertaut dengan rekam yang benar-benar dihitung pada satu
 * domain. Selisihnya menjawab "mengapa realisasi lebih kecil daripada jumlah
 * rekam", dan ketiga angkanya selalu berjumlah sama dengan rekam tertaut.
 */
export type NexusMonitoringCountingSummary = {
  counted: number;
  linked: number;
  needsVerification: number;
  notCounted: number;
};

export type NexusMonitoringSummary = {
  /** Indikator yang capaiannya sudah dapat dibandingkan dengan targetnya. */
  computable: number;
  /** Rekam resmi berbeda yang membentuk realisasi seluruh indikator dihitung. */
  contributingRecords: number;
  counting: NexusMonitoringCountingSummary;
  measurements: readonly NexusIndicatorMeasurement[];
  notComputable: number;
  notReached: number;
  period: NexusEvaluationPeriodId;
  reached: number;
  /**
   * Bagian indikator terhitung yang sudah mencapai target, 0–1. Penyebutnya
   * adalah indikator yang dapat dihitung, sama seperti gauge Ringkasan, supaya
   * kedua halaman tidak pernah menyebut proporsi yang berbeda.
   */
  reachedShare: number;
  sourceBreakdown: readonly NexusMonitoringSourceShare[];
  total: number;
};

export type NexusMonitoringSourceShare = {
  family: NexusMonitoringSourceFamily;
  href: string;
  indicators: number;
  label: string;
  records: number;
  share: number;
};

function summarize(
  measurements: readonly NexusIndicatorMeasurement[],
  period: NexusEvaluationPeriodId,
): NexusMonitoringSummary {
  const reached = measurements.filter((item) => item.status === "tercapai");
  /*
   * Indikator dihitung ketika capaiannya benar-benar dapat dibandingkan dengan
   * target. Indikator yang realisasinya diketahui tetapi targetnya belum ada
   * juga masuk ke sini supaya kartu, gauge, dan batang capaian menyebut
   * keadaan yang sama untuk indikator yang sama.
   */
  const notComputable = measurements.filter(
    (item) =>
      item.status === "belum-dapat-dihitung" ||
      item.status === "target-belum-tersedia",
  );
  const contributing = new Set<string>();
  const byFamily = new Map<
    NexusMonitoringSourceFamily,
    { indicators: number; records: Set<string> }
  >();
  /*
   * Rekam dihitung sekali per domain walaupun tertaut ke beberapa indikator,
   * sehingga ketiga angka perbandingan tetap berjumlah sama dengan rekam
   * tertaut yang berbeda.
   */
  const linkedIds = new Set<string>();
  const countedIds = new Set<string>();
  const verifyIds = new Set<string>();

  for (const measurement of measurements) {
    const family = measurement.evaluation.sourceFamily;
    const bucket = byFamily.get(family) ?? {
      indicators: 0,
      records: new Set<string>(),
    };
    bucket.indicators += 1;
    for (const record of measurement.contributing) {
      bucket.records.add(record.publicId);
      contributing.add(record.publicId);
    }
    byFamily.set(family, bucket);

    for (const item of measurement.linked) {
      const { publicId } = item.record;
      linkedIds.add(publicId);
      if (item.counting.state === "counted") countedIds.add(publicId);
      else if (item.counting.state === "needs-verification") {
        verifyIds.add(publicId);
      }
    }
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

  const computable = measurements.length - notComputable.length;
  // Rekam yang sudah dihitung pada satu indikator tidak lagi dihitung sebagai
  // rekam yang menunggu verifikasi pada indikator lain.
  const needsVerification = [...verifyIds].filter(
    (id) => !countedIds.has(id),
  ).length;

  return {
    computable,
    contributingRecords: contributing.size,
    counting: {
      counted: countedIds.size,
      linked: linkedIds.size,
      needsVerification,
      notCounted: linkedIds.size - countedIds.size - needsVerification,
    },
    measurements,
    notComputable: notComputable.length,
    notReached: computable - reached.length,
    period,
    reached: reached.length,
    reachedShare: computable === 0 ? 0 : reached.length / computable,
    sourceBreakdown,
    total: measurements.length,
  };
}

/** Ringkasan capaian satu kategori KM pada satu periode evaluasi. */
export function summarizeCategory(
  category: NexusKmIndicatorCategory,
  input: NexusMonitoringInput,
): NexusMonitoringSummary {
  return summarize(measureCategoryIndicators(category, input), input.period);
}
