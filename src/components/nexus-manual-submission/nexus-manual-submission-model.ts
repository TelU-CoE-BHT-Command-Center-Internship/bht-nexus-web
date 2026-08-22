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
  evaluationPeriod: string;
  evidenceUrl: string;
  note: string;
  recordType: string;
  title: string;
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
  type: "date" | "number" | "select" | "text" | "textarea" | "url";
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
  /** Judul boleh dicatat, tetapi tidak tersedia pada seluruh baris sumber. */
  titleOptional?: boolean;
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
    "Anggota BHT yang terlibat (opsional)",
    "Nama penulis yang merupakan anggota CoE BHT",
    { required: false },
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
  {
    key: "registrationYear",
    label: "Tahun pencatatan / permohonan",
    min: "2000",
    placeholder: "Contoh: 2026",
    required: true,
    type: "number",
  },
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
    "ownerUnit",
    "Nama / unit terkait",
    "Nama pihak, unit, atau penanggung jawab yang tercantum",
    { wide: true },
  ),
  textField("scheme", "Skema", "Nama skema atau bentuk kontrak"),
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

const nonResearchProposalFields = [
  textField(
    "applicants",
    "Pengusul / tim",
    "Nama pengusul atau tim; pisahkan dengan titik koma",
    { wide: true },
  ),
  textField(
    "scheme",
    "Skema / bentuk proposal",
    "Contoh: pelatihan, konsultansi, hilirisasi, atau pengabdian",
  ),
  textField(
    "funder",
    "Instansi tujuan / pemberi program (opsional)",
    "Nama instansi bila sudah ditentukan",
    { required: false },
  ),
  textField(
    "partner",
    "Mitra (opsional)",
    "Nama mitra bila tercantum pada proposal",
    { required: false },
  ),
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
  {
    key: "activityYear",
    label: "Tahun kegiatan",
    min: "2000",
    placeholder: "Contoh: 2026",
    required: true,
    type: "number",
  },
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
          selectField(
            "sintaRank",
            "Peringkat SINTA (opsional)",
            [
              { label: "S1", value: "S1" },
              { label: "S2", value: "S2" },
              { label: "S3", value: "S3" },
              { label: "S4", value: "S4" },
              {
                label: "Belum diketahui dalam kelompok S1–S4",
                value: "unknown",
              },
            ],
            {
              hint: "Workbook KM-12 mengelompokkan jurnal S1–S4 tanpa selalu mencatat peringkat persis per baris.",
              required: false,
            },
          ),
          publicationIdentifier,
        ],
        id: "national-journal",
        label: "Jurnal nasional S1–S4",
        primaryFieldKey: "venue",
        suggestion: suggestion(
          "KM-12",
          "Jenis publikasi mengarah ke jurnal nasional dalam kelompok SINTA S1–S4.",
          "Nama jurnal, tanggal publikasi, daftar penulis, dan tautan artikel atau laman jurnal yang dapat diverifikasi.",
        ),
        titleOptional: true,
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
          {
            key: "publicationYear",
            label: "Tahun terbit",
            min: "2000",
            placeholder: "Contoh: 2026",
            required: true,
            type: "number",
          },
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
          "Tautan prosiding atau makalah, penulis, dan identitas konferensi internasional.",
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
          {
            key: "publicationYear",
            label: "Tahun terbit",
            min: "2000",
            placeholder: "Contoh: 2026",
            required: true,
            type: "number",
          },
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
          {
            key: "publicationYear",
            label: "Tahun terbit (opsional)",
            min: "2000",
            placeholder: "Contoh: 2026",
            required: false,
            type: "number",
          },
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
          "Tautan bukti pencatatan atau permohonan, pencipta/pemilik, tahun, dan jenis HKI.",
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
          "Tautan bukti pencatatan atau permohonan, pencipta/pemilik, tahun, dan jenis HKI.",
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
          "Tautan bukti pencatatan atau permohonan, pencipta/pemilik, tahun, dan jenis HKI.",
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
        primaryFieldKey: "ownerUnit",
        suggestion: suggestion(
          "KM-17",
          "Jenis dan cakupan rekam menunjukkan kontrak riset tingkat nasional.",
          "Judul kontrak, nama/unit terkait, skema, dan tautan bukti kontrak.",
        ),
        typeLabel: "Kontrak riset nasional",
      },
      {
        fields: researchContractFields,
        id: "international-research-contract",
        label: "Kontrak riset internasional",
        primaryFieldKey: "ownerUnit",
        suggestion: suggestion(
          "KM-18",
          "Jenis dan cakupan rekam menunjukkan kontrak riset tingkat internasional.",
          "Judul kontrak, nama/unit terkait, skema internasional, dan tautan bukti kontrak.",
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
          "Tautan bukti submit, skema, pengusul, dan tanggal pengajuan bila tersedia.",
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
        fields: nonResearchProposalFields,
        id: "non-research-proposal",
        label: "Proposal non-riset",
        primaryFieldKey: "applicants",
        suggestion: suggestion(
          "KM-39",
          "Jenis rekam menunjukkan proposal pelatihan, transfer teknologi, konsultansi, hilirisasi, atau pengabdian.",
          "Tautan bukti submit, bentuk proposal, pengusul/tim, dan tanggal pengajuan bila tersedia.",
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
          "NIM, nama, fakultas, program studi, kegiatan, penyelenggara, pembimbing, durasi, tahun, dan tautan bukti. Satu rekam mewakili satu mahasiswa sebagai bukti operasional; nilai kapasitas diverifikasi terpisah sesuai definisi evaluasi.",
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
          "Nama dosen/pembina, nama UMKM atau komunitas, dan tautan bukti pembinaan.",
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
          "Nama acara internasional, tanggal, tempat, dan tautan bukti pengelolaan.",
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
          "Skema, dosen/tim pelaksana, judul, masyarakat sasaran, dana bila tersedia, dan tautan bukti.",
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
          "Skema, dosen/tim pelaksana, judul, masyarakat sasaran, dana bila tersedia, dan tautan bukti.",
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
          "Nama jurnal nasional terakreditasi, volume, ISSN, frekuensi terbit, dan tautan bukti.",
        ),
        titleFieldLabel: "Nama jurnal nasional terakreditasi",
        titlePlaceholder: "Masukkan nama jurnal",
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
    evaluationPeriod: "",
    evidenceUrl: "",
    note: "",
    recordType: "",
    title: "",
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

export function manualSubtypeFields(
  domain: ManualSubmissionDomain,
  recordType: string,
) {
  return manualSubtype(domain, recordType)?.fields ?? [];
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
      if (
        subtype.titleRequired !== false &&
        !subtype.titleOptional &&
        !values.title.trim()
      )
        errors.title = `${subtype.titleFieldLabel ?? definition.titleFieldLabel} wajib diisi.`;
      const evaluationPeriod = Number(values.evaluationPeriod);
      if (!values.evaluationPeriod.trim()) {
        errors.evaluationPeriod = "Periode evaluasi wajib diisi.";
      } else if (
        !Number.isInteger(evaluationPeriod) ||
        evaluationPeriod < 2000 ||
        evaluationPeriod > new Date().getFullYear() + 1
      ) {
        errors.evaluationPeriod = `Gunakan periode 2000–${new Date().getFullYear() + 1}.`;
      }
    }
  }

  if (scope !== "identity" && subtype) {
    for (const field of subtype.fields) {
      const value = values[field.key]?.trim() ?? "";
      if (field.required && !value) {
        errors[field.key] = `${field.label} wajib diisi.`;
      }
      if (value && field.type === "number") {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          errors[field.key] = `${field.label} harus berupa angka.`;
        } else if (
          field.min !== undefined &&
          numericValue < Number(field.min)
        ) {
          errors[field.key] = `${field.label} minimal ${field.min}.`;
        }
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

    const selectedYear = Number(values.evaluationPeriod);
    const samePeriodFields = [
      "activityYear",
      "eventDate",
      "publicationDate",
      "publicationYear",
      "registrationYear",
      "submissionDate",
    ];
    for (const key of samePeriodFields) {
      const dateValue = values[key];
      if (!dateValue || !Number.isInteger(selectedYear)) continue;
      const entityYear = Number(dateValue.slice(0, 4));
      if (entityYear !== selectedYear) {
        const label = subtype?.fields.find((field) => field.key === key)?.label;
        errors[key] =
          `${label ?? "Tanggal"} harus berada pada periode evaluasi ${selectedYear}.`;
      }
    }

    if (values.startDate && values.endDate && Number.isInteger(selectedYear)) {
      const startYear = Number(values.startDate.slice(0, 4));
      const endYear = Number(values.endDate.slice(0, 4));
      if (selectedYear < startYear || selectedYear > endYear) {
        errors.evaluationPeriod =
          "Periode evaluasi harus beririsan dengan masa berlaku kontrak.";
      }
    }
  }

  return errors;
}

export function manualEntityYear(values: ManualSubmissionValues) {
  const year =
    values.publicationYear ||
    values.registrationYear ||
    values.activityYear ||
    values.publicationDate?.slice(0, 4) ||
    values.submissionDate?.slice(0, 4) ||
    values.eventDate?.slice(0, 4);
  const numeric = Number(year);
  return Number.isInteger(numeric) ? numeric : undefined;
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
      const compatibleRecordType =
        !candidate.recordType ||
        !values.recordType ||
        candidate.recordType === values.recordType;
      const sameIdentifier = (candidate.identifiers ?? []).some((identifier) =>
        normalizedIdentifiers.has(normalizeIdentifier(identifier)),
      );
      const titleScore = titleSimilarity(values.title, candidate.title);
      const entityYear = manualEntityYear(values);
      const sameYear =
        !candidate.year || !entityYear || candidate.year === entityYear;
      return {
        candidate,
        sameIdentifier,
        score: sameIdentifier
          ? 100
          : sameYear
            ? titleScore
            : Math.max(titleScore - 12, 0),
        titleScore,
        compatibleRecordType,
      };
    })
    .filter(
      ({ compatibleRecordType, sameIdentifier, score }) =>
        sameIdentifier || (compatibleRecordType && score >= 55),
    )
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
        ...(candidate.year && manualEntityYear(values)
          ? [
              {
                candidateValue: String(manualEntityYear(values)),
                fieldId: "year",
                label: "Tahun",
                officialValue: String(candidate.year),
                status:
                  candidate.year === manualEntityYear(values)
                    ? ("same" as const)
                    : ("different" as const),
                statusLabel:
                  candidate.year === manualEntityYear(values)
                    ? "Sama"
                    : "Berbeda",
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

function manualCategoryLabel(category: AuditReviewCategory) {
  if (category === "activity_governance") return "Kegiatan & tata kelola";
  if (category === "academic_hr") return "Akademik & SDM";
  if (category === "innovation_ip") return "HKI, paten & inovasi";
  if (category === "publication_conference") {
    return "Publikasi & konferensi";
  }
  if (category === "research_business") return "Riset & bisnis";
  return "Pengabdian masyarakat";
}

export function manualSubmissionPresentation(
  domain: ManualSubmissionDomain,
  values: ManualSubmissionValues,
  fallbackPerson: string,
) {
  const definition = manualSubmissionDefinitions[domain];
  const subtype = manualSubtype(domain, values.recordType);
  if (!subtype) throw new Error("Jenis rekam manual tidak dikenal.");
  const category = subtype.category ?? definition.category;
  const primaryFieldKey = subtype.primaryFieldKey ?? definition.primaryFieldKey;
  const primaryValue = primaryFieldKey ? values[primaryFieldKey]?.trim() : "";
  const title =
    values.title.trim() ||
    values.eventName?.trim() ||
    values.organization?.trim() ||
    values.institution?.trim() ||
    `${subtype.label} · ${primaryValue || values.evaluationPeriod}`;

  return {
    category,
    categoryLabel: manualCategoryLabel(category),
    primaryPerson: primaryValue || fallbackPerson,
    subtype,
    subtitle: `${subtype.label} · periode ${values.evaluationPeriod}`,
    title,
    typeLabel: subtype.typeLabel,
  };
}

function reviewFields(
  definition: ManualDomainDefinition,
  subtype: ManualSubtypeDefinition,
  values: ManualSubmissionValues,
): AuditReviewField[] {
  const fields: AuditReviewField[] = [];
  if (values.title.trim()) {
    fields.push({
      id: "title",
      input: {
        required: subtype.titleRequired !== false && !subtype.titleOptional,
        type: "text",
      },
      label: subtype.titleFieldLabel ?? definition.titleFieldLabel,
      rawValue: values.title.trim(),
      value: values.title.trim(),
    });
  }
  fields.push(
    {
      id: "record_type",
      input: {
        choices: definition.subtypes.map((item) => ({
          label: item.label,
          value: item.id,
        })),
        required: true,
        type: "select",
      },
      label: "Jenis rekam",
      rawValue: subtype.id,
      value: subtype.label,
    },
    {
      id: "evaluationPeriod",
      input: { min: "2000", required: true, type: "number" },
      label: "Periode evaluasi",
      rawValue: values.evaluationPeriod,
      value: values.evaluationPeriod,
    },
  );

  for (const field of subtype.fields) {
    const value = values[field.key]?.trim();
    if (!value) continue;
    const choiceLabel = field.choices?.find(
      (choice) => choice.value === value,
    )?.label;
    fields.push({
      id: field.key,
      input: {
        choices: field.choices ? [...field.choices] : undefined,
        min: field.min,
        required: field.required,
        type: field.type,
      },
      label: field.label,
      rawValue: value,
      value: choiceLabel ?? value,
    });
  }

  fields.push({
    id: "evidenceUrl",
    input: { required: true, type: "url" },
    label: "URL sumber / bukti utama",
    rawValue: values.evidenceUrl.trim(),
    value: values.evidenceUrl.trim(),
  });

  if (values.note.trim()) {
    fields.push({
      id: "submitter_note",
      input: { required: false, type: "textarea" },
      label: "Catatan pengaju",
      rawValue: values.note.trim(),
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
  const km = manualKmSuggestion(domain, values);
  const submitter = actorLabel(actor);
  const presentation = manualSubmissionPresentation(domain, values, actor.name);
  const { subtype } = presentation;
  const definition = manualSubmissionDefinitions[domain];
  const evidenceUrl = normalizeUrl(values.evidenceUrl);
  if (!evidenceUrl) throw new Error("Tautan bukti manual tidak valid.");
  const fields = reviewFields(definition, subtype, values);
  const matches = createManualOfficialMatches(values, comparisonCandidates);

  return {
    candidateKind: "new_record",
    category: presentation.category,
    categoryLabel: presentation.categoryLabel,
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
    evaluationPeriodLabel: values.evaluationPeriod,
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
    primaryPerson: presentation.primaryPerson,
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
    subtitle: presentation.subtitle,
    title: presentation.title,
    typeLabel: presentation.typeLabel,
    version: 1,
  };
}
