export type AuditReviewStatus = "completed" | "needs_fix" | "waiting";

export type AuditReviewCategory =
  | "academic_hr"
  | "activity_governance"
  | "community_service"
  | "innovation_ip"
  | "publication_conference"
  | "research_business";

export type AuditReviewSource =
  | "document"
  | "manual"
  | "scholar"
  | "sinta"
  | "spreadsheet";

export type AuditCandidateKind =
  | "metadata_completion"
  | "new_record"
  | "record_update";

export type AuditDecisionKind =
  | "approved_completion"
  | "approved_new"
  | "approved_update"
  | "changes_requested"
  | "merged"
  | "rejected";

export type AuditComparisonStatus =
  | "different"
  | "missing"
  | "same"
  | "similar";

export type AuditReviewField = {
  id: string;
  label: string;
  value: string;
};

export type AuditReviewEvidence = {
  href: string;
  id: string;
  label: string;
  reference: string;
  sourceLabel: string;
};

export type AuditReviewHistory = {
  actor: string;
  id: string;
  label: string;
  timeLabel: string;
};

export type AuditReviewDecision = {
  actor: string;
  kind: AuditDecisionKind;
  label: string;
  note: string;
  timeLabel: string;
};

export type AuditFixRequest = {
  assigneeLabel?: string;
  fieldIds: string[];
  reason: string;
};

export type AuditOfficialMatch = {
  comparisons: Array<{
    candidateValue: string;
    fieldId: string;
    label: string;
    officialValue: string;
    status: AuditComparisonStatus;
    statusLabel: string;
  }>;
  id: string;
  score: number;
  title: string;
  verdict: "possible" | "same_identifier" | "strong";
  verdictLabel: string;
};

export type AuditKpiLink = {
  category: string;
  evidenceRule: string;
  indicatorId: string;
  indicatorLabel: string;
  indicatorNumber: number;
};

export type AuditReviewProvenance = {
  attempt: number;
  fingerprint: string;
  jobId: string;
  parser: string;
  retrievedAt: string;
  sourceKey: string;
};

export type AuditReviewSignal = {
  primary: string;
  secondary: string;
  tone: "danger" | "info" | "neutral" | "success" | "waiting";
};

export type AuditReviewRecord = {
  candidateKind: AuditCandidateKind;
  category: AuditReviewCategory;
  categoryLabel: string;
  decision?: AuditReviewDecision;
  discoveredAt: string;
  discoveredAtLabel: string;
  evidence: AuditReviewEvidence[];
  fields: AuditReviewField[];
  fixRequest?: AuditFixRequest;
  history: AuditReviewHistory[];
  id: string;
  kpiLinks: AuditKpiLink[];
  matches: AuditOfficialMatch[];
  owner: string;
  periodLabel: string;
  primaryPerson: string;
  provenance: AuditReviewProvenance;
  signal: AuditReviewSignal;
  source: AuditReviewSource;
  sourceLabel: string;
  status: AuditReviewStatus;
  statusLabel: string;
  submittedBy: string;
  subtitle: string;
  title: string;
  typeLabel: string;
  version: number;
};

type AuditReviewRecordSeed = Omit<
  AuditReviewRecord,
  "kpiLinks" | "matches" | "provenance" | "submittedBy"
> & {
  kpiCategory: string;
  kpiEvidenceRule: string;
  kpiIndicator: {
    id: string;
    label: string;
    number: number;
  };
  match?: AuditOfficialMatch;
};

export type NexusAuditReviewContent = {
  lastUpdatedLabel: string;
  records: AuditReviewRecord[];
};

const field = (id: string, label: string, value: string): AuditReviewField => ({
  id,
  label,
  value,
});

const evidence = (
  id: string,
  label: string,
  sourceLabel: string,
  reference: string,
  href: string,
): AuditReviewEvidence => ({ href, id, label, reference, sourceLabel });

const discovered = (
  id: string,
  sourceLabel: string,
  timeLabel: string,
): AuditReviewHistory => ({
  actor: sourceLabel,
  id: `${id}-discovered`,
  label: "Kandidat masuk ke antrean",
  timeLabel,
});

const sessionReviewerActor = "Pemeriksa sesi";

const correctionRequested = (
  id: string,
  timeLabel: string,
): AuditReviewHistory => ({
  actor: sessionReviewerActor,
  id: `${id}-correction`,
  label: "Perbaikan diminta kepada pemilik data",
  timeLabel,
});

const completed = (
  kind: Exclude<AuditDecisionKind, "changes_requested">,
  label: string,
  note: string,
  timeLabel: string,
): AuditReviewDecision => ({
  actor: sessionReviewerActor,
  kind,
  label,
  note,
  timeLabel,
});

const coeUrl = "https://coe-bht.telkomuniversity.ac.id/";
const sintaUrl = "https://sinta.kemdiktisaintek.go.id/";

