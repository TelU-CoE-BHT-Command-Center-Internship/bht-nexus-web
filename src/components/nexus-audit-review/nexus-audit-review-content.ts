import type { MetadataCompletionResolutions } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import type { NexusKmIndicator } from "@/content/nexus-km-indicators";

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
  input?: {
    choices?: Array<{ label: string; value: string }>;
    min?: string;
    required?: boolean;
    type: "date" | "number" | "select" | "text" | "textarea" | "url";
  };
  label: string;
  /** Nilai mesin untuk kontrol koreksi ketika label tampil berbeda. */
  rawValue?: string;
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
  /** Pemeriksa memutuskan kiriman yang ia ajukan sendiri. */
  selfReview?: true;
  targetRecordId?: string;
  version?: number;
};

export type AuditReviewDecision = {
  actor: string;
  actorId?: string;
  /** Akibat keputusan pada Data Resmi sebagaimana dijawab server. */
  appliedNote?: string;
  kind: AuditDecisionKind;
  kpiResolution?: AuditKpiResolution;
  memberPersonBinding?: AuditMemberPersonBinding;
  personMappings?: AuditPersonMapping[];
  label: string;
  note: string;
  /** Instant mesin; format WIB hanya dibuat ketika dirender. */
  occurredAt: string;
  /** Pemeriksa memutuskan kiriman yang ia ajukan sendiri. */
  selfReview?: true;
  /** Rekam resmi yang dipilih reviewer untuk merge, update, atau pelengkapan. */
  targetRecordId?: string;
  targetPersonId?: string;
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
  people?: AuditOfficialPerson[];
  score: number;
  title: string;
  verdict: "possible" | "same_identifier" | "strong";
  verdictLabel: string;
};

/**
 * Orang pada rekam resmi yang dapat dipilih secara eksplisit saat sebuah
 * kandidat dihubungkan ke rekam yang sudah ada. `id` adalah identitas orang
 * pada rekam tersebut; nama hanya dipakai untuk presentasi, bukan pencocokan.
 */
export type AuditOfficialPerson = {
  fieldId: string;
  id: string;
  memberId?: string;
  name: string;
};

/**
 * Relasi anggota-ke-orang yang dibawa kandidat dari sumbernya. Relasi ini
 * sengaja menunjuk field dan nama orang tertentu agar `memberId` tidak pernah
 * ditempelkan ke seluruh record multi-orang secara ambigu.
 */
export type AuditMemberPersonBinding = {
  fieldId: string;
  memberId: string;
  memberName: string;
  personId: string;
  personName: string;
  sourcePersonId?: string;
};

/**
 * Pemetaan eksplisit antara orang pada kandidat dan orang pada rekam resmi.
 * Keputusan `new` disimpan eksplisit agar backend tidak perlu menebak apakah
 * mapping memang belum diisi atau reviewer menyatakan orang tersebut baru.
 */
export type AuditPersonMapping = {
  candidatePersonId: string;
  fieldId: string;
  resolution: "existing" | "new";
  targetPersonId?: string;
};

export type AuditKpiLink = {
  evidenceRule: string;
  indicator: NexusKmIndicator;
};

export type AuditKpiResolution = {
  indicatorIds: NexusKmIndicator["id"][];
  status: "changed" | "confirmed" | "removed" | "undetermined";
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
  /** Tautan KM yang dihasilkan sistem dan belum menjadi pilihan final pengaju. */
  kpiLinksSuggested?: boolean;
  /** Payload terstruktur dari form manual; dipakai adapter promosi tanpa membaca ulang label UI. */
  manualSubmission?: {
    comparisonCandidates?: Array<{
      id: string;
      identifiers?: string[];
      people?: AuditOfficialPerson[];
      recordType?: string;
      subtitle?: string;
      title: string;
      year?: number;
    }>;
    domain:
      | "academic"
      | "activity"
      | "contract"
      | "intellectual-property"
      | "publication";
    recordType: string;
    values: Record<string, string>;
  };
  /** Versi kandidat yang dipakai layanan pencocokan untuk hasil ini. */
  matchingVersion?: number;
  matchingStatus?: AuditMatchingStatus;
  matches: AuditOfficialMatch[];
  owner: string;
  /** Periode evaluasi KM; kosong bila sumber belum menentukan periodenya. */
  evaluationPeriodLabel?: string;
  /** ID anggota kanonis; tidak pernah diturunkan hanya dari teks nama. */
  memberId?: string;
  /** Orang tertentu pada kandidat yang secara eksplisit mewakili anggota. */
  memberPersonBinding?: AuditMemberPersonBinding;
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
