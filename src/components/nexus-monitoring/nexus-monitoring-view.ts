import {
  academicMentorNames,
  type OfficialAcademicRecord,
} from "@/components/nexus-academic/nexus-academic-content";
import type { OfficialActivityRecord } from "@/components/nexus-activities/nexus-activities-content";
import {
  contractProposalPrimaryParty,
  type OfficialContractProposalRecord,
} from "@/components/nexus-contract-proposals/nexus-contract-proposals-content";
import {
  intellectualPropertyCreatorNames,
  type OfficialIntellectualProperty,
} from "@/components/nexus-intellectual-property/nexus-intellectual-property-content";
import {
  NEXUS_EVALUATION_PERIOD,
  type NexusEvaluationPeriodId,
  nexusCategoryEvaluations,
  nexusDomainHref,
  nexusIndicatorHref,
  nexusMonitoringSourceHouses,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import {
  measureIndicator,
  type NexusIndicatorMeasurement,
  type NexusIndicatorStatus,
  nexusIndicatorStatusLabels,
  nexusIndicatorStatusTones,
  summarizeCategory,
} from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import {
  type NexusEvaluationQuarter,
  nexusQuarterLabels,
  nexusQuarterRangeLabels,
  nexusQuarters,
} from "@/components/nexus-monitoring/nexus-monitoring-quarter";
import {
  getNexusMonitoringRecords,
  monitoringRecordQuarter,
  type NexusMonitoringEvidenceState,
  type NexusMonitoringRecord,
} from "@/components/nexus-monitoring/nexus-monitoring-sources";
import type { MonitoringTone } from "@/components/nexus-monitoring/nexus-monitoring-ui";
import {
  type OfficialPublication,
  publicationAuthorNames,
  publicationQuartileLabel,
} from "@/components/nexus-publications/nexus-publications-content";
import type {
  NexusKmIndicatorCategory,
  NexusKmIndicatorId,
} from "@/content/nexus-km-indicators";

/**
 * Bentuk tampilan untuk ikhtisar satu domain KM dan untuk rincian satu
 * indikator. Keduanya berangkat dari pengukuran yang sama supaya angka pada
 * ikhtisar domain dan pada halaman rinciannya tidak pernah berbeda.
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
      `Target evaluasi belum ditetapkan untuk ${withoutTarget.join(", ")}, sehingga capaiannya belum dapat dihitung.`,
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

/**
 * Satu triwulan pada sebaran realisasi. Nilainya adalah jumlah rekam resmi yang
 * tanggal bisnisnya jatuh pada triwulan tersebut.
 */
export type MonitoringQuarterPoint = {
  id: NexusEvaluationQuarter;
  label: string;
  rangeLabel: string;
  value: number;
};

/**
 * Sebaran realisasi per triwulan. Triwulan hanya dapat dibentuk ketika rumah
 * data resmi mencatat tanggal peristiwanya; waktu pembaruan dan waktu tinjauan
 * tidak pernah dipakai sebagai penggantinya karena keduanya menerangkan
 * pencatatan, bukan peristiwanya.
 */
export type MonitoringQuarterlyView =
  | {
      available: true;
      /** Nama tanggal yang menentukan triwulan, misalnya Tanggal kegiatan. */
      field: string;
      points: readonly MonitoringQuarterPoint[];
      /** Rekam yang tanggalnya belum tercatat sehingga di luar keempat triwulan. */
      undated: number;
    }
  | { available: false; field: string; reason: string };

/**
 * Satu bidang metadata rekam. Bidang panjang seperti daftar nama atau nama
 * wadah terbit menempati satu baris penuh supaya nilainya tidak terpotong.
 */
export type MonitoringRecordField = {
  label: string;
  value: string;
  wide?: boolean;
};

/** Satu rekam resmi yang membentuk realisasi, siap ditampilkan apa adanya. */
export type MonitoringRecordView = {
  /** Tanggal peristiwanya; kosong ketika sumbernya belum mencatatnya. */
  businessDateLabel: string | null;
  evidenceLabel: string;
  evidenceTone: MonitoringTone;
  evidenceUrl: string | null;
  evidenceNote: string | null;
  houseHref: string;
  linkNote: string;
  provenance: readonly {
    source: string;
    identifier: string;
    capturedAt: string;
    note?: string;
  }[];
  review: {
    decision: string;
    note: string;
    reviewedAt: string;
    reviewer: string;
  };
  /** Rumah data resmi asal rekam; dapat berbeda dari rumah utama indikator. */
  houseLabel: string;
  id: string;
  /** Bidang penting rekam menurut rumah data asalnya. */
  metadata: readonly MonitoringRecordField[];
  publicId: string;
  quality: "Lengkap" | "Perlu dilengkapi";
  quarter: NexusEvaluationQuarter | null;
  quarterLabel: string | null;
  subtitle: string;
  title: string;
  /** Waktu rekam terakhir diperbarui pada rumah Data Resmi. */
  updatedAt: string;
};

/** Indikator sebelum atau sesudahnya di dalam domain yang sama. */
export type MonitoringIndicatorNeighbour = {
  href: string;
  id: NexusKmIndicatorId;
  label: string;
};

export type MonitoringIndicatorView = {
  /** Nama tanggal yang menentukan triwulan sebuah rekam. */
  businessDateLabel: string;
  calculation: string;
  category: NexusKmIndicatorCategory;
  definition: string;
  /** Selisih realisasi terhadap target; nilai negatif berarti masih kurang. */
  difference: number | null;
  domainHref: string;
  /** Syarat eviden menurut workbook; kosong ketika kolomnya memang belum diisi. */
  evidenceValue: string | null;
  houseHref: string;
  houseLabel: string;
  id: NexusKmIndicatorId;
  label: string;
  next: MonitoringIndicatorNeighbour | null;
  period: NexusEvaluationPeriodId;
  previous: MonitoringIndicatorNeighbour | null;
  progressPercent: number | null;
  purpose: string;
  quarterly: MonitoringQuarterlyView;
  realization: number | null;
  records: readonly MonitoringRecordView[];
  status: NexusIndicatorStatus;
  statusLabel: string;
  statusTone: MonitoringTone;
  target: number | null;
  targetLiteral: string | null;
  /** Alasan realisasi belum dapat dihitung; kosong ketika memang terhitung. */
  unavailableReason: string | null;
  unit: string | null;
};

const evidenceTones: Record<NexusMonitoringEvidenceState, MonitoringTone> = {
  internal: "neutral",
  public: "success",
  unrecorded: "waiting",
};

function quarterPoints(
  counts: Record<NexusEvaluationQuarter, number>,
): readonly MonitoringQuarterPoint[] {
  return nexusQuarters.map((quarter) => ({
    id: quarter,
    label: nexusQuarterLabels[quarter],
    rangeLabel: nexusQuarterRangeLabels[quarter],
    value: counts[quarter],
  }));
}

function quarterlyView(
  measurement: NexusIndicatorMeasurement,
): MonitoringQuarterlyView {
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
    points: quarterPoints(quarterly.counts),
    undated: quarterly.undated,
  };
}

