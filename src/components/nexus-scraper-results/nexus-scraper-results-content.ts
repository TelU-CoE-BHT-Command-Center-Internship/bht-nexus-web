import { formatTimestamp } from "@/components/nexus-workspace-page/nexus-workspace-format";
import type { Locale } from "@/i18n/locales";

export type CandidateDetail = {
  id: string;
  label: string;
  value: string;
};

export type StagedCandidate = {
  details: CandidateDetail[];
  id: string;
  retrievedAt: string;
  retrievedAtLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  title: string;
  typeLabel: string;
};

export type NexusScraperResultsContent = {
  acceptLabel: string;
  candidates: StagedCandidate[];
  candidatesSubtitle: string;
  candidatesTitle: string;
  description: string;
  promoteNote: string;
  rejectLabel: string;
  sourceUrlLabel: string;
  title: string;
};

const resultsCopy = {
  id: {
    acceptLabel: "Terima dan promosikan",
    candidates: [
      {
        details: [
          { id: "full-name", label: "Nama", value: "Suksmandhira Harimurti" },
          { id: "source-id", label: "ID sumber", value: "6712043" },
          {
            id: "institution",
            label: "Institusi",
            value: "Universitas Telkom",
          },
          { id: "parser", label: "Versi parser", value: "sinta-2026.07" },
        ],
        id: "candidate-profile-6712043",
        retrievedAt: "2026-08-11T08:53",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
        title: "Suksmandhira Harimurti",
        typeLabel: "Profil",
      },
      {
        details: [
          { id: "year", label: "Tahun", value: "2026" },
          {
            id: "venue",
            label: "Venue",
            value: "Journal of Medical Internet Research",
          },
          {
            id: "authors",
            label: "Penulis",
            value: "S. Harimurti, H. Susanti, M. A. Asyraf",
          },
          { id: "external-id", label: "ID eksternal", value: "S2874019334" },
          { id: "doi", label: "DOI", value: "10.2196/48213" },
          { id: "citations", label: "Sitasi", value: "14" },
        ],
        id: "candidate-paper-jmir-2026",
        retrievedAt: "2026-08-11T08:54",
        sourceLabel: "SINTA",
        sourceUrl: "https://doi.org/10.2196/48213",
        title:
          "Primary Care Telemedicine Adoption in Indonesian District Clinics",
        typeLabel: "Publikasi",
      },
      {
        details: [
          { id: "year", label: "Tahun", value: "2025" },
          {
            id: "venue",
            label: "Venue",
            value: "Seminar Nasional Teknologi Kesehatan",
          },
          {
            id: "authors",
            label: "Penulis",
            value: "S. Harimurti, D. Puspitasari",
          },
          { id: "external-id", label: "ID eksternal", value: "-" },
          { id: "doi", label: "DOI", value: "Belum teresolusi" },
          { id: "citations", label: "Sitasi", value: "Tidak tersedia" },
        ],
        id: "candidate-paper-semnas-2025",
        retrievedAt: "2026-08-11T08:55",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043/?view=googlescholar",
        title: "Rancang Bangun Perangkat Pemantauan Biosinyal untuk Puskesmas",
        typeLabel: "Publikasi",
      },
    ],
    candidatesSubtitle: "Tiga menunggu tinjauan",
    candidatesTitle: "Kandidat",
    description: "Kandidat hasil pengumpulan data yang menunggu tinjauan.",
    promoteNote: "Data resmi berubah hanya setelah kandidat diterima.",
    rejectLabel: "Tolak",
    sourceUrlLabel: "URL sumber",
    title: "Hasil Pengumpulan",
  },
  en: {
    acceptLabel: "Accept and promote",
    candidates: [
      {
        details: [
          { id: "full-name", label: "Name", value: "Suksmandhira Harimurti" },
          { id: "source-id", label: "Source ID", value: "6712043" },
          {
            id: "institution",
            label: "Institution",
            value: "Telkom University",
          },
          { id: "parser", label: "Parser version", value: "sinta-2026.07" },
        ],
        id: "candidate-profile-6712043",
        retrievedAt: "2026-08-11T08:53",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
        title: "Suksmandhira Harimurti",
        typeLabel: "Profile",
      },
      {
        details: [
          { id: "year", label: "Year", value: "2026" },
          {
            id: "venue",
            label: "Venue",
            value: "Journal of Medical Internet Research",
          },
          {
            id: "authors",
            label: "Authors",
            value: "S. Harimurti, H. Susanti, M. A. Asyraf",
          },
          { id: "external-id", label: "External ID", value: "S2874019334" },
          { id: "doi", label: "DOI", value: "10.2196/48213" },
          { id: "citations", label: "Citations", value: "14" },
        ],
        id: "candidate-paper-jmir-2026",
        retrievedAt: "2026-08-11T08:54",
        sourceLabel: "SINTA",
        sourceUrl: "https://doi.org/10.2196/48213",
        title:
          "Primary Care Telemedicine Adoption in Indonesian District Clinics",
        typeLabel: "Publication",
      },
      {
        details: [
          { id: "year", label: "Year", value: "2025" },
          {
            id: "venue",
            label: "Venue",
            value: "Seminar Nasional Teknologi Kesehatan",
          },
          {
            id: "authors",
            label: "Authors",
            value: "S. Harimurti, D. Puspitasari",
          },
          { id: "external-id", label: "External ID", value: "-" },
          { id: "doi", label: "DOI", value: "Not resolved" },
          { id: "citations", label: "Citations", value: "Unavailable" },
        ],
        id: "candidate-paper-semnas-2025",
        retrievedAt: "2026-08-11T08:55",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043/?view=googlescholar",
        title: "Rancang Bangun Perangkat Pemantauan Biosinyal untuk Puskesmas",
        typeLabel: "Publication",
      },
    ],
    candidatesSubtitle: "Three awaiting review",
    candidatesTitle: "Candidates",
    description: "Collected candidates awaiting review.",
    promoteNote: "Official data changes only after a candidate is accepted.",
    rejectLabel: "Reject",
    sourceUrlLabel: "Source URL",
    title: "Collection Results",
  },
} satisfies Record<
  Locale,
  Omit<NexusScraperResultsContent, "candidates"> & {
    candidates: Omit<StagedCandidate, "retrievedAtLabel">[];
  }
>;

/**
 * Presentation-ready staged candidates. A server adapter can replace the
 * seeded candidates without changing the component contract.
 */
export function getNexusScraperResultsContent(
  locale: Locale,
): NexusScraperResultsContent {
  const copy = resultsCopy[locale];

  return {
    ...copy,
    candidates: copy.candidates.map((candidate) => ({
      ...candidate,
      retrievedAtLabel: formatTimestamp(candidate.retrievedAt),
    })),
  };
}
