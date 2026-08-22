import type {
  AuditOfficialMatch,
  AuditReviewCategory,
  AuditReviewField,
  AuditReviewRecord,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import type { NexusReviewActor } from "@/components/nexus-review-session/nexus-review-session";
import {
  formatAuditTimestamp,
  normalizeWorkspaceSearch,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  kmIndicator,
  type NexusKmIndicatorId,
} from "@/content/nexus-km-indicators";

export type ManualSubmissionDomain =
  | "academic"
  | "activity"
  | "contract"
  | "intellectual-property"
  | "publication";

export type ManualSubmissionValues = Record<string, string> & {
  evidenceUrl: string;
  note: string;
  recordType: string;
  title: string;
  year: string;
};

export type ManualRecordComparisonCandidate = {
  id: string;
  identifiers?: readonly string[];
  recordType?: string;
  subtitle?: string;
  title: string;
  year?: number;
};

export type ManualFieldChoice = {
  label: string;
  value: string;
};

export type ManualFieldDefinition = {
  choices?: readonly ManualFieldChoice[];
  hint?: string;
  key: string;
  label: string;
  min?: string;
  placeholder?: string;
  required?: boolean;
  type: "date" | "number" | "select" | "text" | "textarea";
  wide?: boolean;
};

type KmSuggestionDefinition = {
  confidence: "Sedang" | "Tinggi";
  evidenceRule: string;
  indicatorId: NexusKmIndicatorId;
  reason: string;
};

export type ManualKmSuggestion = KmSuggestionDefinition & {
  indicator: ReturnType<typeof kmIndicator>;
};

export type ManualSubtypeDefinition = {
  category?: AuditReviewCategory;
  fields: readonly ManualFieldDefinition[];
  id: string;
  label: string;
  primaryFieldKey?: string;
  suggestion?:
    | KmSuggestionDefinition
    | ((values: ManualSubmissionValues) => KmSuggestionDefinition | null);
  titleFieldLabel?: string;
  titlePlaceholder?: string;
  titleRequired?: boolean;
  typeLabel: string;
};

export type ManualDomainDefinition = {
  buttonLabel: string;
  category: AuditReviewCategory;
  description: string;
  eyebrow: string;
  noun: string;
  primaryFieldKey?: string;
  subtypes: readonly ManualSubtypeDefinition[];
  title: string;
  titleFieldLabel: string;
  titlePlaceholder: string;
};

const textField = (
  key: string,
  label: string,
  placeholder: string,
  options: Partial<ManualFieldDefinition> = {},
): ManualFieldDefinition => ({
  key,
  label,
  placeholder,
  required: true,
  type: "text",
  ...options,
});

const selectField = (
  key: string,
  label: string,
  choices: readonly ManualFieldChoice[],
  options: Partial<ManualFieldDefinition> = {},
): ManualFieldDefinition => ({
  choices,
  key,
  label,
  required: true,
  type: "select",
  ...options,
});

const suggestion = (
  indicatorId: NexusKmIndicatorId,
  reason: string,
  evidenceRule: string,
  confidence: KmSuggestionDefinition["confidence"] = "Tinggi",
): KmSuggestionDefinition => ({
  confidence,
  evidenceRule,
  indicatorId,
  reason,
});

const publicationInvolvementFields = [
  textField(
    "authors",
    "Daftar penulis",
    "Pisahkan beberapa nama dengan titik koma",
    { wide: true },
  ),
  textField(
    "bhtMembers",
    "Anggota BHT yang terlibat",
    "Nama penulis yang merupakan anggota CoE BHT",
  ),
  textField(
    "authorRole",
    "Peran penulis BHT (opsional)",
    "Contoh: penulis pertama atau corresponding author",
    { required: false },
  ),
  textField(
    "externalCollaborators",
    "Kolaborator eksternal (opsional)",
    "Nama institusi atau penulis eksternal; pisahkan dengan titik koma",
    { required: false, wide: true },
  ),
] as const satisfies readonly ManualFieldDefinition[];

const publicationIdentifier = textField(
  "identifier",
  "DOI / ISBN / pengenal resmi (opsional)",
  "Contoh: 10.1109/ACCESS.2026.1234567",
  {
    required: false,
  },
);

const patentFields = [
  textField(
    "creators",
    "Inventor",
    "Pisahkan beberapa nama dengan titik koma",
    { wide: true },
  ),
  textField("applicationNumber", "Nomor permohonan", "Contoh: P00202601234", {
    hint: "Opsional bila nomor belum diterbitkan.",
    required: false,
  }),
  {
    key: "submissionDate",
    label: "Tanggal pengajuan",
    required: true,
    type: "date",
  },
] as const satisfies readonly ManualFieldDefinition[];

const nonPatentIntellectualPropertyFields = [
  textField(
    "creators",
    "Pencipta / pemilik",
    "Pisahkan beberapa nama dengan titik koma",
    { wide: true },
  ),
  textField(
    "applicationNumber",
    "Nomor pencatatan / permohonan (opsional)",
    "Masukkan nomor bila sudah diterbitkan",
    { required: false },
  ),
  {
    hint: "Boleh dikosongkan bila sumber hanya mencatat tahun pengajuan.",
    key: "submissionDate",
    label: "Tanggal pengajuan (opsional)",
    required: false,
    type: "date",
  },
] as const satisfies readonly ManualFieldDefinition[];

const researchContractFields = [
  textField(
    "applicants",
    "Ketua / tim peneliti",
    "Nama ketua atau tim peneliti; pisahkan dengan titik koma",
    { wide: true },
  ),
  textField("scheme", "Skema riset", "Nama skema atau program riset"),
  textField(
    "partner",
    "Mitra (opsional)",
    "Nama institusi mitra bila tercantum",
    { required: false },
  ),
  textField(
    "referenceNumber",
    "Nomor kontrak (opsional)",
    "Nomor dokumen resmi bila tersedia",
    { required: false },
  ),
] as const satisfies readonly ManualFieldDefinition[];

const commercialContractFields = [
  textField(
    "partner",
    "Pihak kontrak (opsional)",
    "Nama pihak atau mitra bila tercantum",
    { required: false, wide: true },
  ),
  {
    key: "startDate",
    label: "Tanggal mulai kontrak",
    required: true,
    type: "date",
  },
  {
    key: "endDate",
    label: "Tanggal selesai kontrak",
    required: true,
    type: "date",
  },
  textField(
    "referenceNumber",
    "Nomor kontrak (opsional)",
    "Nomor dokumen resmi bila tersedia",
    { required: false },
  ),
] as const satisfies readonly ManualFieldDefinition[];

const proposalFields = [
  textField(
    "applicants",
    "Pengusul",
    "Nama ketua dan anggota pengusul; pisahkan dengan titik koma",
    { wide: true },
  ),
  textField("scheme", "Skema / program hibah", "Nama skema atau program"),
  textField(
    "partner",
    "Mitra (opsional)",
    "Nama mitra yang tercantum pada proposal",
    { required: false },
  ),
  textField("funder", "Instansi pemberi hibah", "Nama lembaga pemberi hibah"),
  {
    hint: "Boleh dikosongkan bila bukti submit hanya mencatat periode atau tahun.",
    key: "submissionDate",
    label: "Tanggal pengajuan (opsional)",
    required: false,
    type: "date",
  },
  textField(
    "referenceNumber",
    "Nomor proposal (opsional)",
    "Nomor registrasi atau identitas pengajuan bila tersedia",
    { required: false },
  ),
] as const satisfies readonly ManualFieldDefinition[];

const nonResearchProgramCoreFields = [
  textField("scheme", "Skema", "Nama skema atau bentuk program"),
  textField(
    "team",
    "Dosen / tim pelaksana",
    "Nama ketua dan anggota tim; pisahkan dengan titik koma",
    { wide: true },
  ),
  textField(
    "targetGroup",
    "Mitra / masyarakat sasaran",
    "Nama mitra atau kelompok sasaran",
  ),
  {
    hint: "Masukkan angka tanpa pemisah ribuan. Boleh dikosongkan bila nominal belum ditetapkan atau dibatasi aksesnya.",
    key: "funding",
    label: "Dana (Rp, opsional)",
    min: "0",
    placeholder: "Contoh: 250000000",
    required: false,
    type: "number",
  },
] as const satisfies readonly ManualFieldDefinition[];

const nonResearchServiceFields = [
  ...nonResearchProgramCoreFields,
  textField(
    "referenceNumber",
    "Nomor kontrak / referensi (opsional)",
    "Nomor dokumen resmi bila tersedia",
    { required: false },
  ),
] as const satisfies readonly ManualFieldDefinition[];

const communityServiceFields = [
  ...nonResearchProgramCoreFields,
] as const satisfies readonly ManualFieldDefinition[];

const abdimasProposalFields = [
  ...nonResearchProgramCoreFields,
  {
    hint: "Boleh dikosongkan bila bukti submit hanya mencatat periode atau tahun.",
    key: "submissionDate",
    label: "Tanggal pengajuan (opsional)",
    required: false,
    type: "date",
  },
  textField(
    "referenceNumber",
    "Nomor proposal (opsional)",
    "Nomor registrasi atau identitas pengajuan bila tersedia",
    { required: false },
  ),
] as const satisfies readonly ManualFieldDefinition[];

const sdgProposalFields = [
  ...abdimasProposalFields,
  textField(
    "sdgAlignment",
    "Keterkaitan SDGs (opsional)",
    "Contoh: SDG 3 — Kehidupan Sehat dan Sejahtera",
    {
      hint: "Isi bila nomor atau sasaran SDG tercantum pada proposal.",
      required: false,
      wide: true,
    },
  ),
] as const satisfies readonly ManualFieldDefinition[];

const mentoringFields = [
  textField(
    "participantRef",
    "Mahasiswa",
    "Nama atau kode mahasiswa yang sesuai kebijakan akses",
    { wide: true },
  ),
  textField("programStudy", "Program studi", "Contoh: S2 Teknik Biomedis"),
  textField(
    "mentors",
    "Pembimbing / penanggung jawab",
    "Pisahkan beberapa nama dengan titik koma",
    { wide: true },
  ),
] as const satisfies readonly ManualFieldDefinition[];

const internshipFields = [
  textField("studentNumber", "NIM", "Nomor induk mahasiswa"),
  textField("participantRef", "Nama mahasiswa", "Nama mahasiswa"),
  textField("faculty", "Fakultas", "Nama fakultas"),
  textField("programStudy", "Program studi", "Nama program studi"),
  textField("mbkmProgram", "Program MBKM (opsional)", "Nama program MBKM", {
    required: false,
  }),
  textField(
    "organizer",
    "Penyelenggara (opsional)",
    "Nama unit atau institusi penyelenggara",
    { required: false },
  ),
  textField("mentorId", "NIDN pembimbing", "NIDN dosen pembimbing", {
    required: false,
  }),
  textField("mentors", "Dosen pembimbing", "Nama dosen pembimbing"),
  textField("duration", "Lama kegiatan", "Contoh: 5 bulan"),
] as const satisfies readonly ManualFieldDefinition[];

const competitionFields = [
  textField("lecturer", "Dosen pembimbing", "Nama dosen pembimbing"),
  textField(
    "studentTeam",
    "Mahasiswa / tim (opsional)",
    "Nama atau kode peserta; pisahkan dengan titik koma",
    { required: false, wide: true },
  ),
] as const satisfies readonly ManualFieldDefinition[];

const businessUnitFields = [
  textField("primaryParty", "Dosen / pengelola", "Nama dosen atau pengelola"),
  textField("role", "Peran", "Peran pada unit bisnis"),
  textField(
    "organization",
    "Unit bisnis",
    "Nama unit bisnis, LSP, atau start-up",
  ),
] as const satisfies readonly ManualFieldDefinition[];

const communityCoachingFields = [
  textField("primaryParty", "Dosen / pembina", "Nama dosen atau pembina"),
  textField(
    "organization",
    "UMKM / komunitas",
    "Nama UMKM atau komunitas sasaran",
  ),
] as const satisfies readonly ManualFieldDefinition[];

const conferenceManagementFields = [
  {
    key: "eventDate",
    label: "Tanggal kegiatan",
    required: true,
    type: "date",
  },
  textField("location", "Tempat", "Kota, negara, atau kanal pelaksanaan"),
] as const satisfies readonly ManualFieldDefinition[];

const journalAccreditationFields = [
  textField("journalVolume", "Volume jurnal", "Contoh: Volume 8"),
  textField("issn", "ISSN", "Contoh: 1234-5678"),
  textField(
    "publicationFrequency",
    "Frekuensi terbit",
    "Contoh: 2 kali per tahun",
  ),
  textField(
    "primaryParty",
    "Pengelola (opsional)",
    "Nama dosen atau tim pengelola",
    { required: false },
  ),
] as const satisfies readonly ManualFieldDefinition[];

const invitedSpeakerFields = [
  textField("speakerName", "Nama pembicara", "Nama pembicara undangan"),
  textField("eventName", "Nama acara", "Nama konferensi internasional"),
  {
    key: "eventDate",
    label: "Tanggal",
    required: true,
    type: "date",
  },
  textField("location", "Tempat", "Kota, negara, atau kanal pelaksanaan"),
] as const satisfies readonly ManualFieldDefinition[];

const institutionVisitFields = [
  textField("institution", "Institusi", "Nama lembaga internasional"),
  textField("delegationLead", "Ketua rombongan", "Nama ketua rombongan"),
  {
    key: "eventDate",
    label: "Tanggal",
    required: true,
    type: "date",
  },
  textField("location", "Tempat", "Lokasi kunjungan"),
] as const satisfies readonly ManualFieldDefinition[];

export const manualSubmissionDefinitions: Record<
  ManualSubmissionDomain,
  ManualDomainDefinition
> = {
  publication: {
    buttonLabel: "Ajukan publikasi",
    category: "publication_conference",
    description:
      "Catat publikasi yang belum ada di Data Resmi. Sistem menyarankan indikator KM dari metadata; reviewer yang memverifikasi keterkaitannya.",
    eyebrow: "Data Resmi · Publikasi",
    noun: "publikasi",
    primaryFieldKey: "authors",
    subtypes: [
      {
        fields: [
          ...publicationInvolvementFields,
          textField("venue", "Nama jurnal", "Nama jurnal nasional", {
            wide: true,
          }),
          {
            key: "publicationDate",
            label: "Tanggal publikasi",
            required: true,
            type: "date",
          },
          selectField("sintaRank", "Peringkat SINTA", [
            { label: "S1", value: "S1" },
            { label: "S2", value: "S2" },
            { label: "S3", value: "S3" },
            { label: "S4", value: "S4" },
          ]),
          publicationIdentifier,
        ],
        id: "national-journal",
        label: "Jurnal nasional S1–S4",
        suggestion: suggestion(
          "KM-12",
          "Jenis publikasi dan peringkat SINTA mengarah ke jurnal nasional S1–S4.",
          "Tautan artikel atau laman jurnal, penulis, tahun, dan peringkat SINTA yang dapat diverifikasi.",
        ),
        typeLabel: "Publikasi jurnal nasional",
      },
      {
        fields: [
          ...publicationInvolvementFields,
          textField("venue", "Nama jurnal", "Nama jurnal internasional", {
            wide: true,
          }),
          selectField("quartile", "Kuartil yang dilaporkan", [
            { label: "Q1", value: "Q1" },
            { label: "Q2", value: "Q2" },
            { label: "Q3", value: "Q3" },
            { label: "Q4", value: "Q4" },
            { label: "Belum diketahui", value: "unknown" },
          ]),
          publicationIdentifier,
        ],
        id: "international-journal",
        label: "Jurnal internasional bereputasi",
        suggestion: (values) => {
          if (values.quartile === "Q1" || values.quartile === "Q2") {
            return suggestion(
              "KM-14",
              `Jenis jurnal dan kuartil ${values.quartile} yang dilaporkan mengarah ke publikasi setara Q1/Q2.`,
              "Tautan artikel/DOI, penulis, tahun, dan bukti kuartil dari sumber yang dapat diaudit.",
            );
          }
          if (values.quartile === "Q3" || values.quartile === "Q4") {
            return suggestion(
              "KM-13",
              `Jenis jurnal dan kuartil ${values.quartile} yang dilaporkan mengarah ke jurnal bereputasi selain Q1/Q2.`,
              "Tautan artikel/DOI, penulis, tahun, serta sumber kuartil atau reputasi jurnal.",
            );
          }
          return null;
        },
        typeLabel: "Publikasi jurnal internasional",
      },
      {
        fields: [
          ...publicationInvolvementFields,
          textField(
            "venue",
            "Nama konferensi",
            "Nama forum atau prosiding internasional",
            { wide: true },
          ),
          publicationIdentifier,
        ],
        id: "international-conference",
        label: "Makalah konferensi internasional",
        suggestion: suggestion(
          "KM-11",
          "Jenis rekam menunjukkan makalah konferensi internasional.",
          "Tautan prosiding atau makalah, penulis, tahun, dan identitas konferensi internasional.",
        ),
        typeLabel: "Makalah konferensi internasional",
      },
      {
        category: "academic_hr",
        fields: [
          ...publicationInvolvementFields,
          textField("publisher", "Penerbit (opsional)", "Nama penerbit", {
            required: false,
          }),
          publicationIdentifier,
        ],
        id: "book",
        label: "Buku / monograf / referensi",
        suggestion: suggestion(
          "KM-33",
          "Jenis rekam menunjukkan buku, monograf, atau referensi.",
          "Tautan katalog/penerbit, penulis, tahun, dan ISBN bila tersedia.",
        ),
        typeLabel: "Buku atau monograf",
      },
      {
        fields: [
          ...publicationInvolvementFields,
          textField("venue", "Penerbit / forum", "Nama penerbit atau forum", {
            required: false,
            wide: true,
          }),
          publicationIdentifier,
        ],
        id: "other-publication",
        label: "Jenis publikasi lainnya",
        typeLabel: "Publikasi lainnya",
      },
    ],
    title: "Ajukan Publikasi",
    titleFieldLabel: "Judul publikasi",
    titlePlaceholder: "Masukkan judul publikasi",
  },
  "intellectual-property": {
    buttonLabel: "Ajukan kekayaan intelektual",
    category: "innovation_ip",
    description:
      "Ajukan HKI atau paten baru dengan tautan bukti yang dapat diperiksa. Klasifikasi KM tetap menjadi keputusan reviewer.",
    eyebrow: "Data Resmi · Kekayaan Intelektual",
    noun: "kekayaan intelektual",
    primaryFieldKey: "creators",
    subtypes: [
      {
        fields: patentFields,
        id: "patent",
        label: "Paten / paten sederhana",
        suggestion: suggestion(
          "KM-16",
          "Jenis perlindungan menunjukkan paten dengan status minimal diajukan.",
          "Tautan bukti permohonan, tanggal pengajuan, pencipta/inventor, dan nomor permohonan bila tersedia.",
        ),
        typeLabel: "Paten",
      },
      {
        fields: nonPatentIntellectualPropertyFields,
        id: "copyright",
        label: "Hak cipta",
        suggestion: suggestion(
          "KM-15",
          "Jenis perlindungan termasuk kekayaan intelektual non-paten.",
          "Tautan bukti pencatatan atau permohonan, pencipta, dan tanggal pengajuan.",
        ),
        typeLabel: "Hak cipta",
      },
      {
        fields: nonPatentIntellectualPropertyFields,
        id: "industrial-design",
        label: "Desain industri",
        suggestion: suggestion(
          "KM-15",
          "Jenis perlindungan termasuk kekayaan intelektual non-paten.",
          "Tautan bukti pencatatan atau permohonan, pencipta, dan tanggal pengajuan.",
        ),
        typeLabel: "Desain industri",
      },
      {
        fields: nonPatentIntellectualPropertyFields,
        id: "trademark",
        label: "Merek",
        suggestion: suggestion(
          "KM-15",
          "Jenis perlindungan termasuk kekayaan intelektual non-paten.",
          "Tautan bukti pencatatan atau permohonan, pencipta/pemilik, dan tanggal pengajuan.",
        ),
        typeLabel: "Merek",
      },
      {
        fields: nonPatentIntellectualPropertyFields,
        id: "other-ip",
        label: "Jenis perlindungan lainnya",
        typeLabel: "Kekayaan intelektual lainnya",
      },
    ],
    title: "Ajukan Kekayaan Intelektual",
    titleFieldLabel: "Judul karya / invensi",
    titlePlaceholder: "Masukkan judul yang tercantum pada dokumen permohonan",
  },
  contract: {
    buttonLabel: "Ajukan kontrak / proposal",
    category: "research_business",
    description:
      "Catat kontrak atau proposal dengan pihak, periode, dan bukti utama. Sistem menyarankan KM dari jenis dan cakupan rekam.",
    eyebrow: "Data Resmi · Kontrak & Proposal",
    noun: "kontrak atau proposal",
    primaryFieldKey: "primaryParty",
    subtypes: [
      {
        fields: researchContractFields,
        id: "national-research-contract",
        label: "Kontrak riset nasional",
        primaryFieldKey: "applicants",
        suggestion: suggestion(
          "KM-17",
          "Jenis dan cakupan rekam menunjukkan kontrak riset tingkat nasional.",
          "Tautan kontrak, pihak, nomor dokumen, serta periode pelaksanaan.",
        ),
        typeLabel: "Kontrak riset nasional",
      },
      {
        fields: researchContractFields,
        id: "international-research-contract",
        label: "Kontrak riset internasional",
        primaryFieldKey: "applicants",
        suggestion: suggestion(
          "KM-18",
          "Jenis dan cakupan rekam menunjukkan kontrak riset tingkat internasional.",
          "Tautan kontrak, pihak internasional, nomor dokumen, dan periode pelaksanaan.",
        ),
        typeLabel: "Kontrak riset internasional",
      },
      {
        fields: commercialContractFields,
        id: "commercial-contract",
        label: "Kontrak komersialisasi",
        primaryFieldKey: "partner",
        suggestion: suggestion(
          "KM-19",
          "Jenis rekam menunjukkan kontrak bisnis untuk komersialisasi.",
          "Tautan kontrak, para pihak, objek komersialisasi, dan periode pelaksanaan.",
        ),
        typeLabel: "Kontrak komersialisasi",
      },
      {
        fields: proposalFields,
        id: "national-research-proposal",
        label: "Proposal riset nasional",
        primaryFieldKey: "applicants",
        suggestion: suggestion(
          "KM-37",
          "Jenis dan cakupan rekam menunjukkan proposal riset tingkat nasional.",
          "Tautan bukti submit, skema, pengusul, dan tanggal pengajuan.",
        ),
        typeLabel: "Proposal riset nasional",
      },
      {
        fields: proposalFields,
        id: "international-research-proposal",
        label: "Proposal riset internasional",
        primaryFieldKey: "applicants",
        suggestion: suggestion(
          "KM-38",
          "Jenis dan cakupan rekam menunjukkan proposal riset tingkat internasional.",
          "Tautan bukti submit, skema internasional, pengusul, dan tanggal pengajuan.",
        ),
        typeLabel: "Proposal riset internasional",
      },
      {
        fields: proposalFields,
        id: "non-research-proposal",
        label: "Proposal non-riset",
        primaryFieldKey: "applicants",
        suggestion: suggestion(
          "KM-39",
          "Jenis rekam menunjukkan proposal pelatihan, transfer teknologi, konsultansi, hilirisasi, atau pengabdian.",
          "Tautan bukti submit, skema, pengusul, dan tanggal pengajuan.",
        ),
        typeLabel: "Proposal non-riset",
      },
    ],
    title: "Ajukan Kontrak & Proposal",
    titleFieldLabel: "Judul kontrak / proposal",
    titlePlaceholder: "Masukkan nama kegiatan atau judul dokumen",
  },
  academic: {
    buttonLabel: "Ajukan kegiatan akademik",
    category: "academic_hr",
    description:
      "Catat bimbingan, magang, tugas akhir, atau kegiatan mahasiswa. Gunakan referensi peserta yang sesuai kebijakan akses data.",
    eyebrow: "Data Resmi · Akademik",
    noun: "kegiatan akademik",
    primaryFieldKey: "participantRef",
    subtypes: [
      {
        fields: mentoringFields,
        id: "doctoral-mentoring",
        label: "Bimbingan doktor",
        suggestion: suggestion(
          "KM-28",
          "Jenis kegiatan menunjukkan bimbingan doktor dengan topik riset CoE.",
          "Tautan bukti bimbingan, peserta, pembimbing, program studi, dan keterkaitan topik dengan riset CoE.",
        ),
        typeLabel: "Bimbingan doktor",
      },
      {
        fields: mentoringFields,
        id: "master-mentoring",
        label: "Bimbingan magister",
        suggestion: suggestion(
          "KM-29",
          "Jenis kegiatan menunjukkan bimbingan magister dengan topik riset CoE.",
          "Tautan bukti bimbingan, peserta, pembimbing, program studi, dan keterkaitan topik dengan riset CoE.",
        ),
        typeLabel: "Bimbingan magister",
      },
      {
        fields: internshipFields,
        id: "student-internship",
        label: "Magang mahasiswa",
        suggestion: suggestion(
          "KM-30",
          "Jenis kegiatan menunjukkan kapasitas magang mahasiswa.",
          "Tautan bukti program magang, periode, jumlah dan referensi peserta, serta penanggung jawab.",
        ),
        typeLabel: "Magang mahasiswa",
      },
      {
        fields: mentoringFields,
        id: "final-project",
        label: "Riset tugas akhir D3/S1/S2",
        suggestion: suggestion(
          "KM-31",
          "Jenis kegiatan menunjukkan riset tugas akhir mahasiswa.",
          "Tautan bukti tugas akhir, peserta, pembimbing, program studi, dan topik riset.",
        ),
        typeLabel: "Riset tugas akhir",
      },
      {
        fields: competitionFields,
        id: "student-competition",
        label: "Ide / inovasi kompetisi mahasiswa",
        primaryFieldKey: "lecturer",
        suggestion: suggestion(
          "KM-32",
          "Jenis kegiatan menunjukkan ide atau inovasi untuk kompetisi mahasiswa.",
          "Tautan bukti kompetisi, peserta/tim, pembimbing, dan deskripsi ide atau inovasi.",
        ),
        typeLabel: "Kompetisi mahasiswa",
      },
    ],
    title: "Ajukan Kegiatan Akademik",
    titleFieldLabel: "Topik riset / nama kegiatan",
    titlePlaceholder: "Masukkan topik atau nama kegiatan akademik",
  },
  activity: {
    buttonLabel: "Ajukan kegiatan / pengabdian",
    category: "community_service",
    description:
      "Catat kegiatan bisnis, komunitas, konferensi, pengabdian, atau pengelolaan jurnal dengan bukti yang dapat diaudit.",
    eyebrow: "Data Resmi · Kegiatan & Pengabdian",
    noun: "kegiatan atau pengabdian",
    primaryFieldKey: "primaryParty",
    subtypes: [
      {
        category: "activity_governance",
        fields: invitedSpeakerFields,
        id: "invited-speaker",
        label: "Pembicara undangan konferensi internasional",
        primaryFieldKey: "speakerName",
        suggestion: suggestion(
          "KM-9",
          "Jenis kegiatan menunjukkan peran sebagai pembicara undangan pada konferensi internasional.",
          "Nama pembicara, nama acara, tanggal, tempat, dan tautan bukti undangan atau acara.",
        ),
        titleRequired: false,
        typeLabel: "Pembicara undangan internasional",
      },
      {
        category: "activity_governance",
        fields: institutionVisitFields,
        id: "international-institution-visit",
        label: "Kunjungan lembaga internasional",
        primaryFieldKey: "institution",
        suggestion: suggestion(
          "KM-10",
          "Jenis kegiatan menunjukkan kunjungan lembaga internasional ke CoE.",
          "Nama institusi, ketua rombongan, tanggal, tempat, dan tautan bukti kunjungan.",
        ),
        titleRequired: false,
        typeLabel: "Kunjungan lembaga internasional",
      },
      {
        category: "activity_governance",
        fields: businessUnitFields,
        id: "business-unit",
        label: "Keterlibatan unit bisnis",
        suggestion: suggestion(
          "KM-20",
          "Jenis kegiatan menunjukkan keterlibatan unit bisnis yang melayani jasa sesuai kompetensi CoE.",
          "Tautan bukti keterlibatan, unit bisnis, layanan, periode, dan peran CoE.",
        ),
        titleRequired: false,
        typeLabel: "Keterlibatan unit bisnis",
      },
      {
        fields: communityCoachingFields,
        id: "community-coaching",
        label: "Pembinaan UMKM / komunitas",
        suggestion: suggestion(
          "KM-21",
          "Jenis kegiatan menunjukkan pembinaan UMKM atau komunitas.",
          "Tautan bukti kegiatan, mitra/komunitas, sasaran, tanggal, dan peran tim CoE.",
        ),
        titleRequired: false,
        typeLabel: "Pembinaan UMKM atau komunitas",
      },
      {
        category: "activity_governance",
        fields: conferenceManagementFields,
        id: "international-conference-management",
        label: "Pengelolaan konferensi internasional",
        primaryFieldKey: "title",
        suggestion: suggestion(
          "KM-22",
          "Jenis kegiatan menunjukkan pengelolaan atau internasionalisasi seminar/konferensi.",
          "Tautan laman/acara, peran pengelola, cakupan internasional, tanggal, dan penyelenggara.",
        ),
        typeLabel: "Pengelolaan konferensi internasional",
      },
      {
        fields: nonResearchServiceFields,
        id: "non-research-service",
        label: "Layanan / kontrak non-riset",
        primaryFieldKey: "team",
        suggestion: suggestion(
          "KM-23",
          "Jenis kegiatan menunjukkan pelatihan, konsultansi, atau layanan non-riset.",
          "Tautan bukti layanan/kontrak, pihak, ruang lingkup, tanggal, dan peran CoE.",
        ),
        typeLabel: "Layanan non-riset",
      },
      {
        fields: communityServiceFields,
        id: "community-service",
        label: "Community service / CSR",
        primaryFieldKey: "team",
        suggestion: suggestion(
          "KM-24",
          "Jenis kegiatan menunjukkan pengabdian masyarakat, kolaborasi, atau CSR.",
          "Tautan bukti kegiatan, mitra, penerima manfaat, tanggal, dan kontribusi CoE.",
        ),
        typeLabel: "Community service atau CSR",
      },
      {
        fields: abdimasProposalFields,
        id: "drtpm-proposal",
        label: "Proposal abdimas DRTPM",
        primaryFieldKey: "team",
        suggestion: suggestion(
          "KM-25",
          "Jenis rekam menunjukkan proposal pengabdian DRTPM.",
          "Tautan bukti submit, skema DRTPM, pengusul, mitra/sasaran, dan tanggal pengajuan.",
        ),
        typeLabel: "Proposal abdimas DRTPM",
      },
      {
        fields: sdgProposalFields,
        id: "sdg-proposal",
        label: "Proposal abdimas terkait SDGs",
        primaryFieldKey: "team",
        suggestion: suggestion(
          "KM-26",
          "Jenis rekam menunjukkan proposal pengabdian yang berkaitan dengan SDGs.",
          "Tautan bukti submit, skema, SDG terkait, pengusul, dan mitra/sasaran.",
        ),
        typeLabel: "Proposal abdimas terkait SDGs",
      },
      {
        category: "activity_governance",
        fields: journalAccreditationFields,
        id: "journal-accreditation",
        label: "Pengelolaan akreditasi jurnal",
        primaryFieldKey: "primaryParty",
        suggestion: suggestion(
          "KM-27",
          "Jenis kegiatan menunjukkan pengelolaan, peningkatan, atau internasionalisasi akreditasi jurnal.",
          "Tautan jurnal/bukti akreditasi, peran pengelola, periode, dan capaian peningkatan.",
        ),
        typeLabel: "Pengelolaan akreditasi jurnal",
      },
    ],
    title: "Ajukan Kegiatan & Pengabdian",
    titleFieldLabel: "Nama kegiatan / program",
    titlePlaceholder: "Masukkan nama kegiatan atau program",
  },
};

export function createEmptyManualSubmissionValues(): ManualSubmissionValues {
  return {
    evidenceUrl: "",
    note: "",
    recordType: "",
    title: "",
    year: "",
  };
}

export function manualSubtype(
  domain: ManualSubmissionDomain,
  recordType: string,
) {
  return manualSubmissionDefinitions[domain].subtypes.find(
    (item) => item.id === recordType,
  );
}

export function manualSubtypeFieldKeys(
  domain: ManualSubmissionDomain,
  recordType: string,
) {
  return new Set(
    manualSubtype(domain, recordType)?.fields.map((field) => field.key) ?? [],
  );
}

export function manualKmSuggestion(
  domain: ManualSubmissionDomain,
  values: ManualSubmissionValues,
): ManualKmSuggestion | null {
  const subtype = manualSubtype(domain, values.recordType);
  if (!subtype?.suggestion) return null;
  const resolved =
    typeof subtype.suggestion === "function"
      ? subtype.suggestion(values)
      : subtype.suggestion;
  if (!resolved) return null;
  return { ...resolved, indicator: kmIndicator(resolved.indicatorId) };
}

function normalizeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function validateManualSubmissionFields(
  domain: ManualSubmissionDomain,
  values: ManualSubmissionValues,
  scope: "details" | "identity" | "all",
) {
  const errors: Record<string, string> = {};
  const definition = manualSubmissionDefinitions[domain];
  const subtype = manualSubtype(domain, values.recordType);

  if (scope !== "details") {
    if (!values.recordType.trim())
      errors.recordType = `Pilih jenis ${definition.noun}.`;
    if (subtype) {
      if (subtype.titleRequired !== false && !values.title.trim())
        errors.title = `${subtype.titleFieldLabel ?? definition.titleFieldLabel} wajib diisi.`;
      const year = Number(values.year);
      if (!values.year.trim()) {
        errors.year = "Tahun wajib diisi.";
      } else if (
        !Number.isInteger(year) ||
        year < 2000 ||
        year > new Date().getFullYear() + 1
      ) {
        errors.year = `Gunakan tahun 2000–${new Date().getFullYear() + 1}.`;
      }
    }
  }

  if (scope !== "identity" && subtype) {
    for (const field of subtype?.fields ?? []) {
      if (field.required && !values[field.key]?.trim()) {
        errors[field.key] = `${field.label} wajib diisi.`;
      }
    }

    if (!values.evidenceUrl.trim()) {
      errors.evidenceUrl = "Tautan bukti utama wajib diisi.";
    } else if (!normalizeUrl(values.evidenceUrl)) {
      errors.evidenceUrl = "Gunakan tautan lengkap yang diawali https://.";
    }

    if (
      values.startDate &&
      values.endDate &&
      values.endDate < values.startDate
    ) {
      errors.endDate =
        "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.";
    }

    const selectedYear = Number(values.year);
    const datedFields = [
      "eventDate",
      "publicationDate",
      "submissionDate",
      "startDate",
    ];
    for (const key of datedFields) {
      const dateValue = values[key];
      if (!dateValue || !Number.isInteger(selectedYear)) continue;
      const dateYear = Number(dateValue.slice(0, 4));
      if (dateYear !== selectedYear) {
        const label = subtype?.fields.find((field) => field.key === key)?.label;
        errors[key] =
          `${label ?? "Tanggal"} harus berada pada tahun ${selectedYear}.`;
      }
    }
  }

  return errors;
}

function comparisonStatusLabel(score: number) {
  return score === 100 ? "Sama" : "Mirip";
}

function titleSimilarity(left: string, right: string) {
  const normalizedLeft = normalizeWorkspaceSearch(left);
  const normalizedRight = normalizeWorkspaceSearch(right);
  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 100;

  const leftTokens = new Set(normalizedLeft.split(" ").filter(Boolean));
  const rightTokens = new Set(normalizedRight.split(" ").filter(Boolean));
  const intersection = [...leftTokens].filter((token) =>
    rightTokens.has(token),
  );
  const union = new Set([...leftTokens, ...rightTokens]);
  return Math.round((intersection.length / Math.max(union.size, 1)) * 100);
}

export function createManualOfficialMatches(
  values: ManualSubmissionValues,
  candidates: readonly ManualRecordComparisonCandidate[],
): AuditOfficialMatch[] {
  const candidateIdentifiers = manualSubmissionIdentifiers(values);
  const normalizedIdentifiers = new Set(
    candidateIdentifiers.map(normalizeIdentifier).filter(Boolean),
  );

  return candidates
    .map((candidate) => {
      const sameIdentifier = (candidate.identifiers ?? []).some((identifier) =>
        normalizedIdentifiers.has(normalizeIdentifier(identifier)),
      );
      const titleScore = titleSimilarity(values.title, candidate.title);
      const sameYear =
        !candidate.year ||
        !values.year ||
        candidate.year === Number(values.year);
      return {
        candidate,
        sameIdentifier,
        score: sameIdentifier
          ? 100
          : sameYear
            ? titleScore
            : Math.max(titleScore - 12, 0),
        titleScore,
      };
    })
    .filter(({ sameIdentifier, score }) => sameIdentifier || score >= 55)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ candidate, sameIdentifier, score, titleScore }) => ({
      comparisons: [
        ...(candidateIdentifiers.length > 0 && candidate.identifiers?.length
          ? [
              {
                candidateValue: candidateIdentifiers.join("; "),
                fieldId: "identifier",
                label: "Pengenal resmi",
                officialValue: candidate.identifiers.join("; "),
                status: sameIdentifier
                  ? ("same" as const)
                  : ("different" as const),
                statusLabel: sameIdentifier ? "Sama" : "Berbeda",
              },
            ]
          : []),
        ...(values.title.trim()
          ? [
              {
                candidateValue: values.title,
                fieldId: "title",
                label: "Judul",
                officialValue: candidate.title,
                status:
                  titleScore === 100 ? ("same" as const) : ("similar" as const),
                statusLabel: comparisonStatusLabel(titleScore),
              },
            ]
          : []),
        ...(candidate.year && values.year
          ? [
              {
                candidateValue: values.year,
                fieldId: "year",
                label: "Tahun",
                officialValue: String(candidate.year),
                status:
                  candidate.year === Number(values.year)
                    ? ("same" as const)
                    : ("different" as const),
                statusLabel:
                  candidate.year === Number(values.year) ? "Sama" : "Berbeda",
              },
            ]
          : []),
      ],
      id: candidate.id,
      score,
      title: candidate.subtitle
        ? `${candidate.title} · ${candidate.subtitle}`
        : candidate.title,
      verdict: sameIdentifier
        ? "same_identifier"
        : titleScore === 100
          ? "strong"
          : "possible",
      verdictLabel: sameIdentifier
        ? "Pengenal resmi sama"
        : titleScore === 100
          ? "Judul sama"
          : "Perlu periksa kemiripan judul",
    }));
}

