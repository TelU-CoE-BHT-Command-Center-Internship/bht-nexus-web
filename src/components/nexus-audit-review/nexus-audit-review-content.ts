import type { MetadataCompletionResolutions } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { nexusReviewActorIds } from "@/components/nexus-review-session/nexus-review-actors";
import {
  kmIndicator,
  type NexusKmIndicator,
} from "@/content/nexus-km-indicators";

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

export type AuditMatchingStatus =
  | "current"
  | "not_required"
  | "pending"
  | "stale";

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
  href?: string;
  id: string;
  label: string;
  reference: string;
  sourceLabel: string;
};

export type AuditReviewHistory = {
  actor: string;
  actorId?: string;
  changes?: Array<{
    after: string;
    before: string;
    fieldId: string;
  }>;
  decisionKind?: AuditDecisionKind;
  fieldIds?: string[];
  id: string;
  kind?: "correction_submitted" | "decision" | "submitted";
  label: string;
  note?: string;
  /** Instant mesin untuk integrasi dan pengurutan audit. */
  occurredAt: string;
  targetRecordId?: string;
  version?: number;
};

export type AuditReviewDecision = {
  actor: string;
  actorId?: string;
  kind: AuditDecisionKind;
  label: string;
  note: string;
  /** Instant mesin; format WIB hanya dibuat ketika dirender. */
  occurredAt: string;
  /** Rekam resmi yang dipilih reviewer untuk merge, update, atau pelengkapan. */
  targetRecordId?: string;
};

export type AuditFixRequest = {
  assigneeActorId?: string;
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
  evidenceRule: string;
  indicator: NexusKmIndicator;
};

export type AuditReviewProvenance = {
  attempt?: number;
  fingerprint?: string;
  jobId?: string;
  parser?: string;
  retrievedAt?: string;
  sourceKey?: string;
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
  completionResolutions?: MetadataCompletionResolutions;
  decision?: AuditReviewDecision;
  discoveredAt: string;
  discoveredAtLabel: string;
  evidence: AuditReviewEvidence[];
  fields: AuditReviewField[];
  fixRequest?: AuditFixRequest;
  history: AuditReviewHistory[];
  id: string;
  kpiLinks: AuditKpiLink[];
  /** Versi kandidat yang dipakai layanan pencocokan untuk hasil ini. */
  matchingVersion?: number;
  matchingStatus?: AuditMatchingStatus;
  matches: AuditOfficialMatch[];
  owner: string;
  /** Periode evaluasi KM; kosong bila sumber belum menentukan periodenya. */
  evaluationPeriodLabel?: string;
  primaryPerson: string;
  provenance: AuditReviewProvenance;
  signal: AuditReviewSignal;
  source: AuditReviewSource;
  /** Sistem atau kanal yang menghasilkan kandidat; bukan identitas penerima tugas. */
  sourceActorId?: string;
  sourceLabel: string;
  status: AuditReviewStatus;
  statusLabel: string;
  submittedBy: string;
  /** Identitas manusia yang mengajukan atau bertanggung jawab atas kandidat. */
  submittedByActorId?: string;
  /** Penerima koreksi manusia; tidak boleh menunjuk akun layanan. */
  correctionAssigneeActorId?: string;
  correctionAssigneeLabel?: string;
  subtitle: string;
  title: string;
  typeLabel: string;
  version: number;
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
  href?: string,
): AuditReviewEvidence => ({ href, id, label, reference, sourceLabel });

const discovered = (
  id: string,
  sourceLabel: string,
  occurredAt: string,
): AuditReviewHistory => ({
  actor: sourceLabel,
  id: `${id}-discovered`,
  label: "Kandidat masuk ke antrean",
  occurredAt,
});

const sessionReviewerActor = "Pemeriksa sesi";
const dataStewardSubmitter = "Pengelola data CoE BHT";
const workbookSource = "Workbook KM 2026";

