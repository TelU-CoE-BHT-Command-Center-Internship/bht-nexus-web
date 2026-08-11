import type { Locale } from "@/i18n/locales";

export type CandidateDetail = {
  id: string;
  label: string;
  value: string;
};

export type StagedCandidate = {
  details: CandidateDetail[];
  id: string;
  jobId: string;
  retrievedAtLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  statusLabel: string;
  title: string;
  typeLabel: string;
};

export type NexusScraperResultsContent = {
  acceptLabel: string;
  candidates: StagedCandidate[];
  candidatesSubtitle: string;
  candidatesTitle: string;
  description: string;
  eyebrow: string;
  promoteNote: string;
  rejectLabel: string;
  selfApprovalNote: string;
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
        jobId: "job_01J9BF2K",
        retrievedAtLabel: "2026-08-11 08:53",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
        statusLabel: "pending_review",
        title: "Suksmandhira Harimurti",
        typeLabel: "profile",
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
        jobId: "job_01J9BF2K",
        retrievedAtLabel: "2026-08-11 08:54",
        sourceLabel: "SINTA",
        sourceUrl: "https://doi.org/10.2196/48213",
        statusLabel: "pending_review",
        title:
          "Primary Care Telemedicine Adoption in Indonesian District Clinics",
        typeLabel: "paper",
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
        jobId: "job_01J9BF2K",
        retrievedAtLabel: "2026-08-11 08:55",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043/?view=googlescholar",
        statusLabel: "pending_review",
        title: "Rancang Bangun Perangkat Pemantauan Biosinyal untuk Puskesmas",
        typeLabel: "paper",
      },
    ],
    candidatesSubtitle: "Tiga kandidat menunggu tinjauan",
    candidatesTitle: "Kandidat Staging",
    description:
      "Kandidat hasil pengumpulan data tersimpan di staging sampai reviewer menerimanya.",
    eyebrow: "Pengumpulan Data",
    promoteNote:
      "Worker tidak menulis ke tabel bisnis resmi. Promosi ke data resmi hanya terjadi melalui keputusan reviewer di halaman ini.",
    rejectLabel: "Tolak",
    selfApprovalNote:
      "Pengirim job tidak dapat menyetujui kandidat yang berasal dari jobnya sendiri.",
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
        jobId: "job_01J9BF2K",
        retrievedAtLabel: "2026-08-11 08:53",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043",
        statusLabel: "pending_review",
        title: "Suksmandhira Harimurti",
        typeLabel: "profile",
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
        jobId: "job_01J9BF2K",
        retrievedAtLabel: "2026-08-11 08:54",
        sourceLabel: "SINTA",
        sourceUrl: "https://doi.org/10.2196/48213",
        statusLabel: "pending_review",
        title:
          "Primary Care Telemedicine Adoption in Indonesian District Clinics",
        typeLabel: "paper",
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
        jobId: "job_01J9BF2K",
        retrievedAtLabel: "2026-08-11 08:55",
        sourceLabel: "SINTA",
        sourceUrl:
          "https://sinta.kemdiktisaintek.go.id/authors/profile/6712043/?view=googlescholar",
        statusLabel: "pending_review",
        title: "Rancang Bangun Perangkat Pemantauan Biosinyal untuk Puskesmas",
        typeLabel: "paper",
      },
    ],
    candidatesSubtitle: "Three candidates awaiting review",
    candidatesTitle: "Staged Candidates",
    description:
      "Collected candidates stay in staging until a reviewer accepts them.",
    eyebrow: "Data Collection",
    promoteNote:
      "The worker never writes to official business tables. Promotion into official data happens only through a reviewer decision on this page.",
    rejectLabel: "Reject",
    selfApprovalNote:
      "Whoever submitted the job cannot approve candidates produced by that same job.",
    sourceUrlLabel: "Source URL",
    title: "Collection Results",
  },
} satisfies Record<Locale, NexusScraperResultsContent>;

/**
 * Presentation-ready staged candidates. A server adapter can replace the
 * seeded candidates without changing the component contract.
 */
export function getNexusScraperResultsContent(
  locale: Locale,
): NexusScraperResultsContent {
  return resultsCopy[locale];
}