/** Bidang yang hanya ikut tampil ketika sumbernya memang mengisinya. */
function optionalField(
  label: string,
  value: string | number | undefined,
  wide = false,
): readonly MonitoringRecordField[] {
  const text = typeof value === "number" ? String(value) : value?.trim();
  return text ? [{ label, value: text, wide }] : [];
}

/** Bidang inti yang tetap tampil walau kosong, supaya ketiadaannya terbaca. */
function requiredField(
  label: string,
  value: string | number | undefined,
  wide = false,
): MonitoringRecordField {
  const text = typeof value === "number" ? String(value) : value?.trim();
  return { label, value: text || "Belum tercatat", wide };
}

function publicationFields(
  publication: OfficialPublication,
): readonly MonitoringRecordField[] {
  return [
    requiredField("Penulis", publicationAuthorNames(publication), true),
    requiredField("Nama jurnal / prosiding", publication.venue, true),
    requiredField("Jenis publikasi", publication.type),
    requiredField("Tahun terbit", publication.year),
    requiredField("Kuartil jurnal", publicationQuartileLabel(publication)),
    ...optionalField("DOI", publication.doi),
    ...(publication.citations === null
      ? []
      : [
          {
            label: publication.citationProvider
              ? `Sitasi (${publication.citationProvider})`
              : "Sitasi",
            value: String(publication.citations),
          },
        ]),
  ];
}