const records: AuditReviewRecord[] = [
  {
    candidateKind: "new_record",
    category: "activity_governance",
    categoryLabel: "Kegiatan & tata kelola",
    discoveredAt: "2026-08-16T09:22:00+07:00",
    discoveredAtLabel: "16 Agu 2026, 09.22",
    evidence: [
      evidence(
        "ev-neutral-biosignal-document",
        "Ringkasan kegiatan",
        "Dokumen internal",
        "Halaman 4 · identitas karya perlu diverifikasi",
      ),
    ],
    fields: [
      field(
        "title",
        "Judul kegiatan",
        "Analisis Biosinyal untuk Pemantauan Kesehatan Primer",
      ),
      field("authors", "Pihak terkait", "Peneliti A; Peneliti B"),
      field("year", "Tahun", "2026"),
      field("identifier", "Pengenal eksternal", ""),
    ],
    history: [
      discovered(
        "CAND-260816-001",
        "Dokumen internal",
        "2026-08-16T09:22:00+07:00",
      ),
      {
        actor: "Sistem pencocokan",
        id: "CAND-260816-001-match",
        label: "Dua rekam serupa ditemukan untuk diperiksa",
        occurredAt: "2026-08-16T09:23:00+07:00",
      },
    ],
    id: "CAND-260816-001",
    kpiLinks: [],
    matches: [
      {
        comparisons: [
          {
            candidateValue:
              "Analisis Biosinyal untuk Pemantauan Kesehatan Primer",
            fieldId: "title",
            label: "Judul",
            officialValue: "Analisis Biosinyal untuk Pemantauan Layanan Primer",
            status: "similar",
            statusLabel: "Serupa",
          },
          {
            candidateValue: "Peneliti A; Peneliti B",
            fieldId: "authors",
            label: "Pihak terkait",
            officialValue: "Peneliti A; Peneliti C",
            status: "different",
            statusLabel: "Berbeda",
          },
          {
            candidateValue: "",
            fieldId: "identifier",
            label: "Pengenal eksternal",
            officialValue: "Belum tersedia",
            status: "missing",
            statusLabel: "Belum tersedia",
          },
        ],
        id: "PUB-2026-0101",
        score: 92,
        title: "Analisis Biosinyal untuk Pemantauan Layanan Primer",
        verdict: "strong",
        verdictLabel: "Metadata sangat serupa",
      },
      {
        comparisons: [
          {
            candidateValue:
              "Analisis Biosinyal untuk Pemantauan Kesehatan Primer",
            fieldId: "title",
            label: "Judul",
            officialValue:
              "Pemantauan Biosinyal untuk Layanan Kesehatan Primer",
            status: "similar",
            statusLabel: "Serupa",
          },
          {
            candidateValue: "Peneliti A; Peneliti B",
            fieldId: "authors",
            label: "Pihak terkait",
            officialValue: "Peneliti B; Peneliti D",
            status: "different",
            statusLabel: "Berbeda",
          },
          {
            candidateValue: "",
            fieldId: "identifier",
            label: "Pengenal eksternal",
            officialValue: "Belum tersedia",
            status: "missing",
            statusLabel: "Belum tersedia",
          },
        ],
        id: "PUB-2026-0102",
        score: 87,
        title: "Pemantauan Biosinyal untuk Layanan Kesehatan Primer",
        verdict: "possible",
        verdictLabel: "Metadata serupa",
      },
    ],
    owner: "Belum ditetapkan",
    evaluationPeriodLabel: "2026",
    primaryPerson: "Peneliti A",
    provenance: {},
    signal: {
      primary: "2 rekam perlu dibandingkan",
      secondary: "Reviewer wajib memilih target",
      tone: "danger",
    },
    source: "document",
    sourceLabel: "Dokumen",
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy: "Pengelola dokumen",
    subtitle: "Peneliti A · klasifikasi indikator belum dipastikan",
    title: "Analisis Biosinyal untuk Pemantauan Kesehatan Primer",
    typeLabel: "Kegiatan hasil ekstraksi",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "publication_conference",
    categoryLabel: "Publikasi & konferensi",
    discoveredAt: "2026-08-16T09:18:00+07:00",
    discoveredAtLabel: "16 Agu 2026, 09.18",
    evidence: [
      evidence(
        "ev-km14-glaucoma",
        "Halaman artikel penerbit",
        "PeerJ Computer Science",
        "Sheet no.14 · baris 6",
        "https://peerj.com/articles/cs-3705/",
      ),
    ],
    fields: [
      field(
        "title",
        "Judul publikasi",
        "Artificial Intelligence in Glaucoma Detection System Based on Fundus Images",
      ),
      field(
        "authors",
        "Penulis",
        "Sofia Saidah; Achmad Rizal; Inung Wijayanto",
      ),
      field("journal", "Jurnal", "PeerJ Computer Science"),
      field("year", "Tahun terbit", "2026"),
      field("quartile", "Kuartil", "Q1"),
    ],
    history: [
      discovered("WB-KM14-006", workbookSource, "2026-08-16T09:18:00+07:00"),
    ],
    id: "WB-KM14-006",
    kpiLinks: [
      {
        evidenceRule:
          "Halaman penerbit, daftar penulis, tahun terbit, dan bukti kuartil Q1 atau Q2.",
        indicator: kmIndicator("KM-14"),
      },
    ],
    matches: [],
    owner: "CoE BHT",
    evaluationPeriodLabel: "2026",
    primaryPerson: "Sofia Saidah",
    provenance: { sourceKey: "COPY_3 KM 2026.xlsx · no.14!A6:L6" },
    signal: {
      primary: "Bukti penerbit tersedia",
      secondary: "Kuartil Q1 tercatat",
      tone: "success",
    },
    source: "spreadsheet",
    sourceLabel: workbookSource,
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy: dataStewardSubmitter,
    subtitle: "Sofia Saidah dkk. · jurnal internasional Q1",
    title:
      "Artificial Intelligence in Glaucoma Detection System Based on Fundus Images",
    typeLabel: "Artikel jurnal",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "publication_conference",
    categoryLabel: "Publikasi & konferensi",
    discoveredAt: "2026-08-16T09:14:00+07:00",
    discoveredAtLabel: "16 Agu 2026, 09.14",
    evidence: [
      evidence(
        "ev-km13-virtual-mouse",
        "Halaman artikel penerbit",
        "Jurnal RESTI",
        "Sheet no.13 · baris 4",
        "https://jurnal.iaii.or.id/index.php/RESTI/article/view/6609",
      ),
    ],
    fields: [
      field(
        "title",
        "Judul publikasi",
        "Real-Time Hand Gesture-Based Virtual Mouse System Using ESP32-CAM and OpenCV",
      ),
      field(
        "authors",
        "Tim penulis dosen",
        "Sugondo Hadiyoso; Indrarini Dyah Irawati; Achmad Rizal",
      ),
      field("journal", "Jurnal", "Jurnal RESTI"),
      field("year", "Tahun terbit", "2026"),
      field("quartile", "Kuartil", "Q3"),
    ],
    history: [
      discovered("WB-KM13-004", workbookSource, "2026-08-16T09:14:00+07:00"),
    ],
    id: "WB-KM13-004",
    kpiLinks: [
      {
        evidenceRule:
          "Halaman penerbit, daftar penulis, tahun terbit, dan bukti reputasi jurnal selain Q1/Q2.",
        indicator: kmIndicator("KM-13"),
      },
    ],
    matches: [],
    owner: "CoE BHT",
    evaluationPeriodLabel: "2026",
    primaryPerson: "Sugondo Hadiyoso",
    provenance: { sourceKey: "COPY_3 KM 2026.xlsx · no.13!A4:L4" },
    signal: {
      primary: "Bukti penerbit tersedia",
      secondary: "Kuartil Q3 tercatat",
      tone: "success",
    },
    source: "spreadsheet",
    sourceLabel: workbookSource,
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy: dataStewardSubmitter,
    subtitle: "Sugondo Hadiyoso dkk. · jurnal internasional Q3",
    title:
      "Real-Time Hand Gesture-Based Virtual Mouse System Using ESP32-CAM and OpenCV",
    typeLabel: "Artikel jurnal",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "publication_conference",
    categoryLabel: "Publikasi & konferensi",
    discoveredAt: "2026-08-16T09:10:00+07:00",
    discoveredAtLabel: "16 Agu 2026, 09.10",
    evidence: [
      evidence(
        "ev-km11-conductive-ink",
        "Halaman makalah penerbit",
        "IOP Publishing",
        "Sheet no.11 · baris 8",
        "https://iopscience.iop.org/article/10.1088/1742-6596/3188/1/012005",
      ),
    ],
    fields: [
      field(
        "title",
        "Judul makalah",
        "Effect of Graphite Addition Variations on the Electrical Properties of Graphite Oxide-Based Conductive Inks for Low-Cost Medical Electrodes",
      ),
      field("authors", "Penulis", "Fathur Rahman"),
      field(
        "event",
        "Konferensi",
        "Engineering and Sciences International Conference (ESIC)",
      ),
      field(
        "publication_type",
        "Jenis publikasi",
        "Prosiding internasional terindeks",
      ),
      field("year", "Tahun", "2026"),
    ],
    history: [
      discovered("WB-KM11-008", workbookSource, "2026-08-16T09:10:00+07:00"),
    ],
    id: "WB-KM11-008",
    kpiLinks: [
      {
        evidenceRule:
          "Halaman prosiding terindeks, judul makalah, daftar penulis, dan status minimal sedang ditinjau.",
        indicator: kmIndicator("KM-11"),
      },
    ],
    matches: [],
    owner: "CoE BHT",
    evaluationPeriodLabel: "2026",
    primaryPerson: "Fathur Rahman",
    provenance: { sourceKey: "COPY_3 KM 2026.xlsx · no.11!A8:I8" },
    signal: {
      primary: "Bukti prosiding tersedia",
      secondary: "Belum ada rekam pembanding",
      tone: "success",
    },
    source: "spreadsheet",
    sourceLabel: workbookSource,
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy: dataStewardSubmitter,
    subtitle: "Fathur Rahman · prosiding internasional terindeks",
    title:
      "Effect of Graphite Addition Variations on the Electrical Properties of Graphite Oxide-Based Conductive Inks for Low-Cost Medical Electrodes",
    typeLabel: "Makalah konferensi",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "innovation_ip",
    categoryLabel: "Inovasi & HKI",
    discoveredAt: "2026-08-16T09:06:00+07:00",
    discoveredAtLabel: "16 Agu 2026, 09.06",
    evidence: [
      evidence(
        "ev-km15-cerdas",
        "Dokumen pengajuan HKI",
        workbookSource,
        "Sheet no.15 · baris 4 · tautan publik belum tersedia",
      ),
    ],
    fields: [
      field("title", "Judul HKI", "Karya Edukasi Kesehatan A"),
      field("creator", "Nama", "Dosen A"),
      field("year", "Tahun", "2026"),
      field("ip_type", "Jenis HKI", "Hak Cipta"),
    ],
    history: [
      discovered("WB-KM15-004", workbookSource, "2026-08-16T09:06:00+07:00"),
    ],
    id: "WB-KM15-004",
    kpiLinks: [
      {
        evidenceRule:
          "Dokumen pengajuan atau penerimaan HKI pada tahun berjalan dan nomor registrasi bila sudah tersedia.",
        indicator: kmIndicator("KM-15"),
      },
    ],
    matches: [],
    owner: "CoE BHT",
    evaluationPeriodLabel: "2026",
    primaryPerson: "Dosen A",
    provenance: { sourceKey: "COPY_3 KM 2026.xlsx · no.15!A4:F4" },
    signal: {
      primary: "Belum ada tautan bukti publik",
      secondary: "Periksa dokumen pengajuan",
      tone: "waiting",
    },
    source: "spreadsheet",
    sourceLabel: workbookSource,
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy: dataStewardSubmitter,
    subtitle: "Dosen A · Hak Cipta",
    title: "Karya Edukasi Kesehatan A",
    typeLabel: "HKI",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "innovation_ip",
    categoryLabel: "Inovasi & HKI",
    discoveredAt: "2026-08-16T09:02:00+07:00",
    discoveredAtLabel: "16 Agu 2026, 09.02",
    evidence: [
      evidence(
        "ev-km16-patent-a",
        "Dokumen pengajuan paten",
        workbookSource,
        "Sheet no.16 · baris 4 · tautan publik belum tersedia",
      ),
    ],
    fields: [
      field("title", "Nama paten", "Paten Perangkat Kesehatan A"),
      field("patent_number", "Nomor paten", ""),
      field("inventors", "Inventor", "Inventor A; Inventor B"),
      field("submission_date", "Tanggal terbit/submit", "2026"),
    ],
    history: [
      discovered("WB-KM16-004", workbookSource, "2026-08-16T09:02:00+07:00"),
    ],
    id: "WB-KM16-004",
    kpiLinks: [
      {
        evidenceRule:
          "Dokumen pengajuan paten pada tahun berjalan dan nomor registrasi bila sudah tersedia.",
        indicator: kmIndicator("KM-16"),
      },
    ],
    matches: [],
    owner: "CoE BHT",
    evaluationPeriodLabel: "2026",
    primaryPerson: "Inventor A",
    provenance: { sourceKey: "COPY_3 KM 2026.xlsx · no.16!A4:E4" },
    signal: {
      primary: "Belum ada tautan bukti publik",
      secondary: "Rekam kandidat tetap dapat ditinjau",
      tone: "waiting",
    },
    source: "spreadsheet",
    sourceLabel: workbookSource,
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy: dataStewardSubmitter,
    subtitle: "Inventor A dkk. · paten",
    title: "Paten Perangkat Kesehatan A",
    typeLabel: "Paten",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "research_business",
    categoryLabel: "Riset & bisnis",
    discoveredAt: "2026-08-16T08:58:00+07:00",
    discoveredAtLabel: "16 Agu 2026, 08.58",
    evidence: [
      evidence(
        "ev-km17-contract-a",
        "Kontrak riset nasional",
        workbookSource,
        "Sheet no.17 · baris 4 · tautan publik belum tersedia",
      ),
    ],
    fields: [
      field("title", "Judul", "Kontrak Riset Nasional A"),
      field("coe", "CoE", "BHT"),
      field("scheme", "Skema", "Skema Riset Nasional A"),
      field("year", "Tahun", "2026"),
    ],
    history: [
      discovered("WB-KM17-004", workbookSource, "2026-08-16T08:58:00+07:00"),
    ],
    id: "WB-KM17-004",
    kpiLinks: [
      {
        evidenceRule:
          "Kontrak riset nasional, identitas skema, pihak terkait, dan periode pelaksanaan.",
        indicator: kmIndicator("KM-17"),
      },
    ],
    matches: [],
    owner: "CoE BHT",
    evaluationPeriodLabel: "2026",
    primaryPerson: "Tim Riset A",
    provenance: { sourceKey: "COPY_3 KM 2026.xlsx · no.17!A4:E4" },
    signal: {
      primary: "Belum ada tautan bukti publik",
      secondary: "Periksa dokumen kontrak",
      tone: "waiting",
    },
    source: "spreadsheet",
    sourceLabel: workbookSource,
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy: dataStewardSubmitter,
    subtitle: "Tim Riset A · kontrak riset nasional",
    title: "Kontrak Riset Nasional A",
    typeLabel: "Kontrak riset",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "research_business",
    categoryLabel: "Riset & bisnis",
    discoveredAt: "2026-08-16T08:54:00+07:00",
    discoveredAtLabel: "16 Agu 2026, 08.54",
    evidence: [
      evidence(
        "ev-km19-commercial-a",
        "Kontrak komersialisasi",
        workbookSource,
        "Sheet no.19 · baris 4 · tautan publik belum tersedia",
      ),
    ],
    fields: [
      field("partner", "Nama mitra kontrak", "Mitra Industri A"),
      field("start_date", "Tanggal mulai", "2026"),
      field("end_date", "Tanggal berakhir", "2027"),
    ],
    history: [
      discovered("WB-KM19-004", workbookSource, "2026-08-16T08:54:00+07:00"),
    ],
    id: "WB-KM19-004",
    kpiLinks: [
      {
        evidenceRule:
          "Dokumen kontrak bisnis, mitra industri, objek komersialisasi, dan periode kontrak.",
        indicator: kmIndicator("KM-19"),
      },
    ],
    matches: [],
    owner: "CoE BHT",
    evaluationPeriodLabel: "2026",
    primaryPerson: "Mitra Industri A",
    provenance: { sourceKey: "COPY_3 KM 2026.xlsx · no.19!A4:E4" },
    signal: {
      primary: "Belum ada tautan bukti publik",
      secondary: "Periksa dokumen kontrak",
      tone: "waiting",
    },
    source: "spreadsheet",
    sourceLabel: workbookSource,
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy: dataStewardSubmitter,
    subtitle: "Mitra Industri A · komersialisasi",
    title: "Kontrak Komersialisasi A",
    typeLabel: "Kontrak bisnis",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "academic_hr",
    categoryLabel: "Akademik & SDM",
    discoveredAt: "2026-08-16T08:50:00+07:00",
    discoveredAtLabel: "16 Agu 2026, 08.50",
    evidence: [
      evidence(
        "ev-km29-supervision-a",
        "Rekam bimbingan magister",
        workbookSource,
        "Sheet no. 29 · baris 5 · tautan publik belum tersedia",
      ),
    ],
    fields: [
      field("supervisor", "Dosen pembimbing", "Dosen A"),
      field("student", "Mahasiswa magister", "Mahasiswa A"),
      field("topic", "Topik riset", "Topik Riset Magister A"),
      field("coe", "CoE", "CoE BHT"),
    ],
    history: [
      discovered("WB-KM29-005", workbookSource, "2026-08-16T08:50:00+07:00"),
    ],
    id: "WB-KM29-005",
    kpiLinks: [
      {
        evidenceRule:
          "Rekam bimbingan magister, dosen pembimbing, mahasiswa, dan keterkaitan topik dengan riset CoE.",
        indicator: kmIndicator("KM-29"),
      },
    ],
    matches: [],
    owner: "CoE BHT",
    evaluationPeriodLabel: "2026",
    primaryPerson: "Dosen A",
    provenance: { sourceKey: "COPY_3 KM 2026.xlsx · no. 29!A5:G5" },
    signal: {
      primary: "Belum ada tautan bukti publik",
      secondary: "Periksa rekam bimbingan",
      tone: "waiting",
    },
    source: "spreadsheet",
    sourceLabel: workbookSource,
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy: dataStewardSubmitter,
    subtitle: "Dosen A · bimbingan magister",
    title: "Bimbingan Magister dengan Topik Riset CoE A",
    typeLabel: "Bimbingan magister",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "publication_conference",
    categoryLabel: "Publikasi & konferensi",
    discoveredAt: "2026-08-16T08:46:00+07:00",
    discoveredAtLabel: "16 Agu 2026, 08.46",
    evidence: [
      evidence(
        "ev-km33-keratin",
        "Halaman buku penerbit",
        "ScienceDirect",
        "Sheet no.33 · baris 4",
        "https://www.sciencedirect.com/science/chapter/referencework/abs/pii/B9780443301513000115?via%3Dihub",
      ),
    ],
    fields: [
      field(
        "title",
        "Judul buku",
        "Reduced Keratin for Biomedical Application",
      ),
      field(
        "authors",
        "Penulis",
        "M.S. Rijal; M.Z.L. Yee; D. Puspitasari; M.I. Setyawati; A. Wibowo; L.A.T.W. Asri; K.W. Ng",
      ),
      field("year", "Tahun terbit", "2026"),
      field("coe", "CoE", "BHT"),
    ],
    history: [
      discovered("WB-KM33-004", workbookSource, "2026-08-16T08:46:00+07:00"),
    ],
    id: "WB-KM33-004",
    kpiLinks: [
      {
        evidenceRule:
          "Halaman penerbit, judul buku, tahun terbit, dan daftar penulis.",
        indicator: kmIndicator("KM-33"),
      },
    ],
    matches: [],
    owner: "CoE BHT",
    evaluationPeriodLabel: "2026",
    primaryPerson: "D. Puspitasari",
    provenance: { sourceKey: "COPY_3 KM 2026.xlsx · no.33!A4:F4" },
    signal: {
      primary: "Bukti penerbit tersedia",
      secondary: "Periksa kepemilikan CoE",
      tone: "success",
    },
    source: "spreadsheet",
    sourceLabel: workbookSource,
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy: dataStewardSubmitter,
    subtitle: "D. Puspitasari dkk. · buku/referensi",
    title: "Reduced Keratin for Biomedical Application",
    typeLabel: "Buku / referensi",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "research_business",
    categoryLabel: "Riset & bisnis",
    discoveredAt: "2026-08-16T08:42:00+07:00",
    discoveredAtLabel: "16 Agu 2026, 08.42",
    evidence: [
      evidence(
        "ev-km38-proposal-a",
        "Proposal riset internasional",
        workbookSource,
        "Sheet no. 38 · baris 2 · tautan publik belum tersedia",
      ),
    ],
    fields: [
      field("title", "Judul proposal", "Proposal Riset Internasional A"),
      field("scheme", "Skema", "Skema Hibah Internasional A"),
      field("partner", "Mitra", "Mitra Akademik A; Mitra Industri A"),
      field("grantor", "Pemberi hibah", "Pemberi Hibah A"),
    ],
    history: [
      discovered("WB-KM38-002", workbookSource, "2026-08-16T08:42:00+07:00"),
    ],
    id: "WB-KM38-002",
    kpiLinks: [
      {
        evidenceRule:
          "Dokumen pengajuan, skema internasional, pengusul, mitra, dan instansi pemberi hibah.",
        indicator: kmIndicator("KM-38"),
      },
    ],
    matches: [],
    owner: "CoE BHT",
    evaluationPeriodLabel: "2026",
    primaryPerson: "Tim Pengusul A",
    provenance: { sourceKey: "COPY_3 KM 2026.xlsx · no. 38!A2:I2" },
    signal: {
      primary: "Belum ada tautan bukti publik",
      secondary: "Periksa dokumen pengajuan",
      tone: "waiting",
    },
    source: "spreadsheet",
    sourceLabel: workbookSource,
    status: "waiting",
    statusLabel: "Menunggu tinjauan",
    submittedBy: dataStewardSubmitter,
    subtitle: "Tim Pengusul A · proposal internasional",
    title: "Proposal Riset Internasional A",
    typeLabel: "Proposal riset internasional",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "activity_governance",
    categoryLabel: "Kegiatan & tata kelola",
    discoveredAt: "2026-08-15T15:20:00+07:00",
    discoveredAtLabel: "15 Agu 2026, 15.20",
    evidence: [
      evidence(
        "ev-neutral-device-test",
        "Ringkasan pengujian",
        "Dokumen internal",
        "Halaman 2 · skema dan nilai belum konsisten",
      ),
    ],
    fields: [
      field(
        "title",
        "Judul kegiatan",
        "Pengujian Perangkat Kesehatan Portabel",
      ),
      field("scheme", "Skema", "Program Internal"),
      field("amount", "Nilai dana", "Rp180.000.000"),
      field("year", "Tahun", "2026"),
    ],
    fixRequest: {
      assigneeLabel: "Akan ditentukan berdasarkan hak akses sistem",
      fieldIds: ["scheme", "amount"],
      reason:
        "Samakan nama skema dan nilai dana dengan halaman penandatanganan kontrak.",
    },
    history: [
      discovered(
        "CAND-260815-018",
        "Dokumen internal",
        "2026-08-15T15:20:00+07:00",
      ),
      {
        actor: sessionReviewerActor,
        id: "CAND-260815-018-correction",
        label: "Permintaan perbaikan dibuat",
        occurredAt: "2026-08-15T16:02:00+07:00",
      },
    ],
    id: "CAND-260815-018",
    kpiLinks: [],
    matches: [],
    owner: "Belum ditetapkan",
    evaluationPeriodLabel: "2026",
    primaryPerson: "Tim Kegiatan A",
    provenance: {},
    signal: {
      primary: "2 bidang perlu diperbaiki",
      secondary: "Skema dan nilai dana",
      tone: "danger",
    },
    source: "document",
    sourceLabel: "Dokumen",
    status: "needs_fix",
    statusLabel: "Perlu perbaikan",
    submittedBy: "Pengelola dokumen",
    subtitle: "Tim Kegiatan A · klasifikasi indikator belum dipastikan",
    title: "Pengujian Perangkat Kesehatan Portabel",
    typeLabel: "Kegiatan hasil ekstraksi",
    version: 1,
  },
  {
    candidateKind: "new_record",
    category: "activity_governance",
    categoryLabel: "Kegiatan & tata kelola",
    decision: {
      actor: sessionReviewerActor,
      kind: "approved_new",
      label: "Disetujui sebagai data baru",
      note: "Identitas kegiatan, periode, dan dokumen pendukung telah diperiksa. Keterkaitan indikator akan ditentukan terpisah setelah klasifikasi tersedia.",
      occurredAt: "2026-08-15T14:40:00+07:00",
    },
    discoveredAt: "2026-08-15T13:10:00+07:00",
    discoveredAtLabel: "15 Agu 2026, 13.10",
    evidence: [
      evidence(
        "ev-neutral-calibration",
        "Berita acara kegiatan",
        "Dokumen internal",
        "Halaman 1–3 · tautan belum tersedia",
      ),
    ],
    fields: [
      field(
        "title",
        "Judul kegiatan",
        "Kalibrasi Perangkat Biosinyal Laboratorium",
      ),
      field("team", "Tim pelaksana", "Tim Laboratorium A"),
      field("period", "Periode", "Agustus 2026"),
      field("output", "Luaran", "Berita acara kalibrasi"),
    ],
    history: [
      discovered(
        "CAND-260815-017",
        "Dokumen internal",
        "2026-08-15T13:10:00+07:00",
      ),
      {
        actor: sessionReviewerActor,
        id: "CAND-260815-017-approved",
        label: "Kandidat disetujui sebagai data baru",
        occurredAt: "2026-08-15T14:40:00+07:00",
      },
    ],
    id: "CAND-260815-017",
    kpiLinks: [],
    matches: [],
    owner: "Belum ditetapkan",
    evaluationPeriodLabel: "2026",
    primaryPerson: "Tim Laboratorium A",
    provenance: {},
    signal: {
      primary: "Keputusan tercatat",
      secondary: "Disetujui sebagai data baru",
      tone: "neutral",
    },
    source: "document",
    sourceLabel: "Dokumen",
    status: "completed",
    statusLabel: "Selesai ditinjau",
    submittedBy: "Pengelola dokumen",
    subtitle: "Tim Laboratorium A · klasifikasi indikator belum dipastikan",
    title: "Kalibrasi Perangkat Biosinyal Laboratorium",
    typeLabel: "Kegiatan hasil ekstraksi",
    version: 1,
  },
];

