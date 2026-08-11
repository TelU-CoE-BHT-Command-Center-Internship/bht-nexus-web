import { formatTimestamp } from "@/components/nexus-workspace-page/nexus-workspace-format";
import type { Locale } from "@/i18n/locales";

export type CandidateDetail = {
  id: string;
  label: string;
  value: string;
};

/**
 * Candidate types the scraper writes to staging. `profile` comes from the
 * identity step; the rest come from SINTA's work views, mapped in
 * `sinta/source.py`.
 */
export type CandidateType =
  | "book"
  | "community_service"
  | "intellectual_property"
  | "paper"
  | "profile"
  | "research";

export type StagedCandidate = {
  details: CandidateDetail[];
  id: string;
  retrievedAt: string;
  retrievedAtLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  title: string;
  type: CandidateType;
  typeLabel: string;
};

export type CandidateGroup = {
  candidates: StagedCandidate[];
  fullName: string;
  id: string;
};

export type NexusScraperResultsContent = {
  acceptLabel: string;
  candidatesTitle: string;
  description: string;
  detailsLabel: string;
  groups: CandidateGroup[];
  promoteNote: string;
  rejectLabel: string;
  sourceUrlLabel: string;
  title: string;
};

type CandidateSeed = Omit<
  StagedCandidate,
  "details" | "retrievedAtLabel" | "typeLabel"
> & {
  details: Array<{ id: string; label: Record<Locale, string>; value: string }>;
};

type GroupSeed = {
  candidates: CandidateSeed[];
  fullName: string;
  id: string;
};

const typeLabels = {
  id: {
    book: "Buku",
    community_service: "Pengabdian Masyarakat",
    intellectual_property: "Kekayaan Intelektual",
    paper: "Publikasi",
    profile: "Profil",
    research: "Penelitian",
  },
  en: {
    book: "Book",
    community_service: "Community Service",
    intellectual_property: "Intellectual Property",
    paper: "Publication",
    profile: "Profile",
    research: "Research",
  },
} satisfies Record<Locale, Record<CandidateType, string>>;

const label = (id: string, en: string) => ({ en, id });

const groupSeeds: GroupSeed[] = [
  {
    candidates: [
      {
        details: [
          {
            id: "source-id",
            label: label("ID sumber", "Source ID"),
            value: "6712043",
          },
          {
            id: "institution",
            label: label("Institusi", "Institution"),
            value: "Universitas Telkom",
          },
          {
            id: "parser",
            label: label("Versi parser", "Parser version"),
            value: "sinta-2026.07",
          },
        ],
        id: "harimurti-profile",
        retrievedAt: "2026-08-11T08:53",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
        title: "Suksmandhira Harimurti",
        type: "profile",
      },
      {
        details: [
          { id: "year", label: label("Tahun", "Year"), value: "2026" },
          {
            id: "venue",
            label: label("Venue", "Venue"),
            value: "Journal of Medical Internet Research",
          },
          {
            id: "authors",
            label: label("Penulis", "Authors"),
            value: "S. Harimurti, H. Susanti, M. A. Asyraf",
          },
          { id: "doi", label: label("DOI", "DOI"), value: "10.2196/48213" },
          { id: "citations", label: label("Sitasi", "Citations"), value: "14" },
        ],
        id: "harimurti-paper-jmir",
        retrievedAt: "2026-08-11T08:54",
        sourceLabel: "SINTA",
        sourceUrl: "https://doi.org/10.2196/48213",
        title:
          "Primary Care Telemedicine Adoption in Indonesian District Clinics",
        type: "paper",
      },
      {
        details: [
          { id: "year", label: label("Tahun", "Year"), value: "2025" },
          {
            id: "scheme",
            label: label("Skema", "Scheme"),
            value: "Penelitian Terapan Unggulan",
          },
          {
            id: "funder",
            label: label("Pemberi dana", "Funder"),
            value: "Kemendiktisaintek",
          },
        ],
        id: "harimurti-research-biosignal",
        retrievedAt: "2026-08-11T08:55",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043?view=researches",
        title: "Sistem Pemantauan Biosinyal Terintegrasi untuk Layanan Primer",
        type: "research",
      },
      {
        details: [
          { id: "year", label: label("Tahun", "Year"), value: "2025" },
          {
            id: "partner",
            label: label("Mitra", "Partner"),
            value: "Puskesmas Cibiru",
          },
        ],
        id: "harimurti-service-puskesmas",
        retrievedAt: "2026-08-11T08:55",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043?view=services",
        title: "Pelatihan Pemantauan Biosinyal untuk Tenaga Puskesmas",
        type: "community_service",
      },
    ],
    fullName: "Suksmandhira Harimurti",
    id: "harimurti",
  },
  {
    candidates: [
      {
        details: [
          {
            id: "source-id",
            label: label("ID sumber", "Source ID"),
            value: "6698215",
          },
          {
            id: "institution",
            label: label("Institusi", "Institution"),
            value: "Universitas Telkom",
          },
          {
            id: "parser",
            label: label("Versi parser", "Parser version"),
            value: "sinta-2026.07",
          },
        ],
        id: "puspitasari-profile",
        retrievedAt: "2026-08-10T16:10",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6698215",
        title: "Dita Puspitasari",
        type: "profile",
      },
      {
        details: [
          { id: "year", label: label("Tahun", "Year"), value: "2024" },
          {
            id: "publisher",
            label: label("Penerbit", "Publisher"),
            value: "Telkom University Press",
          },
          {
            id: "isbn",
            label: label("ISBN", "ISBN"),
            value: "978-623-8756-11-4",
          },
        ],
        id: "puspitasari-book-rehabilitasi",
        retrievedAt: "2026-08-10T16:12",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6698215?view=books",
        title: "Rehabilitasi Lansia Berbasis Sensor",
        type: "book",
      },
    ],
    fullName: "Dita Puspitasari",
    id: "puspitasari",
  },
];

const resultsCopy = {
  id: {
    acceptLabel: "Terima",
    candidatesTitle: "Menunggu Tinjauan",
    description:
      "Kandidat hasil pengumpulan data yang menunggu tinjauan. Setiap kandidat ditinjau terpisah.",
    detailsLabel: "Rincian",
    promoteNote: "Data resmi berubah hanya setelah kandidat diterima.",
    rejectLabel: "Tolak",
    sourceUrlLabel: "Buka sumber",
    title: "Kandidat",
  },
  en: {
    acceptLabel: "Accept",
    candidatesTitle: "Awaiting Review",
    description:
      "Collected candidates awaiting review. Each candidate is reviewed on its own.",
    detailsLabel: "Details",
    promoteNote: "Official data changes only after a candidate is accepted.",
    rejectLabel: "Reject",
    sourceUrlLabel: "Open source",
    title: "Candidates",
  },
} satisfies Record<Locale, Omit<NexusScraperResultsContent, "groups">>;

/**
 * Presentation-ready candidates grouped by researcher. Each candidate keeps its
 * own decision, matching one row of `staging_candidates`.
 */
export function getNexusScraperResultsContent(
  locale: Locale,
): NexusScraperResultsContent {
  return {
    ...resultsCopy[locale],
    groups: groupSeeds.map((group) => ({
      candidates: group.candidates.map((candidate) => ({
        ...candidate,
        details: candidate.details.map((detail) => ({
          id: detail.id,
          label: detail.label[locale],
          value: detail.value,
        })),
        retrievedAtLabel: formatTimestamp(candidate.retrievedAt),
        typeLabel: typeLabels[locale][candidate.type],
      })),
      fullName: group.fullName,
      id: group.id,
    })),
  };
}