function activityFields(
  activity: OfficialActivityRecord,
): readonly MonitoringRecordField[] {
  return [
    requiredField("Jenis kegiatan", activity.kind),
    requiredField("Kelompok", activity.group),
    requiredField("Pihak utama", activity.primaryParty, true),
    requiredField("Unit pemilik", activity.ownerUnit),
    requiredField("Status rekam", activity.recordStatus),
    ...optionalField("Penyelenggara", activity.organization),
    ...optionalField("Lokasi", activity.location),
    ...optionalField("Pendanaan", activity.funding),
    ...optionalField("Nomor referensi", activity.referenceNumber),
  ];
}

function intellectualPropertyFields(
  record: OfficialIntellectualProperty,
): readonly MonitoringRecordField[] {
  return [
    requiredField("Jenis perlindungan", record.protection),
    requiredField("Pencipta", intellectualPropertyCreatorNames(record), true),
    requiredField("Nomor pencatatan", record.registrationNumber),
    requiredField("Lembaga pencatatan", record.registry),
    requiredField("Tahun", record.year),
  ];
}

function contractFields(
  contract: OfficialContractProposalRecord,
): readonly MonitoringRecordField[] {
  const period =
    contract.contractStart && contract.contractEnd
      ? `${contract.contractStart} – ${contract.contractEnd}`
      : contract.contractStart;

  return [
    requiredField("Jenis", contract.kind),
    requiredField("Kelompok", contract.group),
    requiredField(
      "Pihak utama",
      contractProposalPrimaryParty(contract) ?? undefined,
      true,
    ),
    requiredField("Unit pemilik", contract.ownerUnit),
    requiredField("Status rekam", contract.recordStatus),
    ...optionalField("Skema", contract.scheme),
    ...optionalField("Pemberi dana", contract.funder),
    ...optionalField("Periode kontrak", period),
    ...optionalField("Nomor referensi", contract.referenceNumber),
  ];
}

function academicFields(
  academic: OfficialAcademicRecord,
): readonly MonitoringRecordField[] {
  return [
    requiredField("Kegiatan", academic.activity),
    requiredField("Pembimbing", academicMentorNames(academic), true),
    requiredField("Kode peserta", academic.participantCode),
    requiredField("Tahun", academic.year),
    ...optionalField("Program studi", academic.programStudy),
    ...optionalField("Durasi", academic.duration),
  ];
}

/**
 * Bidang penting sebuah rekam menurut rumah data asalnya. Daftarnya dibentuk
 * per rumpun karena bidang yang berarti memang berbeda; Monitoring hanya
 * menampilkan ulang nilai rekam resmi dan tidak pernah menyusun nilai baru.
 */
function recordMetadata(
  record: NexusMonitoringRecord,
): readonly MonitoringRecordField[] {
  switch (record.family) {
    case "publications":
      return publicationFields(record.publication);
    case "activities":
      return activityFields(record.activity);
    case "intellectual-property":
      return intellectualPropertyFields(record.intellectualProperty);
    case "contracts":
      return contractFields(record.contract);
    default:
      return academicFields(record.academic);
  }
}