export function manualSubmissionIdentifiers(values: ManualSubmissionValues) {
  return [
    "applicationNumber",
    "doi",
    "identifier",
    "issn",
    "licenseNumber",
    "referenceNumber",
    "registrationNumber",
    "studentNumber",
  ]
    .map((key) => values[key]?.trim())
    .filter((value): value is string => Boolean(value));
}

function normalizeIdentifier(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("id-ID")
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, "")
    .replace(/^doi:\s*/, "")
    .replace(/[^a-z0-9]/g, "");
}

function actorLabel(actor: NexusReviewActor) {
  return `${actor.name} · ${actor.roleLabel}`;
}

function reviewFields(
  definition: ManualDomainDefinition,
  subtype: ManualSubtypeDefinition,
  values: ManualSubmissionValues,
): AuditReviewField[] {
  const fields: AuditReviewField[] = [
    ...(values.title.trim()
      ? [
          {
            id: "title",
            label: subtype.titleFieldLabel ?? definition.titleFieldLabel,
            value: values.title.trim(),
          },
        ]
      : []),
    { id: "record_type", label: "Jenis rekam", value: subtype.label },
    { id: "year", label: "Tahun", value: values.year },
  ];

  for (const field of subtype.fields) {
    const value = values[field.key]?.trim();
    if (!value) continue;
    const choiceLabel = field.choices?.find(
      (choice) => choice.value === value,
    )?.label;
    fields.push({
      id: field.key,
      label: field.label,
      value: choiceLabel ?? value,
    });
  }

  if (values.note.trim()) {
    fields.push({
      id: "submitter_note",
      label: "Catatan pengaju",
      value: values.note.trim(),
    });
  }

  return fields;
}

