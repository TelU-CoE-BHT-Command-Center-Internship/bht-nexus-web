import type { ImageProps } from "next/image";
import ditaPuspitasariPhoto from "@/assets/members/dita-puspitasari.webp";
import fathurRahmanPhoto from "@/assets/members/fathur-rahman.webp";
import hestySusantiPhoto from "@/assets/members/hesty-susanti.png";
import lailyAdeOktavianaPhoto from "@/assets/members/laily-ade-oktaviana.webp";
import muhammadAmmarAsyrafPhoto from "@/assets/members/muhammad-ammar-asyraf.webp";
import salsabilaAurelliaPhoto from "@/assets/members/salsabila-aurellia.webp";
import suksmandhiraHarimurtiPhoto from "@/assets/members/suksmandhira-harimurti.webp";
import {
  type MetadataCompletionFieldKey,
  type MetadataCompletionResolution,
  type MetadataCompletionResolutionStatus,
  type MetadataCompletionResolutions,
  metadataCompletionFieldLabels,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";

export type PublicationType =
  | "Artikel Jurnal"
  | "Buku / Monograf"
  | "HKI"
  | "Prosiding";

export type PublicationQuality = "Lengkap" | "Perlu dilengkapi";

export type PublicationCompletionFieldKey = MetadataCompletionFieldKey;
export type PublicationCompletionResolutionStatus =
  MetadataCompletionResolutionStatus;
export type PublicationCompletionResolution = MetadataCompletionResolution;
export type PublicationCompletionResolutions = MetadataCompletionResolutions;

export type PublicationMetadataProposal = {
  id: string;
  note: string;
  publicationId: string;
  status: "waiting-review";
  submittedAt: string;
  submittedBy: string;
  resolutions: PublicationCompletionResolutions;
};

export const publicationCompletionFieldLabels: Record<
  PublicationCompletionFieldKey,
  string
> = metadataCompletionFieldLabels;

export type PublicationSourceName = "Google Scholar" | "Manual" | "SINTA";
export type PublicationCitationProvider = "Google Scholar" | "SINTA";

export type PublicationMember = {
  avatarSrc: ImageProps["src"];
  id: string;
  name: string;
  role: string;
};

export type PublicationProvenance = {
  capturedAt: string;
  identifier: string;
  source: PublicationSourceName;
};

export type OfficialPublication = {
  authors: string[];
  bhtMembers: PublicationMember[];
  citationProvider?: PublicationCitationProvider;
  citationUpdatedAt?: string;
  citations: number | null;
  doi?: string;
  id: string;
  issue?: string;
  missingFields: PublicationCompletionFieldKey[];
  owner: PublicationMember;
  provenance: PublicationProvenance[];
  publisherUrl?: string;
  publicId: string;
  quality: PublicationQuality;
  pages?: string;
  review: {
    candidateId: string;
    decision: "Dihubungkan ke rekam resmi" | "Disetujui sebagai data baru";
    note: string;
    reviewedAt: string;
    reviewer: string;
  };
  title: string;
  type: PublicationType;
  updatedAt: string;
  venue: string;
  year: number;
};

export type NexusPublicationsContent = {
  description: string;
  officialNote: string;
  records: OfficialPublication[];
  title: string;
  updatedAt: string;
};

const members: PublicationMember[] = [
  {
    avatarSrc: hestySusantiPhoto,
    id: "hesty-susanti",
    name: "Dr. Hesty Susanti",
    role: "Ketua CoE BHT",
  },
  {
    avatarSrc: suksmandhiraHarimurtiPhoto,
    id: "suksmandhira-harimurti",
    name: "Dr. Suksmandhira Harimurti",
    role: "Peneliti CoE BHT",
  },
  {
    avatarSrc: ditaPuspitasariPhoto,
    id: "dita-puspitasari",
    name: "Dita Puspitasari",
    role: "Peneliti CoE BHT",
  },
  {
    avatarSrc: fathurRahmanPhoto,
    id: "fathur-rahman",
    name: "Fathur Rahman",
    role: "Peneliti CoE BHT",
  },
  {
    avatarSrc: lailyAdeOktavianaPhoto,
    id: "laily-ade-oktaviana",
    name: "Laily Ade Oktaviana",
    role: "Pengelola administrasi",
  },
  {
    avatarSrc: salsabilaAurelliaPhoto,
    id: "salsabila-aurellia",
    name: "Salsabila Aurellia",
    role: "Pengelola data",
  },
  {
    avatarSrc: muhammadAmmarAsyrafPhoto,
    id: "muhammad-ammar-asyraf",
    name: "Muhammad Ammar Asyraf",
    role: "Pengurus CoE BHT",
  },
];

const publicationTypes: PublicationType[] = [
  "Artikel Jurnal",
  "Prosiding",
  "Artikel Jurnal",
  "HKI",
  "Buku / Monograf",
];

const venues = [
  "Journal of Biomedical Engineering and Health Systems",
  "International Conference on Biomedical Instrumentation",
  "Jurnal Teknologi Kesehatan Digital",
  "Seminar Nasional Biomedical & Healthcare Technology",
  "Journal of Intelligent Systems and Machine Learning",
  "International Journal of Telemedicine and Applications",
];

const researchAreas = [
  ["pemantauan biosinyal", "layanan kesehatan primer"],
  ["citra histopatologi", "skrining kanker payudara"],
  ["ultrasonografi portabel", "skrining kepadatan tulang"],
  ["navigasi asistif", "rehabilitasi pasien pascastroke"],
  ["sensor risiko jatuh", "pemantauan lansia di rumah"],
  ["sinyal elektrokardiogram", "deteksi aritmia dini"],
  ["platform telemedisin", "wilayah dengan akses terbatas"],
  ["segmentasi lesi retina", "dukungan skrining diabetes"],
  ["biosensor berbasis graphene", "deteksi glukosa"],
  ["citra lung ultrasound", "skrining tuberkulosis"],
  ["rehabilitasi berbasis sensor", "evaluasi gerak tangan"],
  ["rekam medis terstruktur", "koordinasi layanan klinis"],
  ["pemrosesan suara", "deteksi gangguan pernapasan"],
  ["sensor tekanan plantar", "analisis pola berjalan"],
  ["pemodelan organ digital", "perencanaan tindakan klinis"],
  ["perangkat wearable", "pemantauan aktivitas harian"],
  ["pengenalan aktivitas", "keselamatan pasien rawat jalan"],
  ["analitik data kesehatan", "pemantauan penyakit kronis"],
  ["ekstraksi informasi klinis", "ringkasan dokumen medis"],
  ["robotika rehabilitasi", "latihan motorik ekstremitas atas"],
  ["sensor mikrofluida", "pengujian biomarker cepat"],
] as const;

const approaches = [
  "Pengembangan dan evaluasi",
  "Studi validasi awal",
  "Perancangan sistem terintegrasi",
  "Analisis kinerja",
] as const;

function formatIdNumber(value: number) {
  return String(value).padStart(5, "0");
}

function createProvenance(
  index: number,
  year: number,
): PublicationProvenance[] {
  const primarySource: PublicationSourceName =
    index % 5 === 0 ? "Manual" : index % 3 === 0 ? "Google Scholar" : "SINTA";
  const records: PublicationProvenance[] = [
    {
      capturedAt: `${8 + (index % 18)} Jul 2026`,
      identifier: `${primarySource === "SINTA" ? "SINTA" : primarySource === "Google Scholar" ? "GS" : "MAN"}-${year}-${formatIdNumber(index + 1)}`,
      source: primarySource,
    },
  ];

  if (index % 4 === 0 && primarySource !== "SINTA") {
    records.push({
      capturedAt: `${10 + (index % 15)} Jul 2026`,
      identifier: `SINTA-${year}-${formatIdNumber(index + 301)}`,
      source: "SINTA",
    });
  }

  if (index % 6 === 0 && primarySource !== "Google Scholar") {
    records.push({
      capturedAt: `${12 + (index % 13)} Jul 2026`,
      identifier: `GS-${year}-${formatIdNumber(index + 601)}`,
      source: "Google Scholar",
    });
  }

  return records;
}

function createPublication(index: number): OfficialPublication {
  const [focus, context] = researchAreas[index % researchAreas.length];
  const approach = approaches[Math.floor(index / researchAreas.length)];
  const owner = members[index % members.length];
  const collaborator = members[(index + 2) % members.length];
  const year = 2026 - (index % 4);
  const type = publicationTypes[index % publicationTypes.length];
  const provenance = createProvenance(index, year);
  const citationProvider: PublicationCitationProvider | undefined =
    index % 5 === 0 ? undefined : index % 2 === 0 ? "SINTA" : "Google Scholar";
  const citations =
    !citationProvider || index % 13 === 0 ? null : (index * 7 + 3) % 64;
  const quality: PublicationQuality =
    index % 11 === 0 || index % 17 === 0 ? "Perlu dilengkapi" : "Lengkap";
  const decision =
    provenance.length > 1
      ? "Dihubungkan ke rekam resmi"
      : "Disetujui sebagai data baru";

  return {
    authors: [
      owner.name,
      collaborator.name,
      `Anggota Kolaborator ${index + 1}`,
    ],
    bhtMembers: [owner, collaborator],
    citationProvider: citations === null ? undefined : citationProvider,
    citationUpdatedAt:
      citations === null ? undefined : `${1 + (index % 11)} Agu 2026`,
    citations,
    doi:
      type === "HKI" || index % 9 === 0
        ? undefined
        : `10.62527/bht.${year}.${formatIdNumber(index + 1)}`,
    id: `publication-${index + 1}`,
    missingFields:
      quality === "Perlu dilengkapi"
        ? index % 2 === 0
          ? ["doi", "publisherUrl"]
          : ["issue", "pages"]
        : [],
    owner,
    provenance,
    publicId: `PUB-${year}-${formatIdNumber(index + 1)}`,
    quality,
    review: {
      candidateId: `TJV-2026-${formatIdNumber(index + 141)}`,
      decision,
      note:
        decision === "Dihubungkan ke rekam resmi"
          ? "Metadata sumber dipertahankan pada rekam resmi tanpa membuat publikasi kedua."
          : "Metadata utama dan kepemilikan telah diperiksa sebelum menjadi data resmi.",
      reviewedAt: `${2 + (index % 26)} Agu 2026 · ${String(8 + (index % 8)).padStart(2, "0")}.${index % 2 === 0 ? "15" : "40"} WIB`,
      reviewer: index % 2 === 0 ? "Laily Ade Oktaviana" : "Salsabila Aurellia",
    },
    title: `${approach} ${focus} untuk ${context}`,
    type,
    updatedAt: `${3 + (index % 10)} Agu 2026`,
    venue: venues[index % venues.length],
    year,
  };
}

const records = Array.from({ length: 84 }, (_, index) =>
  createPublication(index),
);

const highlightedRecords: OfficialPublication[] = [
  {
    ...createPublication(84),
    authors: ["Muhammad Ammar Asyraf", "Rahmawati N.", "Hesty Susanti"],
    bhtMembers: [members[6], members[0]],
    citations: 18,
    doi: "10.26740/bht.2025.0171",
    id: "nanoemulsion-habbatussauda",
    owner: members[0],
    publicId: "PUB-2025-04777",
    quality: "Lengkap",
    title:
      "Nanoemulsi Minyak Habbatussauda terhadap Ekspresi TNF-alpha pada Model Tikus Diabetes: Studi Seri 8",
    type: "Artikel Jurnal",
    venue: "Journal of Biomedical Therapeutics",
    year: 2025,
  },
  {
    ...createPublication(85),
    authors: ["Dimas Wibisono", "Suksmandhira Harimurti", "Rizky Hidayat"],
    bhtMembers: [members[1]],
    citationProvider: "Google Scholar",
    citationUpdatedAt: "1 Agu 2026",
    citations: 12,
    id: "histopathology-classification",
    owner: members[1],
    publicId: "PUB-2026-04778",
    title:
      "Deep Learning untuk Klasifikasi Citra Histopatologi Kanker Payudara: Studi Multisenter",
    type: "Artikel Jurnal",
    venue: "JASMINE",
    year: 2026,
  },
  {
    ...createPublication(86),
    authors: ["Muhammad Rafi", "Fathur Rahman", "Andi Kurniawan"],
    bhtMembers: [members[3]],
    citations: 9,
    id: "curriculum-inhibitor-protease",
    owner: members[3],
    publicId: "PUB-2026-04779",
    title:
      "Studi In Silico Turunan Kurkumin sebagai Kandidat Inhibitor Protease: Studi Seri 8",
    type: "Prosiding",
    venue: "International Conference on Biomedical Informatics",
    year: 2026,
  },
  {
    ...createPublication(87),
    authors: ["Siti Aisyah", "Laily Ade Oktaviana", "Dewa Nurlana"],
    bhtMembers: [members[4]],
    citations: 6,
    id: "graphene-biosensor",
    owner: members[4],
    publicId: "PUB-2025-04780",
    title:
      "Pengembangan Biosensor Berbasis Graphene untuk Deteksi Glukosa: Studi Eksperimental",
    type: "Artikel Jurnal",
    venue: "Biomedical Sensors and Systems",
    year: 2025,
  },
  {
    ...createPublication(88),
    authors: ["Dewi Lestari", "Dita Puspitasari", "Naufal Hidayat"],
    bhtMembers: [members[2]],
    citations: 14,
    id: "binahong-antibacterial",
    owner: members[2],
    publicId: "PUB-2024-04781",
    title:
      "Aktivitas Antibakteri Ekstrak Daun Binahong terhadap Escherichia coli: Studi Laboratorium",
    type: "Artikel Jurnal",
    venue: "Jurnal Farmasi dan Biomedis",
    year: 2024,
  },
  {
    ...createPublication(89),
    authors: ["Andi Kurniawan", "Muhammad Ammar Asyraf"],
    bhtMembers: [members[6]],
    citations: 21,
    id: "crispr-stem-cell",
    owner: members[6],
    publicId: "PUB-2024-04782",
    title:
      "CRISPR-Cas9 pada Sel Punca Mesenkimal: Tinjauan Sistematis dan Arah Riset Klinis",
    type: "Buku / Monograf",
    venue: "BHT Academic Press",
    year: 2024,
  },
  {
    ...createPublication(90),
    authors: ["Nadia Rahmawati", "Hesty Susanti", "Farhan Akbar"],
    bhtMembers: [members[0]],
    citationProvider: undefined,
    citationUpdatedAt: undefined,
    citations: null,
    id: "wearable-fall-risk",
    owner: members[0],
    publicId: "PUB-2026-04783",
    title:
      "Pemantauan Gait dan Risiko Jatuh Berbasis Sensor Wearable: Studi Seri 8",
    type: "Artikel Jurnal",
    venue: "Journal of Assistive Health Technology",
    year: 2026,
  },
  {
    ...createPublication(91),
    authors: ["Rizky Hidayat", "Suksmandhira Harimurti", "Mira Putri"],
    bhtMembers: [members[1]],
    citationProvider: "SINTA",
    citationUpdatedAt: "9 Jul 2026",
    citations: 25,
    id: "ecg-arrhythmia",
    owner: members[1],
    publicId: "PUB-2025-04784",
    title:
      "Deteksi Aritmia dari Sinyal Elektrokardiogram dengan Explainable Machine Learning",
    type: "Prosiding",
    venue: "International Conference on Biosignal Processing",
    year: 2025,
  },
  {
    ...createPublication(92),
    authors: ["Puspita Wulandari", "Dita Puspitasari", "Ahmad Zaki"],
    bhtMembers: [members[2]],
    citations: 17,
    id: "retinopathy-segmentation",
    owner: members[2],
    publicId: "PUB-2026-04785",
    title:
      "Segmentasi Lesi Retinopati Diabetik untuk Mendukung Skrining Dini: Studi Validasi",
    type: "Artikel Jurnal",
    venue: "Digital Health Imaging Journal",
    year: 2026,
  },
  {
    ...createPublication(93),
    authors: ["Nur Aulia", "Fathur Rahman", "Bagus Ramadhan"],
    bhtMembers: [members[3]],
    citationProvider: undefined,
    citationUpdatedAt: undefined,
    citations: null,
    id: "portable-ultrasound",
    owner: members[3],
    publicId: "PUB-2026-04786",
    title:
      "Rancangan Sistem Ultrasonografi Portabel untuk Skrining Kepadatan Tulang",
    type: "HKI",
    venue: "Pangkalan Data Kekayaan Intelektual",
    year: 2026,
  },
  {
    ...createPublication(94),
    authors: ["Salsabila Aurellia", "Hesty Susanti", "Rama Yusuf"],
    bhtMembers: [members[5], members[0]],
    citations: 11,
    id: "primary-telemedicine",
    owner: members[0],
    publicId: "PUB-2025-04787",
    title:
      "Platform Telemedisin untuk Layanan Primer pada Wilayah dengan Akses Terbatas",
    type: "Artikel Jurnal",
    venue: "International Journal of Telemedicine and Applications",
    year: 2025,
  },
  {
    ...createPublication(95),
    authors: ["Dita Puspitasari", "Laily Ade Oktaviana", "Fauzan Nabil"],
    bhtMembers: [members[2], members[4]],
    citationProvider: undefined,
    citationUpdatedAt: undefined,
    citations: null,
    id: "elder-rehabilitation-sensor",
    owner: members[2],
    publicId: "PUB-2023-04788",
    title:
      "Rehabilitasi Lansia Berbasis Sensor untuk Evaluasi Gerak dan Aktivitas Harian",
    type: "Prosiding",
    venue: "Seminar Nasional Teknologi Kesehatan",
    year: 2023,
  },
];

/**
 * Structured presentation fixtures for the official-publication workflow.
 * A server adapter can replace this function without changing the page API.
 */
export function getNexusPublicationsContent(): NexusPublicationsContent {
  return {
    description:
      "Temukan publikasi resmi yang telah melewati pemeriksaan, lalu telusuri pemilik, metadata, dan sumber pembentuknya.",
    officialNote:
      "Daftar ini hanya memuat rekam resmi. Kandidat yang belum selesai diperiksa tetap berada di Tinjauan.",
    records: [...highlightedRecords, ...records],
    title: "Publikasi",
    updatedAt: "Diperbarui 13 Agustus 2026 · 05.23 WIB",
  };
}