function recordView(
  record: NexusMonitoringRecord,
  indicatorId: NexusKmIndicatorId,
): MonitoringRecordView {
  const { businessDate } = record;
  const quarter = monitoringRecordQuarter(record);
  const source =
    record.family === "publications"
      ? record.publication
      : record.family === "activities"
        ? record.activity
        : record.family === "contracts"
          ? record.contract
          : record.family === "academic"
            ? record.academic
            : record.intellectualProperty;
  const rawUrl =
    record.family === "publications"
      ? record.publication.publisherUrl
      : record.family === "intellectual-property"
        ? record.intellectualProperty.documentUrl
        : "evidenceUrl" in source
          ? source.evidenceUrl
          : undefined;
  const evidenceUrl =
    record.evidenceState === "public" &&
    typeof rawUrl === "string" &&
    /^https?:\/\//i.test(rawUrl)
      ? rawUrl
      : null;
  const evidenceNote =
    "evidenceNote" in source
      ? source.evidenceNote
      : "documentNote" in source
        ? source.documentNote
        : null;

  return {
    businessDateLabel: businessDate.available ? businessDate.label : null,
    evidenceLabel: record.evidenceLabel,
    evidenceTone: evidenceTones[record.evidenceState],
    evidenceUrl,
    evidenceNote: typeof evidenceNote === "string" ? evidenceNote : null,
    houseHref: record.house.href,
    linkNote:
      source.kmLinks.find((link) => link.indicator.id === indicatorId)?.note ??
      "Kaitan indikator tercatat pada rekam resmi.",
    provenance: source.provenance,
    review: source.review,
    houseLabel: record.house.label,
    id: record.id,
    metadata: recordMetadata(record),
    publicId: record.publicId,
    quality: record.quality,
    quarter,
    quarterLabel:
      quarter !== null
        ? nexusQuarterLabels[quarter]
        : businessDate.available
          ? "Di luar tahun evaluasi"
          : "Belum terpetakan",
    subtitle: record.subtitle,
    title: record.title,
    updatedAt: record.updatedAt,
  };
}

/**
 * Indikator tetangga di dalam domain yang sama, mengikuti urutan registry KM
 * sehingga sama dengan urutan pada tabel ikhtisar domain.
 */
function neighbours(
  category: NexusKmIndicatorCategory,
  id: NexusKmIndicatorId,
): {
  next: MonitoringIndicatorNeighbour | null;
  previous: MonitoringIndicatorNeighbour | null;
} {
  const siblings = nexusCategoryEvaluations(category);
  const index = siblings.findIndex(
    (evaluation) => evaluation.indicator.id === id,
  );

  const at = (position: number): MonitoringIndicatorNeighbour | null => {
    const evaluation = siblings[position];
    if (!evaluation) return null;

    return {
      href: nexusIndicatorHref(evaluation.indicator.id),
      id: evaluation.indicator.id,
      label: evaluation.indicator.label,
    };
  };

  return { next: at(index + 1), previous: at(index - 1) };
}

/**
 * Rincian satu indikator KM. Seluruh angkanya berasal dari pengukuran yang
 * sama dengan ikhtisar domain, dan daftar rekamnya adalah rekam yang memang
 * membentuk realisasi, bukan salinan rumah data resmi.
 */
export function buildIndicatorView(
  indicatorId: NexusKmIndicatorId,
  period: NexusEvaluationPeriodId = NEXUS_EVALUATION_PERIOD,
  records: readonly NexusMonitoringRecord[] = getNexusMonitoringRecords(),
): MonitoringIndicatorView | undefined {
  const measurement = measureIndicator(indicatorId, period, records);
  if (!measurement) return undefined;

  const { evaluation } = measurement;
  const { category, id, label } = evaluation.indicator;
  const house = nexusMonitoringSourceHouses[evaluation.sourceFamily];
  const { next, previous } = neighbours(category, id);

  return {
    businessDateLabel: evaluation.businessDateLabel,
    calculation: evaluation.calculation,
    category,
    definition: evaluation.definition,
    difference: measurement.difference,
    domainHref: nexusDomainHref(category),
    evidenceValue: evaluation.evidence.value,
    houseHref: house.href,
    houseLabel: house.label,
    id,
    label,
    next,
    period: measurement.period,
    previous,
    progressPercent:
      measurement.progress === null
        ? null
        : Math.round(measurement.progress * 100),
    purpose: evaluation.purpose,
    quarterly: quarterlyView(measurement),
    realization: measurement.realization,
    records: measurement.records.map((record) => recordView(record, id)),
    status: measurement.status,
    statusLabel: nexusIndicatorStatusLabels[measurement.status],
    statusTone: nexusIndicatorStatusTones[measurement.status],
    target: evaluation.target.value,
    targetLiteral: evaluation.target.literal,
    unavailableReason:
      evaluation.realization.kind === "unavailable"
        ? evaluation.realization.reason
        : null,
    unit: evaluation.unit,
  };
}
