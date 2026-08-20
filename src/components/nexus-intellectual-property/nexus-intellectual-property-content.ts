import {
  type MetadataCompletionFieldKey,
  type MetadataCompletionProposal,
  type MetadataCompletionResolutions,
  metadataCompletionFieldLabels,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { personInitials } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  kmIndicator,
  type NexusKmIndicator,
} from "@/content/nexus-km-indicators";

type IntellectualPropertyIndicatorId = "KM-15" | "KM-16";

type IntellectualPropertyProtection =
  | "Belum diklasifikasikan"
  | "Desain Industri"
  | "Hak Cipta"
  | "Merek"
  | "Paten";

type IntellectualPropertyQuality = "Lengkap" | "Perlu dilengkapi";

export type IntellectualPropertyCompletionFieldKey = MetadataCompletionFieldKey;

export const intellectualPropertyFieldLabels = metadataCompletionFieldLabels;

export type IntellectualPropertyProposal = MetadataCompletionProposal;

type IntellectualPropertyCreator = {
  id: string;
  initials: string;
  name: string;
};

type IntellectualPropertyProvenance = {
  capturedAt: string;
  identifier: string;
  note?: string;
  source: string;
};

type IntellectualPropertyKmLink = {
  indicator: NexusKmIndicator;
  note: string;
};

type IntellectualPropertyDocumentAccess = "internal" | "public" | "unrecorded";

export type OfficialIntellectualProperty = {
  creators: IntellectualPropertyCreator[];
  documentAccess: IntellectualPropertyDocumentAccess;
  documentNote?: string;
  documentUrl?: string;
  /** Periode evaluasi KM, bukan tahun pengajuan. */
  evaluationPeriod: string;
  filedOn?: string;
  id: string;
  kmLinks: IntellectualPropertyKmLink[];
  missingFields: IntellectualPropertyCompletionFieldKey[];
  protection: IntellectualPropertyProtection;
  provenance: IntellectualPropertyProvenance[];
  publicId: string;
  quality: IntellectualPropertyQuality;
  registrationNumber?: string;
  registry: string;
  /** Nilai atau pengecualian pelengkapan yang sudah disetujui. */
  resolvedMetadata?: MetadataCompletionResolutions;
  review: {
    candidateId: string;
    decision:
      | "Dihubungkan ke rekam resmi"
      | "Disetujui sebagai data baru"
      | "Pelengkapan metadata disetujui";
    note: string;
    reviewedAt: string;
    reviewer: string;
  };
  title: string;
  updatedAt: string;
  /** `undefined` ketika sumber belum mencatat tahun pengajuan. */
  year?: number;
};

export type NexusIntellectualPropertyContent = {
  description: string;
  officialNote: string;
  records: OfficialIntellectualProperty[];
  title: string;
  updatedAt: string;
};

const capturedAt = "14 Agu 2026";
const evaluationPeriod = "2026";

const kmLinkNotes: Record<IntellectualPropertyIndicatorId, string> = {
  "KM-15":
    "Pengajuan HKI tahun berjalan sampai pendaftaran ke Kemenkumham melalui klinik HKI, dihitung setelah memperoleh nomor registrasi.",
  "KM-16":
    "Pengajuan paten tahun berjalan sampai pendaftaran ke Kemenkumham, dihitung setelah memperoleh nomor registrasi.",
};

const documentNotes: Record<IntellectualPropertyDocumentAccess, string> = {
  internal:
    "Dokumen pendaftaran tersimpan pada penyimpanan internal dan hanya tersedia untuk pengguna yang berwenang.",
  public: "Dokumen pendaftaran dapat dibuka melalui tautan publik.",
  unrecorded: "Sumber belum mencatat dokumen pendaftaran untuk rekam ini.",
};

type IntellectualPropertySeed = {
  creators: readonly string[];
  documentAccess: IntellectualPropertyDocumentAccess;
  documentUrl?: string;
  filedOn?: string;
  indicatorId?: IntellectualPropertyIndicatorId;
  protection: IntellectualPropertyProtection;
  publicId: string;
  registrationNumber?: string;
  sources: readonly IntellectualPropertyProvenance[];
  title: string;
  year?: number;
};

/**
 * Struktur bidang mengikuti kebutuhan HKI dan paten pada workbook KM 2026.
 * Nilainya netral karena judul, pencipta, nomor registrasi, dan dokumen pada
 * workbook internal tidak otomatis boleh diterbitkan melalui repository publik.
 */
