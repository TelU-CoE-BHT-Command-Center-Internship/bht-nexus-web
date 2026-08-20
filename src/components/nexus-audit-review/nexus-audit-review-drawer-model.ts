import type {
  AuditDecisionKind,
  AuditOfficialMatch,
  AuditReviewRecord,
  AuditReviewStatus,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import type { MetadataCompletionResolutions } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import type {
  AuditRuntimeState,
  NexusRecordCapabilities,
} from "@/components/nexus-review-session/nexus-review-session";

export type { AuditRuntimeState };

export type AuditReviewDrawerProps = {
  capabilities: NexusRecordCapabilities;
  onClose: () => void;
  onDecide: (
    kind: AuditDecisionKind,
    note: string,
    fieldIds: string[],
    targetRecordId?: string,
  ) => void;
  onResubmit: (
    values: Record<string, string>,
    evidenceNote: string,
    resolutions?: MetadataCompletionResolutions,
  ) => void;
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
  const original = record.fields.find((item) => item.id === fieldId)?.value;
  return state.correction?.after[fieldId] ?? original ?? "—";
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
    .map((item) => auditCurrentValue(record, state, item.id).trim())
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
      body: `Keputusan untuk menghubungkan kandidat ke ${selectedMatch?.id ?? "rekam terpilih"} dicatat bersama sumber dan perbedaannya. Data resmi diperbarui setelah layanan BHT Nexus mengonfirmasi transaksi.`,
      title: "Hubungan data dicatat untuk dikonfirmasi",
    };
  }
  if (choice === "approved_update") {
    return {
      body: `Perubahan yang diperiksa disiapkan untuk ${selectedMatch?.id ?? "rekam resmi terpilih"}. Nilai sebelumnya, sumber, reviewer, waktu, dan versi menyertai konfirmasi layanan BHT Nexus.`,
      title: "Pembaruan dicatat dengan jejak versi",
    };
  }
  if (choice === "approved_completion") {
    return {
      body: `Nilai atau pengecualian yang diajukan diterapkan pada ${selectedMatch?.id ?? "rekam resmi tujuan"}. Status kelengkapan dihitung ulang tanpa membuat rekam baru.`,
      title: "Pelengkapan metadata diterapkan",
    };
  }
  if (choice === "approved_new") {
    return {
      body: "Keputusan menerima kandidat dicatat bersama bukti, indikator, reviewer, waktu, dan versinya. Rekam resmi dibuat setelah layanan BHT Nexus mengonfirmasi transaksi.",
      title: "Kandidat disetujui sebagai data baru",
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