function replaceSessionActor(actor: string, reviewerLabel: string) {
  return actor === sessionReviewerActor ? reviewerLabel : actor;
}

function staticSourceActorId(record: AuditReviewRecord) {
  if (record.source === "spreadsheet") {
    return nexusReviewActorIds.workbookImport;
  }
  if (record.source === "document") {
    return nexusReviewActorIds.documentPipeline;
  }
  return nexusReviewActorIds.collectionService;
}

function staticHistoryActorId(entry: AuditReviewHistory) {
  if (entry.actorId) return entry.actorId;
  if (entry.actor === sessionReviewerActor) {
    return nexusReviewActorIds.workspaceAdmin;
  }
  if (entry.actor === workbookSource) return nexusReviewActorIds.workbookImport;
  if (entry.actor === "Sistem pencocokan") {
    return nexusReviewActorIds.matchingService;
  }
  return nexusReviewActorIds.documentPipeline;
}

/**
 * Serializable route content. Integrasi server kelak cukup mengganti pemasok
 * data pada batas halaman; kontrak interaksi ruang tinjauan tetap sama.
 */
export function getNexusAuditReviewContent(
  reviewerLabel: string,
): NexusAuditReviewContent {
  return {
    lastUpdatedLabel: "Diperbarui 16 Agu 2026, 09.22 WIB",
    records: records.map((record) => {
      const submittedByActorId =
        record.submittedByActorId ?? nexusReviewActorIds.dataSteward;
      const correctionAssigneeActorId =
        record.correctionAssigneeActorId ?? submittedByActorId;
      const correctionAssigneeLabel =
        record.correctionAssigneeLabel ?? record.submittedBy;

      return {
        ...record,
        decision: record.decision
          ? {
              ...record.decision,
              actor: replaceSessionActor(record.decision.actor, reviewerLabel),
              actorId:
                record.decision.actorId ?? nexusReviewActorIds.workspaceAdmin,
            }
          : undefined,
        fixRequest: record.fixRequest
          ? {
              ...record.fixRequest,
              assigneeActorId:
                record.fixRequest.assigneeActorId ?? correctionAssigneeActorId,
              assigneeLabel:
                record.fixRequest.assigneeActorId &&
                record.fixRequest.assigneeLabel
                  ? record.fixRequest.assigneeLabel
                  : correctionAssigneeLabel,
            }
          : undefined,
        history: record.history.map((entry) => ({
          ...entry,
          actor: replaceSessionActor(entry.actor, reviewerLabel),
          actorId: staticHistoryActorId(entry),
        })),
        correctionAssigneeActorId,
        correctionAssigneeLabel,
        sourceActorId: record.sourceActorId ?? staticSourceActorId(record),
        submittedByActorId,
      };
    }),
  };
}
