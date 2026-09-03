import {
  NEXUS_EVALUATION_PERIOD,
  type NexusEvaluationPeriodId,
  nexusIndicatorHref,
  nexusMonitoringSourceHouses,
  nexusRisetEvaluations,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import {
  measureIndicator,
  type NexusIndicatorMeasurement,
  type NexusIndicatorStatus,
  nexusIndicatorStatusLabels,
  nexusIndicatorStatusTones,
  summarizeRiset,
} from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import {
  type NexusEvaluationQuarter,
  nexusQuarterLabels,
  nexusQuarterRangeLabels,
  nexusQuarters,
} from "@/components/nexus-monitoring/nexus-monitoring-quarter";
import {
  getNexusMonitoringRecords,
  type NexusMonitoringEvidenceState,
  type NexusMonitoringRecord,
} from "@/components/nexus-monitoring/nexus-monitoring-sources";
import type { MonitoringTone } from "@/components/nexus-monitoring/nexus-monitoring-ui";
import { publicationQuartileLabel } from "@/components/nexus-publications/nexus-publications-content";
import type { NexusKmIndicatorId } from "@/content/nexus-km-indicators";

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

export type MonitoringEvidenceRow = {
  businessDate: string;
  businessDateAvailable: boolean;
  contributors: readonly string[];
  evidenceLabel: string;
  evidenceState: NexusMonitoringEvidenceState;
  houseHref: string;
  houseLabel: string;
  id: string;
  notes: readonly string[];
  publicId: string;
  quality: "Lengkap" | "Perlu dilengkapi";
  subtitle: string;
  title: string;
  updatedAt: string;
};

export type MonitoringBreakdownView = {
  description: string;
  id: string;
  points: readonly { id: string; label: string; value: number }[];
  title: string;
};

export type MonitoringContributorView = {
  detail: string;
  href?: string;
  id: string;
  label: string;
  share: number;
  value: number;
};

export type MonitoringQuarterView =
  | {
      available: true;
      field: string;
      items: readonly {
        id: string;
        label: string;
        range: string;
        value: number;
      }[];
      undated: number;
    }
  | { available: false; field: string; reason: string };

export type MonitoringIndicatorView = {
  breakdowns: readonly MonitoringBreakdownView[];
  calculation: string;
  categoryLabel: string;
  contributorNote: string;
  contributors: readonly MonitoringContributorView[];
  definition: string;
  difference: number | null;
  evidence: readonly MonitoringEvidenceRow[];
  /** Syarat eviden menurut workbook KM 2026; `null` bila belum tercatat. */
  evidenceRequirement: string | null;
  houseHref: string;
  houseLabel: string;
  id: NexusKmIndicatorId;
  insights: readonly string[];
  label: string;
  nextHref?: string;
  number: number;
  options: readonly { href: string; id: NexusKmIndicatorId; label: string }[];
  period: NexusEvaluationPeriodId;
  previousHref?: string;
  progressPercent: number | null;
  purpose: string;
  quarterly: MonitoringQuarterView;
  realization: number | null;
  status: NexusIndicatorStatus;
  statusLabel: string;
  statusTone: MonitoringTone;
  target: number | null;
  targetReference: string;
  unit: string;
  workbook: {
    previousPeriodLabel: string;
    previousPeriodValue: number | null;
    quarterly: readonly (number | null)[];
    reference: string;
  };
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

function countBy(
  records: readonly NexusMonitoringRecord[],
  resolve: (record: NexusMonitoringRecord) => string,
) {
  const counts = new Map<string, number>();
  for (const record of records) {
    const key = resolve(record);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value], index) => ({
      id: `${index}-${label}`,
      label,
      value,
    }))
    .sort((first, second) => second.value - first.value);
}

function limitPoints(
  points: readonly { id: string; label: string; value: number }[],
  limit: number,
) {
  if (points.length <= limit) return points;
  const visible = points.slice(0, limit);
  const rest = points.slice(limit);
  const restTotal = rest.reduce((sum, point) => sum + point.value, 0);
  return [
    ...visible,
    { id: "lainnya", label: `${rest.length} wadah lainnya`, value: restTotal },
  ];
}

