import type {
  AuditDecisionKind,
  AuditKpiResolution,
  AuditMemberPersonBinding,
  AuditOfficialMatch,
  AuditPersonMapping,
  AuditReviewRecord,
  AuditReviewStatus,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import type { MetadataCompletionResolutions } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import type {
  AuditRuntimeState,
  NexusRecordCapabilities,
} from "@/components/nexus-review-session/nexus-review-session";
import { displayRecordId } from "@/components/nexus-workspace-ui/nexus-workspace-format";

export type { AuditRuntimeState };

/** Keadaan pencocokan kandidat terhadap Data Resmi yang dibaca dari server. */
export type AuditReviewMatching = {
  errorMessage?: string;
  onRetry?: () => void;
  state: "error" | "loading" | "ready";
};

/**
 * Bagian keputusan yang belum dicatat layanan. Bagian tersebut tetap tampil
 * sebagai tindakan yang segera tersedia dan tidak menjadi syarat keputusan.
 */
export type AuditReviewPlannedParts = {
  correctionEvidenceNote?: boolean;
  kpiResolution?: boolean;
  /** Menghubungkan kandidat hanya tersedia ke rekam resmi ber-DOI sama. */
  mergeRequiresSameIdentifier?: boolean;
};

export type AuditReviewDrawerProps = {
  capabilities: NexusRecordCapabilities;
  matching?: AuditReviewMatching;
  onClose: () => void;
  /** Menyimpan keputusan; mengembalikan pesan bila server menolaknya. */
  onDecide: (
    kind: AuditDecisionKind,
    note: string,
    fieldIds: string[],
    targetRecordId?: string,
    kpiResolution?: AuditKpiResolution,
    memberPersonBinding?: AuditMemberPersonBinding,
    targetPersonId?: string,
    personMappings?: AuditPersonMapping[],
  ) => Promise<string | undefined>;
  /** Mengirim perbaikan; mengembalikan pesan bila server menolaknya. */
  onResubmit: (
    values: Record<string, string>,
    evidenceNote: string,
    resolutions?: MetadataCompletionResolutions,
  ) => Promise<string | undefined>;
  planned?: AuditReviewPlannedParts;
  record: AuditReviewRecord;
  state: AuditRuntimeState;
};

export type ReviewSectionIndexes = {
  comparison: string;
  decision: string;
  match: string;
  metadata: string;
  source: string;
};

/** ID rekam untuk tampilan; UUID dipendekkan menjadi delapan karakter awal. */
export const auditRecordLabel = displayRecordId;

export function auditStatusLabel(status: AuditReviewStatus) {
  if (status === "completed") return "Selesai ditinjau";
  if (status === "needs_fix") return "Perlu perbaikan";
  return "Menunggu tinjauan";
}

export function auditStatusTone(status: AuditReviewStatus) {
  if (status === "completed") return "success" as const;
  if (status === "needs_fix") return "danger" as const;
  return "waiting" as const;
}

export function auditSourceTone(source: AuditReviewRecord["source"]) {
  if (source === "sinta") return "success" as const;
  if (source === "scholar") return "info" as const;
  if (source === "document") return "waiting" as const;
  if (source === "spreadsheet") return "info" as const;
  return "neutral" as const;
}

export function auditCurrentValue(
  record: AuditReviewRecord,
  state: AuditRuntimeState,
  fieldId: string,
) {
  const field = record.fields.find((item) => item.id === fieldId);
  const original = field?.rawValue ?? field?.value;
  return state.correction?.after[fieldId] ?? original ?? "—";
}

export function auditDisplayValue(
  record: AuditReviewRecord,
  state: AuditRuntimeState,
  fieldId: string,
) {
  const field = record.fields.find((item) => item.id === fieldId);
  const value = auditCurrentValue(record, state, fieldId);
  return (
    field?.input?.choices?.find((choice) => choice.value === value)?.label ??
    value
  );
}

export function auditEffectiveTitle(
  record: AuditReviewRecord,
  state: AuditRuntimeState,
) {
  const titleField = record.fields.find((item) =>
    ["activity_title", "title"].includes(item.id),
  );
  return titleField
    ? auditCurrentValue(record, state, titleField.id) || record.title
    : record.title;
}

export function auditEffectiveSubtitle(
  record: AuditReviewRecord,
  state: AuditRuntimeState,
) {
  if (!state.correction) return record.subtitle;

  const values = record.fields
    .filter((item) => !["activity_title", "title"].includes(item.id))
    .map((item) => auditDisplayValue(record, state, item.id).trim())
    .filter((value) => value && value !== "—")
    .slice(0, 2);

  return values.length > 0 ? values.join(" · ") : record.subtitle;
}

export function auditEvaluationPeriodLabel(record: AuditReviewRecord) {
  return record.evaluationPeriodLabel ?? "Belum ditetapkan";
}

export function auditSectionIndexes(
  hasOfficialMatch: boolean,
): ReviewSectionIndexes {
  return hasOfficialMatch
    ? {
        comparison: "03",
        decision: "05",
        match: "02",
        metadata: "01",
        source: "04",
      }
    : {
        comparison: "",
        decision: "04",
        match: "02",
        metadata: "01",
        source: "03",
      };
}

export function auditDecisionConsequence(
  choice: AuditDecisionKind | null,
  selectedMatch?: AuditOfficialMatch,
) {
  if (choice === "merged") {
    return {
      body: `Kandidat akan dihubungkan ke ${selectedMatch ? auditRecordLabel(selectedMatch.id) : "rekam terpilih"}. Sumber dan perbedaannya dipertahankan pada rekam resmi yang sama.`,
      title: "Kandidat dihubungkan tanpa membuat duplikat",
    };
  }
  if (choice === "approved_update") {
    return {
      body: `Perubahan yang diperiksa akan diterapkan ke ${selectedMatch ? auditRecordLabel(selectedMatch.id) : "rekam resmi terpilih"}. Nilai sebelumnya, sumber, reviewer, waktu, dan versi tetap tercatat.`,
      title: "Rekam resmi diperbarui dengan jejak versi",
    };
  }
  if (choice === "approved_completion") {
    return {
      body: `Nilai atau pengecualian yang diajukan diterapkan pada ${selectedMatch ? auditRecordLabel(selectedMatch.id) : "rekam resmi tujuan"}. Status kelengkapan dihitung ulang tanpa membuat rekam baru.`,
      title: "Pelengkapan metadata diterapkan",
    };
  }
  if (choice === "approved_new") {
    return {
      body: "Kandidat akan menjadi rekam resmi baru bersama bukti, hasil verifikasi indikator, reviewer, waktu, dan versinya.",
      title: "Kandidat menjadi data resmi baru",
    };
  }
  if (choice === "changes_requested") {
    return {
      body: "Kandidat dikembalikan kepada pihak pengusul atau pengelola yang berwenang untuk memperbaiki bidang yang dipilih. Rekam resmi dan perhitungan evaluasi belum berubah.",
      title: "Perbaikan diminta sebelum data dipakai",
    };
  }
  if (choice === "rejected") {
    return {
      body: "Kandidat ditutup tanpa mengubah data resmi. Alasan penolakan dan jejak pemeriksaan tetap tersimpan pada riwayat tinjauan.",
      title: "Kandidat tidak diterapkan",
    };
  }
  return {
    body: "Pilih satu keputusan untuk melihat akibatnya sebelum disimpan.",
    title: "Akibat keputusan",
  };
}