const records: AuditReviewRecordSeed[] = [
  {
    candidateKind: "new_record",
    category: "publication_conference",
    categoryLabel: "Publikasi & konferensi",
    discoveredAt: "2026-08-14T08:54:00+07:00",
    discoveredAtLabel: "14 Agu 2026, 08.54",
    evidence: [
      evidence(
        "ev-pub-telemedicine-doi",
        "Halaman DOI penerbit",
        "DOI",
        "10.2196/48213",
        "https://doi.org/10.2196/48213",
      ),
      evidence(
        "ev-pub-telemedicine-sinta",
        "Daftar publikasi peneliti",
        "SINTA",
        "Profil 6712043",
        sintaUrl,
      ),
    ],
    fields: [
      field(
        "title",
        "Judul publikasi",
        "Primary Care Telemedicine Adoption in Indonesian District Clinics",
      ),
      field("authors", "Penulis", "S. Harimurti, H. Susanti, M. A. Asyraf"),
      field("journal", "Jurnal", "Journal of Medical Internet Research"),
      field("doi", "DOI", "10.2196/48213"),
      field("year", "Tahun terbit", "2026"),
      field("quartile", "Kuartil", "Q1"),
    ],
    history: [
      discovered("PUB-260814-041", "SINTA", "14 Agu 2026, 08.54"),
      {
        actor: "Sistem pencocokan",
        id: "PUB-260814-041-match",
        label: "DOI sama ditemukan pada data resmi",
        timeLabel: "14 Agu 2026, 08.55",
      },
    ],
    id: "PUB-260814-041",
    kpiCategory: "Riset",
    kpiEvidenceRule:
      "Tautan DOI/penerbit, daftar penulis, afiliasi CoE, tahun, dan kuartil jurnal.",
    kpiIndicator: {
      id: "KM-14",
      label: "Publikasi internasional bereputasi · Q1",
      number: 14,
    },
    match: {
      comparisons: [
        {
          candidateValue:
            "Primary Care Telemedicine Adoption in Indonesian District Clinics",
          fieldId: "title",
          label: "Judul",
          officialValue:
            "Primary Care Telemedicine Adoption in Indonesian District Clinics",
          status: "same",
          statusLabel: "Sama",
        },
        {
          candidateValue: "S. Harimurti, H. Susanti, M. A. Asyraf",
          fieldId: "authors",
          label: "Penulis",
          officialValue: "S. Harimurti, H. Susanti, M. A. Asyraf, R. Pratama",
          status: "different",
          statusLabel: "Berbeda",
        },
        {
          candidateValue: "10.2196/48213",
          fieldId: "doi",
          label: "DOI",
          officialValue: "10.2196/48213",
          status: "same",
          statusLabel: "Sama",
        },
      ],
      id: "OFF-PUB-2026-018",
      score: 98,
      title:
        "Primary Care Telemedicine Adoption in Indonesian District Clinics",
      verdict: "same_identifier",
      verdictLabel: "DOI sama",
    },
    owner: "Hesty Susanti",
    periodLabel: "2026",
    primaryPerson: "Suksmandhira Harimurti",
    signal: {
      primary: "98% · DOI sama",
      secondary: "Periksa daftar penulis",
      tone: "danger",
    },
    source: "sinta",
    sourceLabel: "SINTA",
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    subtitle: "Suksmandhira Harimurti · Jurnal internasional Q1",
    title: "Primary Care Telemedicine Adoption in Indonesian District Clinics",
    typeLabel: "Artikel jurnal",
    version: 1,
  },
  {
    candidateKind: "record_update",
    category: "publication_conference",
    categoryLabel: "Publikasi & konferensi",
    discoveredAt: "2026-08-14T08:52:00+07:00",
    discoveredAtLabel: "14 Agu 2026, 08.52",
    evidence: [
      evidence(
        "ev-pub-histopathology",
        "Metadata publikasi",
        "SINTA",
        "Profil peneliti dan DOI",
        sintaUrl,
      ),
    ],
    fields: [
      field(
        "title",
        "Judul publikasi",
        "Deep Learning untuk Klasifikasi Citra Histopatologi",
      ),
      field("authors", "Penulis", "D. Wibisono, S. Harimurti"),
      field("journal", "Jurnal", "Jurnal Teknologi Kesehatan Indonesia"),
      field("doi", "DOI", "10.31219/osf.io/3kq7d"),
      field("year", "Tahun terbit", "2026"),
      field("quartile", "Kuartil", "Q3"),
    ],
    history: [discovered("PUB-260814-040", "SINTA", "14 Agu 2026, 08.52")],
    id: "PUB-260814-040",
    kpiCategory: "Riset",
    kpiEvidenceRule:
      "Tautan artikel, penulis terafiliasi, tahun terbit, dan peringkat jurnal.",
    kpiIndicator: {
      id: "KM-15",
      label: "Publikasi nasional/internasional · Q3",
      number: 15,
    },
    match: {
      comparisons: [
        {
          candidateValue: "Deep Learning untuk Klasifikasi Citra Histopatologi",
          fieldId: "title",
          label: "Judul",
          officialValue: "Deep Learning untuk Klasifikasi Citra Histopatologi",
          status: "same",
          statusLabel: "Sama",
        },
        {
          candidateValue: "10.31219/osf.io/3kq7d",
          fieldId: "doi",
          label: "DOI",
          officialValue: "10.31219/osf.io/3kq7d",
          status: "same",
          statusLabel: "Sama",
        },
      ],
      id: "OFF-PUB-2026-011",
      score: 100,
      title: "Deep Learning untuk Klasifikasi Citra Histopatologi",
      verdict: "same_identifier",
      verdictLabel: "Metadata sama",
    },
    owner: "Suksmandhira Harimurti",
    periodLabel: "2026",
    primaryPerson: "Dimas Wibisono",
    signal: {
      primary: "100% · Rekam sama",
      secondary: "Hubungkan data",
      tone: "danger",
    },
    source: "sinta",
    sourceLabel: "SINTA",
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    subtitle: "Dimas Wibisono · Artikel jurnal nasional",
    title: "Deep Learning untuk Klasifikasi Citra Histopatologi",
    typeLabel: "Artikel jurnal",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "publication_conference",
    categoryLabel: "Publikasi & konferensi",
    discoveredAt: "2026-08-13T15:20:00+07:00",
    discoveredAtLabel: "13 Agu 2026, 15.20",
    evidence: [
      evidence(
        "ev-wearable-scholar",
        "Profil dan sitasi penulis",
        "Google Scholar",
        "Judul dan daftar penulis",
        "https://scholar.google.com/",
      ),
      evidence(
        "ev-wearable-proceeding",
        "Laman prosiding konferensi",
        "Penerbit",
        "KNB 2026",
        coeUrl,
      ),
    ],
    fields: [
      field(
        "title",
        "Judul makalah",
        "Wearable Biosignal Acquisition for Remote Elderly Care",
      ),
      field("authors", "Penulis", "H. Susanti, L. A. Oktaviana"),
      field("event", "Konferensi", "Konferensi Nasional Biomedis 2026"),
      field("role", "Peran", "Pemakalah"),
      field("date", "Tanggal", "6 Agustus 2026"),
    ],
    history: [
      discovered("CONF-260813-012", "Google Scholar", "13 Agu 2026, 15.20"),
    ],
    id: "CONF-260813-012",
    kpiCategory: "Riset",
    kpiEvidenceRule:
      "Prosiding/sertifikat, judul makalah, peran, nama kegiatan, dan tanggal.",
    kpiIndicator: {
      id: "KM-16",
      label: "Keikutsertaan konferensi ilmiah",
      number: 16,
    },
    owner: "Laily Ade Oktaviana",
    periodLabel: "2026",
    primaryPerson: "Hesty Susanti",
    signal: {
      primary: "2 bukti tersedia",
      secondary: "Belum ada pembanding",
      tone: "success",
    },
    source: "scholar",
    sourceLabel: "Google Scholar",
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    subtitle: "Hesty Susanti · Pemakalah konferensi",
    title: "Wearable Biosignal Acquisition for Remote Elderly Care",
    typeLabel: "Konferensi",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "research_business",
    categoryLabel: "Riset & bisnis",
    discoveredAt: "2026-08-13T10:32:00+07:00",
    discoveredAtLabel: "13 Agu 2026, 10.32",
    evidence: [
      evidence(
        "ev-biosignal-pks",
        "Perjanjian kerja sama",
        "Dokumen",
        "PKS/PDP/2026/017",
        coeUrl,
      ),
      evidence(
        "ev-biosignal-proposal",
        "Proposal penelitian",
        "Dokumen",
        "PDP 2026",
        coeUrl,
      ),
    ],
    fields: [
      field(
        "title",
        "Judul penelitian",
        "Sistem Pemantauan Biosinyal Terintegrasi untuk Layanan Primer",
      ),
      field("leader", "Ketua peneliti", "Suksmandhira Harimurti"),
      field("scheme", "Skema", "Penelitian Terapan Unggulan"),
      field("partner", "Mitra/pemberi dana", "Kemendiktisaintek"),
      field("amount", "Nilai kontrak", "Rp185.000.000"),
      field("period", "Periode", "Februari–November 2026"),
    ],
    history: [
      discovered("RES-260813-027", "Ekstraksi dokumen", "13 Agu 2026, 10.32"),
    ],
    id: "RES-260813-027",
    kpiCategory: "Riset",
    kpiEvidenceRule:
      "Kontrak/proposal, ketua, skema, nilai, periode, dan luaran yang dijanjikan.",
    kpiIndicator: {
      id: "KM-17",
      label: "Kontrak riset eksternal",
      number: 17,
    },
    owner: "Suksmandhira Harimurti",
    periodLabel: "2026",
    primaryPerson: "Suksmandhira Harimurti",
    signal: {
      primary: "2 dokumen utama",
      secondary: "Nilai & periode terbaca",
      tone: "success",
    },
    source: "document",
    sourceLabel: "Dokumen",
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    subtitle: "Suksmandhira Harimurti · Kontrak riset eksternal",
    title: "Sistem Pemantauan Biosinyal Terintegrasi untuk Layanan Primer",
    typeLabel: "Kontrak riset",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "research_business",
    categoryLabel: "Riset & bisnis",
    discoveredAt: "2026-08-12T16:40:00+07:00",
    discoveredAtLabel: "12 Agu 2026, 16.40",
    evidence: [
      evidence(
        "ev-hibah-agreement",
        "Surat perjanjian penugasan",
        "Dokumen",
        "045/LL4/PG/2026",
        coeUrl,
      ),
    ],
    fields: [
      field(
        "title",
        "Judul kegiatan",
        "Perjanjian Penugasan Hibah Penelitian 2026",
      ),
      field("scheme", "Skema", "Hibah Penelitian Terapan"),
      field("leader", "Ketua", "Suksmandhira Harimurti"),
      field("amount", "Nilai dana", "Rp180.000.000"),
      field("period", "Periode", "Maret–November 2026"),
    ],
    fixRequest: {
      fieldIds: ["scheme", "amount"],
      reason:
        "Samakan nama skema dan nilai dana dengan halaman penandatanganan kontrak.",
    },
    history: [
      discovered("RES-260812-024", "Ekstraksi dokumen", "12 Agu 2026, 16.40"),
      correctionRequested("RES-260812-024", "13 Agu 2026, 09.12"),
    ],
    id: "RES-260812-024",
    kpiCategory: "Riset",
    kpiEvidenceRule:
      "Dokumen kontrak final, nama skema, nilai dana, ketua, dan periode pelaksanaan.",
    kpiIndicator: {
      id: "KM-17",
      label: "Kontrak riset eksternal",
      number: 17,
    },
    owner: "Muhammad Ammar Asyraf",
    periodLabel: "2026",
    primaryPerson: "Suksmandhira Harimurti",
    signal: {
      primary: "2 bidang dikoreksi",
      secondary: "Skema & nilai dana",
      tone: "waiting",
    },
    source: "document",
    sourceLabel: "Dokumen",
    status: "needs_fix",
    statusLabel: "Perlu perbaikan",
    subtitle: "Suksmandhira Harimurti · Hibah penelitian",
    title: "Perjanjian Penugasan Hibah Penelitian 2026",
    typeLabel: "Hibah penelitian",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "community_service",
    categoryLabel: "Pengabdian masyarakat",
    discoveredAt: "2026-08-12T14:18:00+07:00",
    discoveredAtLabel: "12 Agu 2026, 14.18",
    evidence: [
      evidence(
        "ev-pkm-puskesmas-letter",
        "Surat tugas kegiatan",
        "Dokumen",
        "045/PkM/2026",
        coeUrl,
      ),
      evidence(
        "ev-pkm-puskesmas-report",
        "Laporan pelaksanaan",
        "Dokumen",
        "Laporan 06/2026",
        coeUrl,
      ),
    ],
    fields: [
      field(
        "title",
        "Nama kegiatan",
        "Pelatihan Pemantauan Biosinyal untuk Tenaga Puskesmas",
      ),
      field("partner", "Mitra", "Puskesmas Cibiru"),
      field("lead", "Ketua pelaksana", "Dita Puspitasari"),
      field("participants", "Peserta", "28 tenaga kesehatan"),
      field("date", "Tanggal", "27 Juni 2026"),
      field("location", "Lokasi", "Puskesmas Cibiru, Bandung"),
    ],
    history: [
      discovered("PKM-260812-019", "Ekstraksi dokumen", "12 Agu 2026, 14.18"),
    ],
    id: "PKM-260812-019",
    kpiCategory: "Pengabdian Masyarakat",
    kpiEvidenceRule:
      "Surat tugas/kontrak, mitra, peserta, tanggal, lokasi, dan laporan kegiatan.",
    kpiIndicator: {
      id: "KM-18",
      label: "Pelatihan atau layanan kepada masyarakat",
      number: 18,
    },
    owner: "Dita Puspitasari",
    periodLabel: "2026",
    primaryPerson: "Dita Puspitasari",
    signal: {
      primary: "2 bukti tersedia",
      secondary: "Mitra & peserta terisi",
      tone: "success",
    },
    source: "document",
    sourceLabel: "Dokumen",
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    subtitle: "Dita Puspitasari · Pelatihan masyarakat",
    title: "Pelatihan Pemantauan Biosinyal untuk Tenaga Puskesmas",
    typeLabel: "Pelatihan PkM",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "innovation_ip",
    categoryLabel: "HKI, paten & inovasi",
    discoveredAt: "2026-08-11T13:30:00+07:00",
    discoveredAtLabel: "11 Agu 2026, 13.30",
    evidence: [
      evidence(
        "ev-hki-certificate",
        "Sertifikat pencatatan ciptaan",
        "Dokumen",
        "EC00202511934",
        coeUrl,
      ),
    ],
    fields: [
      field(
        "title",
        "Judul ciptaan",
        "Perangkat Lunak Akuisisi Biosinyal Nirkabel",
      ),
      field("creator", "Pencipta", "Fathur Rahman, Nabila Rahmawati"),
      field("registration", "Nomor pencatatan", "EC00202511934"),
      field("year", "Tahun pencatatan", "2024"),
      field("holder", "Pemegang hak", "Universitas Telkom"),
    ],
    fixRequest: {
      fieldIds: ["year", "holder"],
      reason:
        "Tahun dan nama pemegang hak belum konsisten dengan sertifikat terlampir.",
    },
    history: [
      discovered("HKI-260811-009", "Input manual", "11 Agu 2026, 13.30"),
      correctionRequested("HKI-260811-009", "12 Agu 2026, 09.05"),
    ],
    id: "HKI-260811-009",
    kpiCategory: "Inovasi",
    kpiEvidenceRule:
      "Sertifikat resmi, nomor pencatatan, pencipta, pemegang hak, dan tahun.",
    kpiIndicator: {
      id: "KM-19",
      label: "Hak Kekayaan Intelektual tercatat",
      number: 19,
    },
    owner: "Fathur Rahman",
    periodLabel: "2025",
    primaryPerson: "Fathur Rahman",
    signal: {
      primary: "2 bidang dikoreksi",
      secondary: "Tahun & pemegang hak",
      tone: "waiting",
    },
    source: "manual",
    sourceLabel: "Manual",
    status: "needs_fix",
    statusLabel: "Perlu perbaikan",
    subtitle: "Fathur Rahman · Hak cipta perangkat lunak",
    title: "Perangkat Lunak Akuisisi Biosinyal Nirkabel",
    typeLabel: "Hak cipta",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "innovation_ip",
    categoryLabel: "HKI, paten & inovasi",
    discoveredAt: "2026-08-11T09:22:00+07:00",
    discoveredAtLabel: "11 Agu 2026, 09.22",
    evidence: [
      evidence(
        "ev-patent-ecg",
        "Bukti penerimaan permohonan",
        "Dokumen",
        "P00202607134",
        coeUrl,
      ),
      evidence(
        "ev-patent-ecg-draft",
        "Dokumen spesifikasi paten",
        "Dokumen",
        "Versi 3",
        coeUrl,
      ),
    ],
    fields: [
      field(
        "title",
        "Judul invensi",
        "Perangkat Elektrokardiograf Portabel Berdaya Rendah",
      ),
      field("inventors", "Inventor", "Hesty Susanti, Muhammad Ammar Asyraf"),
      field("application", "Nomor permohonan", "P00202607134"),
      field("filingDate", "Tanggal pengajuan", "4 Agustus 2026"),
      field("status", "Status permohonan", "Pemeriksaan formalitas"),
    ],
    history: [
      discovered("PAT-260811-004", "Ekstraksi dokumen", "11 Agu 2026, 09.22"),
    ],
    id: "PAT-260811-004",
    kpiCategory: "Inovasi",
    kpiEvidenceRule:
      "Bukti permohonan, nomor, inventor, tanggal pengajuan, dan status proses.",
    kpiIndicator: {
      id: "KM-20",
      label: "Permohonan paten",
      number: 20,
    },
    owner: "Hesty Susanti",
    periodLabel: "2026",
    primaryPerson: "Hesty Susanti",
    signal: {
      primary: "2 dokumen utama",
      secondary: "Nomor permohonan terbaca",
      tone: "success",
    },
    source: "document",
    sourceLabel: "Dokumen",
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    subtitle: "Hesty Susanti · Permohonan paten",
    title: "Perangkat Elektrokardiograf Portabel Berdaya Rendah",
    typeLabel: "Paten",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "academic_hr",
    categoryLabel: "Akademik & SDM",
    discoveredAt: "2026-08-10T16:12:00+07:00",
    discoveredAtLabel: "10 Agu 2026, 16.12",
    evidence: [
      evidence(
        "ev-mentoring-s2",
        "Surat penetapan pembimbing",
        "Dokumen",
        "112/AKD/2026",
        coeUrl,
      ),
    ],
    fields: [
      field("student", "Mahasiswa", "Aulia Rahman"),
      field("program", "Program", "Magister Teknik Elektro"),
      field("mentor", "Pembimbing CoE", "Hesty Susanti"),
      field("topic", "Topik", "Deteksi aritmia berbasis pembelajaran mesin"),
      field("period", "Periode", "Semester Genap 2025/2026"),
    ],
    history: [
      discovered("AKA-260810-031", "Input manual", "10 Agu 2026, 16.12"),
    ],
    id: "AKA-260810-031",
    kpiCategory: "Akademik",
    kpiEvidenceRule:
      "Surat penetapan, mahasiswa, program, pembimbing, topik, dan periode.",
    kpiIndicator: {
      id: "KM-21",
      label: "Pembimbingan mahasiswa magister",
      number: 21,
    },
    owner: "Hesty Susanti",
    periodLabel: "2026",
    primaryPerson: "Hesty Susanti",
    signal: {
      primary: "1 bukti tersedia",
      secondary: "Periode & topik terisi",
      tone: "info",
    },
    source: "manual",
    sourceLabel: "Manual",
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    subtitle: "Hesty Susanti · Pembimbingan magister",
    title: "Pembimbingan tesis: Deteksi aritmia berbasis pembelajaran mesin",
    typeLabel: "Pembimbingan",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "activity_governance",
    categoryLabel: "Kegiatan & tata kelola",
    discoveredAt: "2026-08-10T10:05:00+07:00",
    discoveredAtLabel: "10 Agu 2026, 10.05",
    evidence: [
      evidence(
        "ev-speaker-invitation",
        "Surat undangan narasumber",
        "Dokumen",
        "UND/BIOMED/0826",
        coeUrl,
      ),
      evidence(
        "ev-speaker-certificate",
        "Sertifikat narasumber",
        "Dokumen",
        "BIOMED 2026",
        coeUrl,
      ),
    ],
    fields: [
      field(
        "event",
        "Nama kegiatan",
        "Seminar Nasional Teknologi Kesehatan 2026",
      ),
      field("speaker", "Narasumber", "Suksmandhira Harimurti"),
      field(
        "topic",
        "Topik",
        "Kecerdasan buatan untuk layanan kesehatan primer",
      ),
      field("organizer", "Penyelenggara", "Forum Biomedis Indonesia"),
      field("date", "Tanggal", "8 Agustus 2026"),
    ],
    history: [
      discovered("ACT-260810-017", "Ekstraksi dokumen", "10 Agu 2026, 10.05"),
    ],
    id: "ACT-260810-017",
    kpiCategory: "Organisasi CoE",
    kpiEvidenceRule:
      "Undangan/sertifikat, nama narasumber, topik, penyelenggara, dan tanggal.",
    kpiIndicator: {
      id: "KM-22",
      label: "Narasumber kegiatan eksternal",
      number: 22,
    },
    owner: "Muhammad Ammar Asyraf",
    periodLabel: "2026",
    primaryPerson: "Suksmandhira Harimurti",
    signal: {
      primary: "2 bukti tersedia",
      secondary: "Identitas kegiatan lengkap",
      tone: "success",
    },
    source: "document",
    sourceLabel: "Dokumen",
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    subtitle: "Suksmandhira Harimurti · Narasumber eksternal",
    title: "Seminar Nasional Teknologi Kesehatan 2026",
    typeLabel: "Narasumber",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "activity_governance",
    categoryLabel: "Kegiatan & tata kelola",
    discoveredAt: "2026-08-09T14:45:00+07:00",
    discoveredAtLabel: "9 Agu 2026, 14.45",
    evidence: [
      evidence(
        "ev-visit-agenda",
        "Agenda kunjungan",
        "Dokumen",
        "VISIT/2026/08",
        coeUrl,
      ),
    ],
    fields: [
      field(
        "event",
        "Nama kegiatan",
        "Kunjungan Laboratorium Biomedical Engineering ITB",
      ),
      field("institution", "Institusi tujuan", "Institut Teknologi Bandung"),
      field("date", "Tanggal", "7 Agustus 2026"),
      field("participants", "Peserta CoE", "—"),
      field(
        "purpose",
        "Tujuan",
        "Penjajakan kolaborasi riset dan penggunaan fasilitas",
      ),
    ],
    fixRequest: {
      fieldIds: ["participants"],
      reason:
        "Tambahkan daftar peserta CoE dan lampirkan bukti kehadiran kegiatan.",
    },
    history: [
      discovered("ACT-260809-015", "Ekstraksi dokumen", "9 Agu 2026, 14.45"),
      correctionRequested("ACT-260809-015", "10 Agu 2026, 08.20"),
    ],
    id: "ACT-260809-015",
    kpiCategory: "Organisasi CoE",
    kpiEvidenceRule:
      "Agenda/surat, institusi tujuan, peserta, tanggal, tujuan, dan dokumentasi.",
    kpiIndicator: {
      id: "KM-23",
      label: "Kunjungan atau benchmarking CoE",
      number: 23,
    },
    owner: "Muhammad Ammar Asyraf",
    periodLabel: "2026",
    primaryPerson: "Muhammad Ammar Asyraf",
    signal: {
      primary: "1 bidang dikoreksi",
      secondary: "Peserta belum tercatat",
      tone: "waiting",
    },
    source: "document",
    sourceLabel: "Dokumen",
    status: "needs_fix",
    statusLabel: "Perlu perbaikan",
    subtitle: "Muhammad Ammar Asyraf · Kunjungan institusi",
    title: "Kunjungan Laboratorium Biomedical Engineering ITB",
    typeLabel: "Kunjungan",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "community_service",
    categoryLabel: "Pengabdian masyarakat",
    decision: completed(
      "merged",
      "Dihubungkan ke data resmi",
      "Kegiatan dan tanggal sama dengan laporan PkM semester genap.",
      "9 Agu 2026, 11.42",
    ),
    discoveredAt: "2026-08-08T15:40:00+07:00",
    discoveredAtLabel: "8 Agu 2026, 15.40",
    evidence: [
      evidence(
        "ev-pkm-screening",
        "Laporan kegiatan",
        "Dokumen",
        "PKM-BHT/2026/04",
        coeUrl,
      ),
      evidence(
        "ev-pkm-screening-photo",
        "Daftar hadir dan dokumentasi",
        "Dokumen",
        "Lampiran 1–3",
        coeUrl,
      ),
    ],
    fields: [
      field(
        "event",
        "Nama kegiatan",
        "Skrining Risiko Jatuh bagi Lansia di Kecamatan Cibiru",
      ),
      field("partner", "Mitra", "Puskesmas Cibiru"),
      field("participants", "Penerima manfaat", "64 lansia"),
      field("date", "Tanggal", "18 Mei 2026"),
    ],
    history: [
      discovered("PKM-260808-011", "Ekstraksi dokumen", "8 Agu 2026, 15.40"),
      {
        actor: sessionReviewerActor,
        id: "PKM-260808-011-completed",
        label: "Dihubungkan ke data resmi",
        timeLabel: "9 Agu 2026, 11.42",
      },
    ],
    id: "PKM-260808-011",
    kpiCategory: "Pengabdian Masyarakat",
    kpiEvidenceRule:
      "Laporan, mitra, penerima manfaat, tanggal, daftar hadir, dan dokumentasi.",
    kpiIndicator: {
      id: "KM-24",
      label: "Layanan kepada masyarakat",
      number: 24,
    },
    owner: "Dita Puspitasari",
    periodLabel: "2026",
    primaryPerson: "Dita Puspitasari",
    signal: {
      primary: "Data resmi ditemukan",
      secondary: "Kegiatan & tanggal sama",
      tone: "neutral",
    },
    source: "document",
    sourceLabel: "Dokumen",
    status: "completed",
    statusLabel: "Selesai ditinjau",
    subtitle: "Dita Puspitasari · Layanan kesehatan masyarakat",
    title: "Skrining Risiko Jatuh bagi Lansia di Kecamatan Cibiru",
    typeLabel: "Layanan PkM",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "academic_hr",
    categoryLabel: "Akademik & SDM",
    decision: completed(
      "approved_new",
      "Diterima sebagai data baru",
      "Sertifikat valid dan masa berlaku berada pada periode evaluasi 2026.",
      "8 Agu 2026, 13.18",
    ),
    discoveredAt: "2026-08-08T09:12:00+07:00",
    discoveredAtLabel: "8 Agu 2026, 09.12",
    evidence: [
      evidence(
        "ev-certification",
        "Sertifikat kompetensi",
        "Dokumen",
        "BNSP-2026-88314",
        coeUrl,
      ),
    ],
    fields: [
      field("person", "Pemegang sertifikat", "Nabila Rahmawati"),
      field("competency", "Kompetensi", "Data Scientist"),
      field("issuer", "Penerbit", "BNSP"),
      field("issued", "Tanggal terbit", "2 Juli 2026"),
      field("validUntil", "Berlaku sampai", "2 Juli 2029"),
    ],
    history: [
      discovered("SDM-260808-006", "Input manual", "8 Agu 2026, 09.12"),
      {
        actor: sessionReviewerActor,
        id: "SDM-260808-006-completed",
        label: "Diterima sebagai data baru",
        timeLabel: "8 Agu 2026, 13.18",
      },
    ],
    id: "SDM-260808-006",
    kpiCategory: "SDM",
    kpiEvidenceRule:
      "Sertifikat, pemegang, kompetensi, lembaga penerbit, dan masa berlaku.",
    kpiIndicator: {
      id: "KM-25",
      label: "Sertifikasi kompetensi anggota",
      number: 25,
    },
    owner: "Nabila Rahmawati",
    periodLabel: "2026",
    primaryPerson: "Nabila Rahmawati",
    signal: {
      primary: "Keputusan tercatat",
      secondary: "Diterima sebagai data baru",
      tone: "neutral",
    },
    source: "manual",
    sourceLabel: "Manual",
    status: "completed",
    statusLabel: "Selesai ditinjau",
    subtitle: "Nabila Rahmawati · Sertifikasi kompetensi",
    title: "Sertifikasi BNSP Data Scientist",
    typeLabel: "Sertifikasi",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "research_business",
    categoryLabel: "Riset & bisnis",
    decision: completed(
      "approved_new",
      "Diterima sebagai data baru",
      "Kontrak, mitra, nilai, dan periode telah sesuai dengan dokumen final.",
      "7 Agu 2026, 15.06",
    ),
    discoveredAt: "2026-08-07T10:20:00+07:00",
    discoveredAtLabel: "7 Agu 2026, 10.20",
    evidence: [
      evidence(
        "ev-business-contract",
        "Kontrak jasa konsultasi",
        "Dokumen",
        "BHT/CON/2026/008",
        coeUrl,
      ),
    ],
    fields: [
      field(
        "title",
        "Nama kontrak",
        "Konsultasi Validasi Perangkat Monitoring Pasien",
      ),
      field("partner", "Mitra", "PT Medika Digital Nusantara"),
      field("lead", "Penanggung jawab", "Hesty Susanti"),
      field("amount", "Nilai kontrak", "Rp96.500.000"),
      field("period", "Periode", "Juli–September 2026"),
    ],
    history: [
      discovered("BUS-260807-008", "Ekstraksi dokumen", "7 Agu 2026, 10.20"),
      {
        actor: sessionReviewerActor,
        id: "BUS-260807-008-completed",
        label: "Diterima sebagai data baru",
        timeLabel: "7 Agu 2026, 15.06",
      },
    ],
    id: "BUS-260807-008",
    kpiCategory: "Bisnis",
    kpiEvidenceRule:
      "Kontrak final, mitra, penanggung jawab, nilai, periode, dan ruang lingkup.",
    kpiIndicator: {
      id: "KM-26",
      label: "Kontrak komersial/layanan CoE",
      number: 26,
    },
    owner: "Hesty Susanti",
    periodLabel: "2026",
    primaryPerson: "Hesty Susanti",
    signal: {
      primary: "Keputusan tercatat",
      secondary: "Diterima sebagai data baru",
      tone: "neutral",
    },
    source: "document",
    sourceLabel: "Dokumen",
    status: "completed",
    statusLabel: "Selesai ditinjau",
    subtitle: "Hesty Susanti · Kontrak komersial",
    title: "Konsultasi Validasi Perangkat Monitoring Pasien",
    typeLabel: "Kontrak bisnis",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "publication_conference",
    categoryLabel: "Publikasi & konferensi",
    decision: completed(
      "approved_new",
      "Diterima sebagai data baru",
      "ISBN dan penerbit terverifikasi; belum ada judul yang sama pada data resmi.",
      "6 Agu 2026, 14.24",
    ),
    discoveredAt: "2026-08-06T09:45:00+07:00",
    discoveredAtLabel: "6 Agu 2026, 09.45",
    evidence: [
      evidence(
        "ev-book-isbn",
        "Katalog ISBN",
        "Dokumen",
        "978-623-8756-11-4",
        coeUrl,
      ),
      evidence(
        "ev-book-cover",
        "Halaman penerbit",
        "Dokumen",
        "Tel-U Press",
        coeUrl,
      ),
    ],
    fields: [
      field("title", "Judul buku", "Rehabilitasi Lansia Berbasis Sensor"),
      field("authors", "Penulis", "Dita Puspitasari, Hesty Susanti"),
      field("publisher", "Penerbit", "Telkom University Press"),
      field("isbn", "ISBN", "978-623-8756-11-4"),
      field("year", "Tahun terbit", "2026"),
    ],
    history: [
      discovered("BOOK-260806-003", "SINTA", "6 Agu 2026, 09.45"),
      {
        actor: sessionReviewerActor,
        id: "BOOK-260806-003-completed",
        label: "Diterima sebagai data baru",
        timeLabel: "6 Agu 2026, 14.24",
      },
    ],
    id: "BOOK-260806-003",
    kpiCategory: "Akademik",
    kpiEvidenceRule:
      "ISBN, halaman penerbit, penulis, afiliasi, dan tahun terbit.",
    kpiIndicator: {
      id: "KM-27",
      label: "Buku yang diterbitkan",
      number: 27,
    },
    owner: "Dita Puspitasari",
    periodLabel: "2026",
    primaryPerson: "Dita Puspitasari",
    signal: {
      primary: "Keputusan tercatat",
      secondary: "Diterima sebagai data baru",
      tone: "neutral",
    },
    source: "sinta",
    sourceLabel: "SINTA",
    status: "completed",
    statusLabel: "Selesai ditinjau",
    subtitle: "Dita Puspitasari · Buku referensi",
    title: "Rehabilitasi Lansia Berbasis Sensor",
    typeLabel: "Buku",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "activity_governance",
    categoryLabel: "Kegiatan & tata kelola",
    decision: completed(
      "rejected",
      "Ditolak",
      "Kegiatan berlangsung pada 2023 dan tidak termasuk periode evaluasi aktif.",
      "5 Agu 2026, 16.02",
    ),
    discoveredAt: "2026-08-05T11:30:00+07:00",
    discoveredAtLabel: "5 Agu 2026, 11.30",
    evidence: [
      evidence(
        "ev-old-conference",
        "Sertifikat peserta",
        "Dokumen",
        "ICBME 2023",
        coeUrl,
      ),
    ],
    fields: [
      field(
        "event",
        "Nama kegiatan",
        "International Conference on Biomedical Engineering 2023",
      ),
      field("participant", "Peserta", "Fathur Rahman"),
      field("role", "Peran", "Peserta"),
      field("date", "Tanggal", "18 November 2023"),
    ],
    history: [
      discovered("ACT-260805-002", "Input manual", "5 Agu 2026, 11.30"),
      {
        actor: sessionReviewerActor,
        id: "ACT-260805-002-completed",
        label: "Kandidat ditolak",
        timeLabel: "5 Agu 2026, 16.02",
      },
    ],
    id: "ACT-260805-002",
    kpiCategory: "Organisasi CoE",
    kpiEvidenceRule:
      "Sertifikat/undangan, nama peserta, peran, kegiatan, dan tanggal dalam periode evaluasi.",
    kpiIndicator: {
      id: "KM-28",
      label: "Keikutsertaan pada kegiatan eksternal",
      number: 28,
    },
    owner: "Fathur Rahman",
    periodLabel: "2023",
    primaryPerson: "Fathur Rahman",
    signal: {
      primary: "Keputusan tercatat",
      secondary: "Ditolak · di luar periode",
      tone: "neutral",
    },
    source: "manual",
    sourceLabel: "Manual",
    status: "completed",
    statusLabel: "Selesai ditinjau",
    subtitle: "Fathur Rahman · Peserta konferensi",
    title: "International Conference on Biomedical Engineering 2023",
    typeLabel: "Konferensi",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "research_business",
    categoryLabel: "Riset & bisnis",
    discoveredAt: "2026-08-14T10:18:00+07:00",
    discoveredAtLabel: "14 Agu 2026, 10.18",
    evidence: [
      evidence(
        "ev-spreadsheet-research-contract",
        "Baris kontrak riset",
        "Impor lembar kerja",
        "Riset dan Bisnis · baris 17",
        "/nexus/dokumen",
      ),
    ],
    fields: [
      field(
        "title",
        "Judul penelitian",
        "Platform Pemantauan Biosinyal untuk Klinik Bergerak",
      ),
      field("lead", "Ketua peneliti", "Suksmandhira Harimurti"),
      field("scheme", "Skema", "Penelitian Terapan Unggulan"),
      field("partner", "Mitra/pemberi dana", "Kemdiktisaintek"),
      field("amount", "Nilai kontrak", "Rp210.000.000"),
      field("period", "Periode", "Februari–November 2026"),
    ],
    history: [
      discovered("RES-260814-032", "Impor lembar kerja", "14 Agu 2026, 10.18"),
    ],
    id: "RES-260814-032",
    kpiCategory: "Riset",
    kpiEvidenceRule:
      "Dokumen kontrak, nama skema, nilai pendanaan, ketua, mitra, dan periode pelaksanaan.",
    kpiIndicator: {
      id: "KM-17",
      label: "Kontrak riset eksternal",
      number: 17,
    },
    owner: "Suksmandhira Harimurti",
    periodLabel: "2026",
    primaryPerson: "Suksmandhira Harimurti",
    signal: {
      primary: "Kandidat dari lembar kerja",
      secondary: "Periksa kontrak dan nilai pendanaan",
      tone: "info",
    },
    source: "spreadsheet",
    sourceLabel: "Impor lembar kerja",
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    subtitle: "Suksmandhira Harimurti · KM-17 · kontrak riset",
    title: "Platform Pemantauan Biosinyal untuk Klinik Bergerak",
    typeLabel: "Kontrak riset",
    version: 1,
  },
];