function evidenceBreakdown(
  records: readonly NexusMonitoringRecord[],
): MonitoringBreakdownView {
  return {
    description:
      "Keadaan dokumen atau tautan bukti yang tercatat pada rekam resmi pembentuk realisasi.",
    id: "bukti",
    points: countBy(records, (record) => record.evidenceLabel),
    title: "Kelengkapan Bukti",
  };
}

function publicationBreakdowns(
  records: readonly NexusMonitoringRecord[],
): readonly MonitoringBreakdownView[] {
  const publications = records.filter(
    (record) => record.family === "publications",
  );
  const breakdowns: MonitoringBreakdownView[] = [
    {
      description:
        "Jumlah rekam resmi pada tiap jurnal atau prosiding yang tercatat sumber.",
      id: "wadah",
      points: limitPoints(
        countBy(publications, (record) => record.subtitle || "Belum tercatat"),
        6,
      ),
      title: "Wadah Terbit",
    },
  ];

  const quartilePoints = countBy(publications, (record) =>
    record.family === "publications"
      ? publicationQuartileLabel(record.publication)
      : "Tidak berlaku",
  );
  if (quartilePoints.length > 1 || quartilePoints[0]?.label.startsWith("Q")) {
    breakdowns.push({
      description:
        "Kuartil adalah pemeringkatan reputasi jurnal (Q1–Q4), bukan triwulan evaluasi.",
      id: "kuartil",
      points: quartilePoints,
      title: "Kuartil Jurnal",
    });
  }

  const typePoints = countBy(publications, (record) =>
    record.family === "publications" ? record.publication.type : "—",
  );
  if (typePoints.length > 1) {
    breakdowns.push({
      description:
        "Bentuk karya menurut metadata bibliografis rekam resmi pembentuk realisasi.",
      id: "bentuk",
      points: typePoints,
      title: "Bentuk Karya",
    });
  }

  breakdowns.push(evidenceBreakdown(records));
  return breakdowns;
}

function intellectualPropertyBreakdowns(
  records: readonly NexusMonitoringRecord[],
): readonly MonitoringBreakdownView[] {
  return [
    {
      description:
        "Bentuk perlindungan yang tercatat pada rekam resmi, bukan dugaan dari judulnya.",
      id: "perlindungan",
      points: countBy(records, (record) => record.subtitle || "Belum tercatat"),
      title: "Bentuk Perlindungan",
    },
    {
      description:
        "Ketersediaan nomor registrasi pada rekam resmi pembentuk realisasi.",
      id: "registrasi",
      points: countBy(records, (record) =>
        record.family === "intellectual-property" &&
        record.intellectualProperty.registrationNumber
          ? "Sudah tercatat"
          : "Belum tercatat",
      ),
      title: "Nomor Registrasi",
    },
    evidenceBreakdown(records),
  ];
}

function contractBreakdowns(
  records: readonly NexusMonitoringRecord[],
): readonly MonitoringBreakdownView[] {
  return [
    {
      description:
        "Skema pendanaan atau program yang tercatat pada rekam resmi kontrak.",
      id: "skema",
      points: countBy(records, (record) =>
        record.family === "contracts"
          ? (record.contract.scheme ?? "Belum tercatat")
          : "Belum tercatat",
      ),
      title: "Skema Kontrak",
    },
    {
      description: "Status rekam kontrak menurut catatan rumah data resmi.",
      id: "status",
      points: countBy(records, (record) =>
        record.family === "contracts" ? record.contract.recordStatus : "—",
      ),
      title: "Status Rekam",
    },
    evidenceBreakdown(records),
  ];
}

function activityBreakdowns(
  records: readonly NexusMonitoringRecord[],
): readonly MonitoringBreakdownView[] {
  return [
    {
      description:
        "Jenis kegiatan yang tercatat pada rekam resmi pembentuk realisasi.",
      id: "jenis",
      points: countBy(records, (record) => record.subtitle || "Belum tercatat"),
      title: "Jenis Kegiatan",
    },
    evidenceBreakdown(records),
  ];
}

