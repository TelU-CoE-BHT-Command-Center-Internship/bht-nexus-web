import {
  type MetadataCompletionFieldKey,
  type MetadataCompletionProposal,
  metadataCompletionFieldLabels,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import {
  kmIndicator,
  type NexusKmIndicator,
} from "@/content/nexus-km-indicators";

type ActivityIndicatorId =
  | "KM-20"
  | "KM-21"
  | "KM-22"
  | "KM-23"
  | "KM-24"
  | "KM-25"
  | "KM-26"
  | "KM-27";

export type ActivityGroup = "Bisnis" | "Pengabdian masyarakat";

export type ActivityKind =
  | "Keterlibatan Unit Bisnis"
  | "Pembinaan UMKM / Komunitas"
  | "Pengelolaan Konferensi Internasional"
  | "Kontrak Non-Riset"
  | "Community Services"
  | "Proposal Abdimas DRTPM"
  | "Proposal Abdimas SDGs"
  | "Pengelolaan Jurnal Ilmiah";

type ActivityQuality = "Lengkap" | "Perlu dilengkapi";
type ActivityEvidenceStatus = "internal" | "public" | "unrecorded";

export type ActivityCompletionFieldKey = MetadataCompletionFieldKey;
export const activityFieldLabels = metadataCompletionFieldLabels;
export type ActivityProposal = MetadataCompletionProposal;

type ActivityProvenance = {
  capturedAt: string;
  identifier: string;
  note?: string;
  source: string;
};

type ActivityKmLink = {
  indicator: NexusKmIndicator;
  note: string;
};

export type OfficialActivityRecord = {
  evaluationPeriod: string;
  eventDate?: string;
  evidenceNote: string;
  evidenceStatus: ActivityEvidenceStatus;
  evidenceUrl?: string;
  funding?: string;
  group: ActivityGroup;
  id: string;
  issn?: string;
  journalVolume?: string;
  kind: ActivityKind;
  kmLinks: ActivityKmLink[];
  location?: string;
  missingFields: ActivityCompletionFieldKey[];
  organization?: string;
  ownerUnit: string;
  primaryParty: string;
  provenance: ActivityProvenance[];
  publicId: string;
  publicationFrequency?: string;
  quality: ActivityQuality;
  recordStatus: "Aktif" | "Diajukan" | "Dikelola" | "Tercatat";
  review: {
    candidateId: string;
    decision: "Dihubungkan ke rekam resmi" | "Disetujui sebagai data baru";
    note: string;
    reviewedAt: string;
    reviewer: string;
  };
  role?: string;
  scheme?: string;
  targetGroup?: string;
  team?: string;
  /** Tidak dimiliki worksheet KM-20 dan KM-21. */
  title?: string;
  updatedAt: string;
};

export type NexusActivitiesContent = {
  description: string;
  officialNote: string;
  records: OfficialActivityRecord[];
  title: string;
  updatedAt: string;
};

const capturedAt = "17 Agu 2026";
const evaluationPeriod = "2026";

const indicatorNotes: Record<ActivityIndicatorId, string> = {
  "KM-20":
    "Keterlibatan dicatat bersama peran, unit bisnis, dan bukti layanan yang sesuai kompetensi CoE.",
  "KM-21":
    "Pembinaan dihitung ketika pembina, UMKM atau komunitas sasaran, dan bukti kegiatan dapat diperiksa.",
  "KM-22":
    "Pengelolaan konferensi internasional dicatat bersama nama acara, tanggal, tempat, dan bukti pendukung.",
  "KM-23":
    "Kontrak non-riset dicatat terpisah dari kontrak riset dan dilengkapi skema, tim, sasaran, serta bukti.",
  "KM-24":
    "Community services dicatat bersama skema, tim pelaksana, masyarakat sasaran, dan bukti kegiatan.",
  "KM-25":
    "Proposal abdimas DRTPM dihitung setelah bentuk pengajuan dan bukti periodenya dapat diperiksa.",
  "KM-26":
    "Proposal abdimas terkait SDGs dihitung setelah kaitan program dan bukti pengajuannya dapat diperiksa.",
  "KM-27":
    "Pengelolaan jurnal dicatat bersama identitas jurnal, volume, ISSN, frekuensi terbit, dan bukti.",
};

const evidenceNotes: Record<ActivityEvidenceStatus, string> = {
  internal:
    "Dokumen sumber tersimpan secara internal dan hanya dapat dibuka oleh pengguna yang berwenang.",
  public: "Dokumen sumber dapat dibuka melalui tautan yang tercatat.",
  unrecorded:
    "Sumber belum mencatat tautan atau lokasi dokumen untuk rekam ini.",
};

type ActivitySeed = Omit<
  OfficialActivityRecord,
  | "evaluationPeriod"
  | "evidenceNote"
  | "id"
  | "kmLinks"
  | "missingFields"
  | "ownerUnit"
  | "quality"
  | "review"
  | "updatedAt"
> & {
  indicatorId: ActivityIndicatorId;
};

/**
 * Struktur bidang mengikuti worksheet KM-20 sampai KM-27. Nilai operasional
 * dibuat netral karena repository frontend bersifat publik; tidak ada nama,
 * mitra, nominal, atau tautan penyimpanan privat dari workbook stakeholder.
 */
const seeds: readonly ActivitySeed[] = [
  {
    evidenceStatus: "internal",
    group: "Bisnis",
    indicatorId: "KM-20",
    kind: "Keterlibatan Unit Bisnis",
    organization: "Unit Bisnis A",
    primaryParty: "Pengelola A",
    publicId: "KGT-2026-0020",
    recordStatus: "Aktif",
    role: "Anggota",
    provenance: [
      {
        capturedAt,
        identifier: "KGT-SRC-020",
        source: "Data keterlibatan unit bisnis",
      },
    ],
  },
  {
    evidenceStatus: "unrecorded",
    group: "Bisnis",
    indicatorId: "KM-21",
    kind: "Pembinaan UMKM / Komunitas",
    organization: "Komunitas A",
    primaryParty: "Pembina A",
    publicId: "KGT-2026-0021",
    recordStatus: "Tercatat",
    provenance: [
      {
        capturedAt,
        identifier: "KGT-SRC-021",
        note: "Identitas pembinaan tersedia, tetapi lokasi bukti belum tercatat.",
        source: "Data pembinaan komunitas",
      },
    ],
  },
  {
    eventDate: "2026-09-18",
    evidenceStatus: "internal",
    group: "Pengabdian masyarakat",
    indicatorId: "KM-22",
    kind: "Pengelolaan Konferensi Internasional",
    location: "Bandung",
    primaryParty: "Tim Acara A",
    publicId: "KGT-2026-0022",
    recordStatus: "Dikelola",
    provenance: [
      {
        capturedAt,
        identifier: "KGT-SRC-022",
        source: "Data kegiatan internasional",
      },
    ],
    title: "Konferensi Internasional A",
  },
  {
    evidenceStatus: "internal",
    funding: "Rp100.000.000",
    group: "Pengabdian masyarakat",
    indicatorId: "KM-23",
    kind: "Kontrak Non-Riset",
    primaryParty: "Tim Pelaksana A",
    publicId: "KGT-2026-0023",
    recordStatus: "Aktif",
    scheme: "Program Non-Riset A",
    targetGroup: "Mitra Layanan A",
    team: "Tim Pelaksana A",
    provenance: [
      {
        capturedAt,
        identifier: "KGT-SRC-023",
        source: "Data program non-riset",
      },
    ],
    title: "Program Layanan Non-Riset A",
  },
  {
    evidenceStatus: "internal",
    funding: "Rp25.000.000",
    group: "Pengabdian masyarakat",
    indicatorId: "KM-24",
    kind: "Community Services",
    primaryParty: "Tim Pengabdian A",
    publicId: "KGT-2026-0024",
    recordStatus: "Tercatat",
    scheme: "Program Community Services A",
    targetGroup: "Masyarakat Sasaran A",
    team: "Tim Pengabdian A",
    provenance: [
      {
        capturedAt,
        identifier: "KGT-SRC-024",
        source: "Data pengabdian masyarakat",
      },
    ],
    title: "Program Pengabdian Masyarakat A",
  },
  {
    evidenceStatus: "unrecorded",
    group: "Pengabdian masyarakat",
    indicatorId: "KM-25",
    kind: "Proposal Abdimas DRTPM",
    primaryParty: "Pengusul Abdimas A",
    publicId: "KGT-2026-0025",
    recordStatus: "Diajukan",
    scheme: "Skema Abdimas DRTPM A",
    targetGroup: "Masyarakat Sasaran B",
    team: "Tim Pengusul A",
    provenance: [
      {
        capturedAt,
        identifier: "KGT-SRC-025",
        note: "Bukti pengajuan belum tercatat pada sumber.",
        source: "Data proposal abdimas",
      },
    ],
    title: "Proposal Abdimas DRTPM A",
  },
  {
    evidenceStatus: "internal",
    group: "Pengabdian masyarakat",
    indicatorId: "KM-26",
    kind: "Proposal Abdimas SDGs",
    primaryParty: "Pengusul Abdimas B",
    publicId: "KGT-2026-0026",
    recordStatus: "Diajukan",
    scheme: "Skema Abdimas SDGs A",
    targetGroup: "Masyarakat Sasaran C",
    team: "Tim Pengusul B",
    provenance: [
      {
        capturedAt,
        identifier: "KGT-SRC-026",
        note: "Judul program belum tercatat pada sumber.",
        source: "Data proposal abdimas",
      },
    ],
    title: "",
  },
  {
    evidenceStatus: "internal",
    group: "Pengabdian masyarakat",
    indicatorId: "KM-27",
    issn: "Tersimpan internal",
    journalVolume: "Volume 1",
    kind: "Pengelolaan Jurnal Ilmiah",
    primaryParty: "Tim Pengelola Jurnal A",
    publicationFrequency: "2 kali per tahun",
    publicId: "KGT-2026-0027",
    recordStatus: "Dikelola",
    provenance: [
      {
        capturedAt,
        identifier: "KGT-SRC-027",
        source: "Data pengelolaan jurnal",
      },
    ],
    title: "Jurnal Ilmiah A",
  },
];

function createRecord(seed: ActivitySeed): OfficialActivityRecord {
  const missing = (
    value: string | undefined,
    key: ActivityCompletionFieldKey,
  ) => (value?.trim() ? [] : [key]);
  const evidenceFields: ActivityCompletionFieldKey[] =
    seed.evidenceStatus === "unrecorded" ? ["evidenceUrl"] : [];
  let missingFields: ActivityCompletionFieldKey[];

  if (seed.indicatorId === "KM-20") {
    missingFields = [
      ...missing(seed.primaryParty, "primaryParty"),
      ...missing(seed.role, "role"),
      ...missing(seed.organization, "organization"),
      ...evidenceFields,
    ];
  } else if (seed.indicatorId === "KM-21") {
    missingFields = [
      ...missing(seed.primaryParty, "primaryParty"),
      ...missing(seed.organization, "organization"),
      ...evidenceFields,
    ];
  } else if (seed.indicatorId === "KM-22") {
    missingFields = [
      ...missing(seed.title, "title"),
      ...missing(seed.eventDate, "eventDate"),
      ...missing(seed.location, "location"),
      ...evidenceFields,
    ];
  } else if (seed.indicatorId === "KM-27") {
    missingFields = [
      ...missing(seed.title, "title"),
      ...missing(seed.journalVolume, "journalVolume"),
      ...missing(seed.issn, "issn"),
      ...missing(seed.publicationFrequency, "publicationFrequency"),
      ...evidenceFields,
    ];
  } else {
    missingFields = [
      ...missing(seed.scheme, "scheme"),
      ...missing(seed.team, "team"),
      ...missing(seed.title, "title"),
      ...missing(seed.targetGroup, "targetGroup"),
      ...missing(seed.funding, "funding"),
      ...evidenceFields,
    ];
  }

  return {
    ...seed,
    evaluationPeriod,
    evidenceNote: evidenceNotes[seed.evidenceStatus],
    id: seed.publicId.toLocaleLowerCase("id-ID"),
    kmLinks: [
      {
        indicator: kmIndicator(seed.indicatorId),
        note: indicatorNotes[seed.indicatorId],
      },
    ],
    missingFields,
    ownerUnit: "CoE BHT",
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    review: {
      candidateId: `KGT-CAND-${seed.indicatorId.slice(3).padStart(2, "0")}`,
      decision: "Disetujui sebagai data baru",
      note: "Jenis kegiatan, pihak utama, indikator, dan bukti diperiksa sebelum rekam disetujui.",
      reviewedAt: capturedAt,
      reviewer: "Pemeriksa A",
    },
    updatedAt: capturedAt,
  };
}

const records = seeds.map(createRecord);

export function activityDisplayTitle(record: OfficialActivityRecord) {
  if (record.title) return record.title;
  if (
    record.kind === "Keterlibatan Unit Bisnis" ||
    record.kind === "Pembinaan UMKM / Komunitas"
  ) {
    return `${record.kind} · ${
      record.organization || record.primaryParty || "pihak belum tercatat"
    }`;
  }
  return `${record.kind} · judul belum tercatat`;
}

export function activityEvidenceLabel(record: OfficialActivityRecord) {
  if (record.evidenceStatus === "internal") return "Tersimpan internal";
  if (record.evidenceStatus === "public") return "Tautan tersedia";
  return "Belum tercatat";
}

export function activityKmLabel(record: OfficialActivityRecord) {
  if (record.kmLinks.length === 0) return "Belum dikaitkan";
  return record.kmLinks.map((link) => link.indicator.id).join(", ");
}

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function activityContextLabel(record: OfficialActivityRecord) {
  if (record.kind === "Keterlibatan Unit Bisnis") {
    return [record.role, record.organization].filter(Boolean).join(" · ");
  }
  if (record.kind === "Pembinaan UMKM / Komunitas") {
    return record.organization ?? "Komunitas belum tercatat";
  }
  if (record.kind === "Pengelolaan Konferensi Internasional") {
    return [
      record.eventDate ? formatActivityDate(record.eventDate) : undefined,
      record.location,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (record.kind === "Pengelolaan Jurnal Ilmiah") {
    return [record.journalVolume, record.issn].filter(Boolean).join(" · ");
  }
  return [record.scheme, record.targetGroup].filter(Boolean).join(" · ");
}

export const activityIndicatorScope: readonly NexusKmIndicator[] = (
  [
    "KM-20",
    "KM-21",
    "KM-22",
    "KM-23",
    "KM-24",
    "KM-25",
    "KM-26",
    "KM-27",
  ] as const
).map(kmIndicator);

/** Batas adapter yang dapat diganti respons server tanpa mengubah halaman. */
export function getNexusActivitiesContent(): NexusActivitiesContent {
  return {
    description:
      "Seluruh keterlibatan bisnis, kegiatan, dan pengabdian resmi CoE BHT yang sudah lolos Tinjauan, beserta pihak, sasaran, bukti, dan keterkaitan indikator KM.",
    officialNote:
      "Setiap indikator mempertahankan bidang kerjanya sendiri. Keterlibatan bisnis, pembinaan komunitas, konferensi, pengabdian, proposal, dan pengelolaan jurnal tidak dilebur menjadi satu bentuk kegiatan generik.",
    records,
    title: "Kegiatan & Pengabdian",
    updatedAt: "Diperbarui 17 Agustus 2026 · 14.30 WIB",
  };
}