export function createManualSubmissionReviewRecord({
  actor,
  comparisonCandidates,
  domain,
  id,
  values,
}: {
  actor: NexusReviewActor;
  comparisonCandidates: readonly ManualRecordComparisonCandidate[];
  domain: ManualSubmissionDomain;
  id: string;
  values: ManualSubmissionValues;
}): AuditReviewRecord {
  const now = new Date();
  const definition = manualSubmissionDefinitions[domain];
  const subtype = manualSubtype(domain, values.recordType);
  if (!subtype) throw new Error("Jenis rekam manual tidak dikenal.");
  const km = manualKmSuggestion(domain, values);
  const submitter = actorLabel(actor);
  const evidenceUrl = normalizeUrl(values.evidenceUrl);
  if (!evidenceUrl) throw new Error("Tautan bukti manual tidak valid.");
  const fields = reviewFields(definition, subtype, values);
  const matches = createManualOfficialMatches(values, comparisonCandidates);
  const primaryFieldKey = subtype.primaryFieldKey ?? definition.primaryFieldKey;
  const primaryValue = primaryFieldKey ? values[primaryFieldKey]?.trim() : "";
  const displayTitle =
    values.title.trim() ||
    values.eventName?.trim() ||
    values.organization?.trim() ||
    values.institution?.trim() ||
    `${subtype.label} · ${primaryValue || values.year}`;

  return {
    candidateKind: "new_record",
    category: subtype.category ?? definition.category,
    categoryLabel:
      subtype.category === "activity_governance"
        ? "Kegiatan & tata kelola"
        : subtype.category === "academic_hr" ||
            definition.category === "academic_hr"
          ? "Akademik & SDM"
          : definition.category === "innovation_ip"
            ? "HKI, paten & inovasi"
            : definition.category === "publication_conference"
              ? "Publikasi & konferensi"
              : definition.category === "research_business"
                ? "Riset & bisnis"
                : "Pengabdian masyarakat",
    correctionAssigneeActorId: actor.id,
    correctionAssigneeLabel: submitter,
    discoveredAt: now.toISOString(),
    discoveredAtLabel: formatAuditTimestamp(now),
    evidence: [
      {
        href: evidenceUrl.toString(),
        id: `${id}-evidence-main`,
        label: "Bukti utama pengajuan",
        reference: evidenceUrl.toString(),
        sourceLabel: "Tautan pengajuan manual",
      },
    ],
    evaluationPeriodLabel: values.year,
    fields,
    history: [
      {
        actor: submitter,
        actorId: actor.id,
        id: `${id}-submitted`,
        kind: "submitted",
        label: "Kandidat manual masuk ke antrean",
        occurredAt: now.toISOString(),
        version: 1,
      },
    ],
    id,
    kpiLinks: km
      ? [
          {
            evidenceRule: km.evidenceRule,
            indicator: km.indicator,
          },
        ]
      : [],
    kpiLinksSuggested: Boolean(km),
    matches,
    manualSubmission: {
      comparisonCandidates: comparisonCandidates.map((candidate) => ({
        ...candidate,
        identifiers: candidate.identifiers
          ? [...candidate.identifiers]
          : undefined,
      })),
      domain,
      recordType: subtype.id,
      values: Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, value.trim()]),
      ),
    },
    matchingStatus: "current",
    matchingVersion: 1,
    owner: "CoE Biomedical and Healthcare Technology",
    primaryPerson: primaryValue || actor.name,
    provenance: {
      parser: "Form pengajuan manual",
      retrievedAt: now.toISOString(),
      sourceKey: `manual:${domain}:${id}`,
    },
    signal: km
      ? {
          primary: `${km.indicator.id} disarankan sistem`,
          secondary: "Menunggu verifikasi reviewer",
          tone: "waiting",
        }
      : {
          primary: "Belum ada saran indikator KM",
          secondary: "Kandidat tetap dapat ditinjau",
          tone: "neutral",
        },
    source: "manual",
    sourceLabel: "Pengajuan manual",
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy: submitter,
    submittedByActorId: actor.id,
    subtitle: `${subtype.label} · periode ${values.year}`,
    title: displayTitle,
    typeLabel: subtype.typeLabel,
    version: 1,
  };
}