function breakdownsFor(
  measurement: NexusIndicatorMeasurement,
): readonly MonitoringBreakdownView[] {
  if (measurement.records.length === 0) return [];

  switch (measurement.evaluation.sourceFamily) {
    case "publications":
      return publicationBreakdowns(measurement.records);
    case "intellectual-property":
      return intellectualPropertyBreakdowns(measurement.records);
    case "contracts":
      return contractBreakdowns(measurement.records);
    default:
      return activityBreakdowns(measurement.records);
  }
}

function contributorsFor(
  measurement: NexusIndicatorMeasurement,
): readonly MonitoringContributorView[] {
  const counts = new Map<string, { memberId?: string; value: number }>();

  for (const record of measurement.records) {
    for (const contributor of record.contributors) {
      const entry = counts.get(contributor.name) ?? {
        memberId: contributor.memberId,
        value: 0,
      };
      entry.value += 1;
      entry.memberId = entry.memberId ?? contributor.memberId;
      counts.set(contributor.name, entry);
    }
  }

  const total = measurement.records.length;
  const house =
    nexusMonitoringSourceHouses[measurement.evaluation.sourceFamily];

  return [...counts.entries()]
    .sort((first, second) => second[1].value - first[1].value)
    .slice(0, 6)
    .map(([name, entry], index) => ({
      detail: entry.memberId
        ? "Anggota CoE BHT"
        : "Nama sesuai catatan sumber, belum tertaut anggota",
      href: entry.memberId
        ? `${house.href}?member=${encodeURIComponent(entry.memberId)}`
        : undefined,
      id: `${index}-${name}`,
      label: name,
      share: total === 0 ? 0 : entry.value / total,
      value: entry.value,
    }));
}

function evidenceRows(
  measurement: NexusIndicatorMeasurement,
): readonly MonitoringEvidenceRow[] {
  return measurement.records.map((record) => ({
    businessDate: record.businessDate.available
      ? record.businessDate.label
      : "Belum tercatat",
    businessDateAvailable: record.businessDate.available,
    contributors: record.contributors.map((contributor) => contributor.name),
    evidenceLabel: record.evidenceLabel,
    evidenceState: record.evidenceState,
    houseHref: record.house.href,
    houseLabel: record.house.label,
    id: record.id,
    notes: record.notes,
    publicId: record.publicId,
    quality: record.quality,
    subtitle: record.subtitle,
    title: record.title,
    updatedAt: record.updatedAt,
  }));
}

function quarterView(
  measurement: NexusIndicatorMeasurement,
): MonitoringQuarterView {
  const { quarterly } = measurement;
  if (!quarterly.available) {
    return {
      available: false,
      field: quarterly.field,
      reason: quarterly.reason,
    };
  }

  return {
    available: true,
    field: quarterly.field,
    items: nexusQuarters.map((quarter: NexusEvaluationQuarter) => ({
      id: nexusQuarterLabels[quarter],
      label: nexusQuarterLabels[quarter],
      range: nexusQuarterRangeLabels[quarter],
      value: quarterly.counts[quarter],
    })),
    undated: quarterly.undated,
  };
}