/**
 * Serializable route content. Future server data can replace this factory at
 * the page boundary without changing the interactive review workspace.
 */
function getRecordMatches(record: AuditReviewRecordSeed) {
  if (!record.match) return [];
  if (record.id !== "PUB-260814-041") return [record.match];

  return [
    record.match,
    {
      ...record.match,
      id: "OFF-PUB-2026-021",
      score: 84,
      title: "Primary Care Telemedicine Adoption for District Health Services",
      verdict: "possible" as const,
      verdictLabel: "Metadata serupa",
    },
  ];
}

function hydrateRecord(
  record: AuditReviewRecordSeed,
  reviewerLabel: string,
): AuditReviewRecord {
  const {
    kpiCategory,
    kpiEvidenceRule,
    kpiIndicator,
    match: _match,
    ...base
  } = record;
  const replacePreviewActor = (actor: string) =>
    actor === sessionReviewerActor ? reviewerLabel : actor;

  return {
    ...base,
    decision: record.decision
      ? {
          ...record.decision,
          actor: replacePreviewActor(record.decision.actor),
        }
      : undefined,
    history: record.history.map((entry) => ({
      ...entry,
      actor: replacePreviewActor(entry.actor),
    })),
    kpiLinks: [
      {
        category: kpiCategory,
        evidenceRule: kpiEvidenceRule,
        indicatorId: kpiIndicator.id,
        indicatorLabel: kpiIndicator.label,
        indicatorNumber: kpiIndicator.number,
      },
    ],
    matches: getRecordMatches(record),
    provenance: {
      attempt: 1,
      fingerprint: `sha256:${record.id.toLocaleLowerCase("en-US")}-preview`,
      jobId: `JOB-${record.id}`,
      parser:
        record.source === "document" ? "document-parser@1" : "source-adapter@1",
      retrievedAt: record.discoveredAt,
      sourceKey: `${record.source}:${record.id.toLocaleLowerCase("en-US")}`,
    },
    submittedBy: `${record.sourceLabel} · sumber kandidat`,
  };
}

export function getNexusAuditReviewContent(
  reviewerLabel: string,
): NexusAuditReviewContent {
  return {
    lastUpdatedLabel: "Diperbarui 15 Agu 2026, 08.55 WIB",
    records: records.map((record) => hydrateRecord(record, reviewerLabel)),
  };
}
