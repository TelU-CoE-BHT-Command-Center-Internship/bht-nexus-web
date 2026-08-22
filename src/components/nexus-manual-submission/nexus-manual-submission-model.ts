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
  subtitle?: string;
  title: string;
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
  suggestion?:
    | KmSuggestionDefinition
    | ((values: ManualSubmissionValues) => KmSuggestionDefinition | null);
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

const publicationAuthors = textField(
  "authors",
  "Anggota BHT / penulis internal",
  "Pisahkan beberapa nama dengan titik koma",
);

const publicationInvolvementFields = [
  publicationAuthors,
  textField(
    "authorRole",
    "Penulis utama / peran",
    "Contoh: penulis pertama atau corresponding author",
  ),
  textField(
    "externalCollaborators",
    "Kolaborator eksternal",
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

const intellectualPropertyFields = [
  textField(
    "creators",
    "Pencipta / inventor",
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

const contractFields = [
  textField(
    "primaryParty",
    "Mitra / pihak utama",
    "Nama institusi atau mitra",
    {
      wide: true,
    },
  ),
  textField(
    "scheme",
    "Skema",
    "Contoh: riset bersama, konsultansi, atau hibah",
  ),
  {
    key: "startDate",
    label: "Tanggal mulai",
    required: true,
    type: "date",
  },
  {
    key: "endDate",
    label: "Tanggal selesai",
    required: false,
    type: "date",
  },
  textField(
    "referenceNumber",
    "Nomor kontrak / proposal",
    "Nomor dokumen resmi",
    {
      required: false,
    },
  ),
  {
    hint: "Masukkan angka tanpa pemisah ribuan. Opsional bila bersifat rahasia atau belum ditetapkan.",
    key: "value",
    label: "Nilai (Rp)",
    min: "0",
    placeholder: "Contoh: 250000000",
    required: false,
    type: "number",
  },
] as const satisfies readonly ManualFieldDefinition[];

const academicFields = [
  textField(
    "participantRef",
    "Mahasiswa / referensi peserta",
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

const activityFields = [
  textField(
    "primaryParty",
    "Mitra / pihak utama",
    "Nama mitra, komunitas, atau unit",
    {
      wide: true,
    },
  ),
  {
    key: "activityDate",
    label: "Tanggal kegiatan",
    required: true,
    type: "date",
  },
  textField(
    "location",
    "Lokasi / cakupan",
    "Kota, negara, atau kanal pelaksanaan",
  ),
  textField(
    "beneficiaries",
    "Sasaran / penerima manfaat",
    "Contoh: 30 pelaku UMKM alat kesehatan",
    { required: false, wide: true },
  ),
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
          textField("publisher", "Penerbit", "Nama penerbit"),
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
        fields: intellectualPropertyFields,
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
        fields: intellectualPropertyFields,
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
        fields: intellectualPropertyFields,
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
        fields: intellectualPropertyFields,
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
        fields: intellectualPropertyFields,
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
        fields: contractFields,
        id: "national-research-contract",
        label: "Kontrak riset nasional",
        suggestion: suggestion(
          "KM-17",
          "Jenis dan cakupan rekam menunjukkan kontrak riset tingkat nasional.",
          "Tautan kontrak, pihak, nomor dokumen, serta periode pelaksanaan.",
        ),
        typeLabel: "Kontrak riset nasional",
      },
      {
        fields: contractFields,
        id: "international-research-contract",
        label: "Kontrak riset internasional",
        suggestion: suggestion(
          "KM-18",
          "Jenis dan cakupan rekam menunjukkan kontrak riset tingkat internasional.",
          "Tautan kontrak, pihak internasional, nomor dokumen, dan periode pelaksanaan.",
        ),
        typeLabel: "Kontrak riset internasional",
      },
      {
        fields: contractFields,
        id: "commercial-contract",
        label: "Kontrak komersialisasi",
        suggestion: suggestion(
          "KM-19",
          "Jenis rekam menunjukkan kontrak bisnis untuk komersialisasi.",
          "Tautan kontrak, para pihak, objek komersialisasi, dan periode pelaksanaan.",
        ),
        typeLabel: "Kontrak komersialisasi",
      },
      {
        fields: contractFields,
        id: "non-research-contract",
        label: "Kontrak non-riset",
        suggestion: suggestion(
          "KM-23",
          "Jenis rekam menunjukkan kontrak pelatihan, konsultansi, industri, komunitas, atau pemerintah.",
          "Tautan kontrak, ruang lingkup layanan, para pihak, dan periode pelaksanaan.",
        ),
        typeLabel: "Kontrak non-riset",
      },
      {
        fields: contractFields,
        id: "national-research-proposal",
        label: "Proposal riset nasional",
        suggestion: suggestion(
          "KM-37",
          "Jenis dan cakupan rekam menunjukkan proposal riset tingkat nasional.",
          "Tautan bukti submit, skema, pengusul, dan tanggal pengajuan.",
        ),
        typeLabel: "Proposal riset nasional",
      },
      {
        fields: contractFields,
        id: "international-research-proposal",
        label: "Proposal riset internasional",
        suggestion: suggestion(
          "KM-38",
          "Jenis dan cakupan rekam menunjukkan proposal riset tingkat internasional.",
          "Tautan bukti submit, skema internasional, pengusul, dan tanggal pengajuan.",
        ),
        typeLabel: "Proposal riset internasional",
      },
      {
        fields: contractFields,
        id: "non-research-proposal",
        label: "Proposal non-riset",
        suggestion: suggestion(
          "KM-39",
          "Jenis rekam menunjukkan proposal pelatihan, transfer teknologi, konsultansi, hilirisasi, atau pengabdian.",
          "Tautan bukti submit, skema, pengusul, dan tanggal pengajuan.",
        ),
        typeLabel: "Proposal non-riset",
      },
      {
        fields: contractFields,
        id: "other-contract-proposal",
        label: "Jenis kontrak / proposal lainnya",
        typeLabel: "Kontrak atau proposal lainnya",
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
        fields: academicFields,
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
        fields: academicFields,
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
        fields: [
          ...academicFields,
          {
            key: "participantCount",
            label: "Jumlah peserta",
            min: "1",
            placeholder: "Contoh: 12",
            required: true,
            type: "number",
          },
        ],
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
        fields: academicFields,
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
        fields: academicFields,
        id: "student-competition",
        label: "Ide / inovasi kompetisi mahasiswa",
        suggestion: suggestion(
          "KM-32",
          "Jenis kegiatan menunjukkan ide atau inovasi untuk kompetisi mahasiswa.",
          "Tautan bukti kompetisi, peserta/tim, pembimbing, dan deskripsi ide atau inovasi.",
        ),
        typeLabel: "Kompetisi mahasiswa",
      },
      {
        fields: academicFields,
        id: "other-academic",
        label: "Kegiatan akademik lainnya",
        typeLabel: "Kegiatan akademik lainnya",
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
        fields: activityFields,
        id: "business-unit",
        label: "Keterlibatan unit bisnis",
        suggestion: suggestion(
          "KM-20",
          "Jenis kegiatan menunjukkan keterlibatan unit bisnis yang melayani jasa sesuai kompetensi CoE.",
          "Tautan bukti keterlibatan, unit bisnis, layanan, periode, dan peran CoE.",
        ),
        typeLabel: "Keterlibatan unit bisnis",
      },
      {
        fields: activityFields,
        id: "community-coaching",
        label: "Pembinaan UMKM / komunitas",
        suggestion: suggestion(
          "KM-21",
          "Jenis kegiatan menunjukkan pembinaan UMKM atau komunitas.",
          "Tautan bukti kegiatan, mitra/komunitas, sasaran, tanggal, dan peran tim CoE.",
        ),
        typeLabel: "Pembinaan UMKM atau komunitas",
      },
      {
        category: "activity_governance",
        fields: activityFields,
        id: "international-conference-management",
        label: "Pengelolaan konferensi internasional",
        suggestion: suggestion(
          "KM-22",
          "Jenis kegiatan menunjukkan pengelolaan atau internasionalisasi seminar/konferensi.",
          "Tautan laman/acara, peran pengelola, cakupan internasional, tanggal, dan penyelenggara.",
        ),
        typeLabel: "Pengelolaan konferensi internasional",
      },
      {
        fields: activityFields,
        id: "non-research-service",
        label: "Layanan / kontrak non-riset",
        suggestion: suggestion(
          "KM-23",
          "Jenis kegiatan menunjukkan pelatihan, konsultansi, atau layanan non-riset.",
          "Tautan bukti layanan/kontrak, pihak, ruang lingkup, tanggal, dan peran CoE.",
        ),
        typeLabel: "Layanan non-riset",
      },
      {
        fields: activityFields,
        id: "community-service",
        label: "Community service / CSR",
        suggestion: suggestion(
          "KM-24",
          "Jenis kegiatan menunjukkan pengabdian masyarakat, kolaborasi, atau CSR.",
          "Tautan bukti kegiatan, mitra, penerima manfaat, tanggal, dan kontribusi CoE.",
        ),
        typeLabel: "Community service atau CSR",
      },
      {
        fields: activityFields,
        id: "drtpm-proposal",
        label: "Proposal abdimas DRTPM",
        suggestion: suggestion(
          "KM-25",
          "Jenis rekam menunjukkan proposal pengabdian DRTPM.",
          "Tautan bukti submit, skema DRTPM, pengusul, mitra/sasaran, dan tanggal pengajuan.",
        ),
        typeLabel: "Proposal abdimas DRTPM",
      },
      {
        fields: activityFields,
        id: "sdg-proposal",
        label: "Proposal abdimas terkait SDGs",
        suggestion: suggestion(
          "KM-26",
          "Jenis rekam menunjukkan proposal pengabdian yang berkaitan dengan SDGs.",
          "Tautan bukti submit, skema, SDG terkait, pengusul, dan mitra/sasaran.",
        ),
        typeLabel: "Proposal abdimas terkait SDGs",
      },
      {
        category: "activity_governance",
        fields: activityFields,
        id: "journal-accreditation",
        label: "Pengelolaan akreditasi jurnal",
        suggestion: suggestion(
          "KM-27",
          "Jenis kegiatan menunjukkan pengelolaan, peningkatan, atau internasionalisasi akreditasi jurnal.",
          "Tautan jurnal/bukti akreditasi, peran pengelola, periode, dan capaian peningkatan.",
        ),
        typeLabel: "Pengelolaan akreditasi jurnal",
      },
      {
        fields: activityFields,
        id: "other-activity",
        label: "Kegiatan / pengabdian lainnya",
        typeLabel: "Kegiatan atau pengabdian lainnya",
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
    if (!values.title.trim())
      errors.title = `${definition.titleFieldLabel} wajib diisi.`;
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

  if (scope !== "identity") {
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

function createOfficialMatches(
  title: string,
  candidates: readonly ManualRecordComparisonCandidate[],
): AuditOfficialMatch[] {
  return candidates
    .map((candidate) => ({
      candidate,
      score: titleSimilarity(title, candidate.title),
    }))
    .filter(({ score }) => score >= 55)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ candidate, score }) => ({
      comparisons: [
        {
          candidateValue: title,
          fieldId: "title",
          label: "Judul",
          officialValue: candidate.title,
          status: score === 100 ? "same" : "similar",
          statusLabel: comparisonStatusLabel(score),
        },
      ],
      id: candidate.id,
      score,
      title: candidate.subtitle
        ? `${candidate.title} · ${candidate.subtitle}`
        : candidate.title,
      verdict: score === 100 ? "strong" : "possible",
      verdictLabel:
        score === 100 ? "Judul sama" : "Perlu periksa kemiripan judul",
    }));
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
    {
      id: "title",
      label: definition.titleFieldLabel,
      value: values.title.trim(),
    },
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
  const matches = createOfficialMatches(values.title, comparisonCandidates);
  const primaryValue = definition.primaryFieldKey
    ? values[definition.primaryFieldKey]?.trim()
    : "";

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
    title: values.title.trim(),
    typeLabel: subtype.typeLabel,
    version: 1,
  };
}