function insightsFor(
  measurement: NexusIndicatorMeasurement,
): readonly string[] {
  const insights: string[] = [];
  const { evaluation, realization, records, status } = measurement;
  const target = evaluation.target.value;
  const id = evaluation.indicator.id;

  if (realization !== null && target !== null) {
    if (status === "tercapai") {
      insights.push(
        `Target ${id} tercapai: realisasi ${realization} dari target ${target}.`,
      );
      if (realization > target) {
        insights.push(
          `Realisasi melampaui target sebanyak ${realization - target}.`,
        );
      }
    } else if (status === "belum-ada-realisasi") {
      insights.push(
        `Belum ada rekam resmi ${id} pada periode ${measurement.period}; target periode ini ${target}.`,
      );
    } else {
      insights.push(
        `Realisasi ${id} baru ${realization} dari target ${target}; kurang ${target - realization}.`,
      );
    }
  }

  const withoutPublicEvidence = records.filter(
    (record) => record.evidenceState !== "public",
  ).length;
  if (withoutPublicEvidence > 0) {
    insights.push(
      `${withoutPublicEvidence} rekam resmi belum memiliki tautan bukti yang dapat dibuka umum.`,
    );
  }

  const needsMetadata = records.filter(
    (record) => record.quality === "Perlu dilengkapi",
  ).length;
  if (needsMetadata > 0) {
    insights.push(
      `${needsMetadata} rekam resmi masih menunggu pelengkapan metadata.`,
    );
  }

  if (measurement.quarterly.available) {
    const counts = measurement.quarterly.counts;
    const best = nexusQuarters.reduce((current, quarter) =>
      counts[quarter] > counts[current] ? quarter : current,
    );
    if (counts[best] > 0) {
      insights.push(
        `${nexusQuarterLabels[best]} menyumbang ${counts[best]} dari ${records.length} rekam menurut ${measurement.quarterly.field.toLocaleLowerCase("id-ID")}.`,
      );
    }
  }

  return insights;
}

export function buildIndicatorView(
  indicatorId: NexusKmIndicatorId,
  period: NexusEvaluationPeriodId = NEXUS_EVALUATION_PERIOD,
): MonitoringIndicatorView | undefined {
  const measurement = measureIndicator(indicatorId, period);
  if (!measurement) return undefined;

  const { evaluation } = measurement;
  const house = nexusMonitoringSourceHouses[evaluation.sourceFamily];
  const order = nexusRisetEvaluations.findIndex(
    (item) => item.indicator.id === indicatorId,
  );
  const previous = order > 0 ? nexusRisetEvaluations[order - 1] : undefined;
  const next =
    order >= 0 && order < nexusRisetEvaluations.length - 1
      ? nexusRisetEvaluations[order + 1]
      : undefined;

  return {
    breakdowns: breakdownsFor(measurement),
    calculation: evaluation.calculation,
    categoryLabel: evaluation.indicator.category,
    contributorNote:
      evaluation.sourceFamily === "publications" ||
      evaluation.sourceFamily === "intellectual-property"
        ? "Nama diambil dari rekam resmi. Hanya nama yang sudah tertaut anggota CoE BHT yang dapat dibuka ke daftar data resminya."
        : "Nama pihak diambil apa adanya dari rekam resmi dan belum tentu merupakan anggota CoE BHT.",
    contributors: contributorsFor(measurement),
    definition: evaluation.definition,
    difference: measurement.difference,
    evidence: evidenceRows(measurement),
    evidenceRequirement: evaluation.evidence.value,
    houseHref: house.href,
    houseLabel: house.label,
    id: evaluation.indicator.id,
    insights: insightsFor(measurement),
    label: evaluation.indicator.label,
    nextHref: next ? nexusIndicatorHref(next.indicator.id) : undefined,
    number: evaluation.indicator.number,
    options: nexusRisetEvaluations.map((item) => ({
      href: nexusIndicatorHref(item.indicator.id),
      id: item.indicator.id,
      label: `${item.indicator.id} · ${item.indicator.label}`,
    })),
    period: measurement.period,
    previousHref: previous
      ? nexusIndicatorHref(previous.indicator.id)
      : undefined,
    progressPercent:
      measurement.progress === null
        ? null
        : Math.round(measurement.progress * 100),
    purpose: evaluation.purpose,
    quarterly: quarterView(measurement),
    realization: measurement.realization,
    status: measurement.status,
    statusLabel: nexusIndicatorStatusLabels[measurement.status],
    statusTone: nexusIndicatorStatusTones[measurement.status],
    target: evaluation.target.value,
    targetReference: evaluation.target.reference,
    unit: evaluation.unit,
    workbook: {
      previousPeriodLabel: evaluation.workbookNote.previousPeriodLabel,
      previousPeriodValue: evaluation.workbookNote.previousPeriodValue,
      quarterly: evaluation.workbookNote.quarterly,
      reference: evaluation.workbookNote.reference,
    },
  };
}