const seeds: readonly IntellectualPropertySeed[] = [
  {
    creators: ["Dosen A"],
    documentAccess: "internal",
    indicatorId: "KM-15",
    protection: "Hak Cipta",
    publicId: "KI-2026-0001",
    sources: [
      {
        capturedAt,
        identifier: "KI-SRC-001",
        source: "Data kekayaan intelektual",
      },
      {
        capturedAt,
        identifier: "KI-SRC-002",
        note: "Sumber kedua memuat pengajuan yang sama. Keduanya disatukan agar satu karya tidak terhitung dua kali.",
        source: "Data kekayaan intelektual",
      },
    ],
    title: "Karya Edukasi Kesehatan A",
    year: 2026,
  },
  {
    creators: ["Dosen B"],
    documentAccess: "internal",
    indicatorId: "KM-15",
    protection: "Hak Cipta",
    publicId: "KI-2026-0002",
    registrationNumber: "REG-HC-2026-B",
    sources: [
      {
        capturedAt,
        identifier: "KI-SRC-003",
        note: "Tahun pengajuan berada di luar periode evaluasi berjalan dan masih perlu dikonfirmasi.",
        source: "Data kekayaan intelektual",
      },
    ],
    title: "Karya Layanan Masyarakat B",
    year: 2027,
  },
  {
    creators: ["Inventor A", "Inventor B", "Inventor C"],
    documentAccess: "unrecorded",
    filedOn: "11 Juni 2026",
    indicatorId: "KM-16",
    protection: "Paten",
    publicId: "KI-2026-0003",
    registrationNumber: "REG-PAT-2026-A",
    sources: [
      {
        capturedAt,
        identifier: "KI-SRC-004",
        note: "Nomor registrasi sudah tercatat, tetapi dokumen pendaftarannya belum tersedia pada sumber.",
        source: "Data kekayaan intelektual",
      },
    ],
    title: "Paten Perangkat Kesehatan A",
    year: 2026,
  },
  {
    creators: ["Inovator A"],
    documentAccess: "internal",
    protection: "Belum diklasifikasikan",
    publicId: "KI-2026-0004",
    sources: [
      {
        capturedAt,
        identifier: "KI-SRC-005",
        note: "Bentuk perlindungan dan kaitan indikator evaluasi belum dipastikan.",
        source: "Data kekayaan intelektual",
      },
    ],
    title: "Teknologi Kesehatan A",
    year: 2026,
  },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("id-ID")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toCreator(name: string): IntellectualPropertyCreator {
  return { id: slugify(name), initials: personInitials(name), name };
}

function createRecord(
  seed: IntellectualPropertySeed,
): OfficialIntellectualProperty {
  const missingFields: IntellectualPropertyCompletionFieldKey[] = [
    ...(seed.protection === "Belum diklasifikasikan"
      ? (["protectionType"] as const)
      : []),
    ...(seed.year ? [] : (["year"] as const)),
    ...(seed.registrationNumber ? [] : (["registrationNumber"] as const)),
    ...(seed.documentAccess === "unrecorded" ? (["documentUrl"] as const) : []),
  ];

  return {
    creators: seed.creators.map(toCreator),
    documentAccess: seed.documentAccess,
    documentNote: documentNotes[seed.documentAccess],
    documentUrl: seed.documentUrl,
    evaluationPeriod,
    filedOn: seed.filedOn,
    id: seed.publicId.toLocaleLowerCase("id-ID"),
    kmLinks: seed.indicatorId
      ? [
          {
            indicator: kmIndicator(seed.indicatorId),
            note: kmLinkNotes[seed.indicatorId],
          },
        ]
      : [],
    missingFields,
    protection: seed.protection,
    provenance: [...seed.sources],
    publicId: seed.publicId,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    registrationNumber: seed.registrationNumber,
    registry: "Kemenkumham melalui klinik HKI Telkom University",
    review: {
      candidateId: `KI-CAND-${seed.publicId.slice(-4)}`,
      decision:
        seed.sources.length > 1
          ? "Dihubungkan ke rekam resmi"
          : "Disetujui sebagai data baru",
      note:
        seed.sources.length > 1
          ? "Beberapa sumber yang merujuk karya sama disatukan menjadi satu rekam resmi dan seluruh jejaknya dipertahankan."
          : "Identitas karya, pencipta, bentuk perlindungan, dan kelengkapan metadata diperiksa sebelum rekam disetujui.",
      reviewedAt: capturedAt,
      reviewer: "Pemeriksa A",
    },
    title: seed.title,
    updatedAt: capturedAt,
    year: seed.year,
  };
}

const records: OfficialIntellectualProperty[] = seeds.map(createRecord);

/**
 * Kaitan KM baru dibentuk setelah keputusan pelengkapan menghasilkan jenis
 * perlindungan yang jelas dan nomor registrasi yang benar-benar tersedia.
 * Pengecualian atas nomor registrasi tetap menyelesaikan metadata, tetapi tidak
 * cukup untuk menyatakan rekam memenuhi bukti indikator.
 */
export function normalizeProjectedIntellectualProperty(
  record: OfficialIntellectualProperty,
): OfficialIntellectualProperty {
  if (record.kmLinks.length > 0) return record;
  if (
    record.protection === "Belum diklasifikasikan" ||
    !record.registrationNumber ||
    record.missingFields.includes("protectionType") ||
    record.missingFields.includes("registrationNumber")
  ) {
    return record;
  }

  const indicatorId: IntellectualPropertyIndicatorId =
    record.protection === "Paten" ? "KM-16" : "KM-15";
  return {
    ...record,
    kmLinks: [
      {
        indicator: kmIndicator(indicatorId),
        note: kmLinkNotes[indicatorId],
      },
    ],
  };
}

export function intellectualPropertyCreatorNames(
  record: OfficialIntellectualProperty,
) {
  return record.creators.map((creator) => creator.name).join("; ");
}

export function intellectualPropertyKmLabel(
  record: OfficialIntellectualProperty,
) {
  if (record.kmLinks.length === 0) return "Belum dikaitkan";
  return record.kmLinks.map((link) => link.indicator.id).join(", ");
}

/** Batas adapter yang dapat diganti layanan server tanpa mengubah halaman. */
export function getNexusIntellectualPropertyContent(): NexusIntellectualPropertyContent {
  return {
    description:
      "Seluruh kekayaan intelektual resmi CoE BHT yang sudah lolos Tinjauan, mulai dari hak cipta sampai paten, beserta nomor pencatatan dan dokumen pendaftarannya.",
    officialNote:
      "Daftar ini hanya memuat rekam resmi. Pengajuan yang belum selesai diperiksa tetap berada di Tinjauan.",
    records,
    title: "Kekayaan Intelektual",
    updatedAt: "Diperbarui 17 Agustus 2026 · 09.30 WIB",
  };
}
