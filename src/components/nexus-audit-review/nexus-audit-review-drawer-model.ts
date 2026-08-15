import type {
  AuditDecisionKind,
  AuditFixRequest,
  AuditReviewDecision,
  AuditReviewHistory,
  AuditReviewRecord,
  AuditReviewStatus,
} from "@/components/nexus-audit-review/nexus-audit-review-content";

export type AuditCorrection = {
  after: Record<string, string>;
  before: Record<string, string>;
  evidenceNote: string;
  fieldIds: string[];
  version: number;
};

export type AuditRuntimeState = {
  correction?: AuditCorrection;
  decision?: AuditReviewDecision;
  fixRequest?: AuditFixRequest;
  history: AuditReviewHistory[];
  status: AuditReviewStatus;
  version: number;
};

export type AuditReviewDrawerProps = {
  onClose: () => void;
  onDecide: (kind: AuditDecisionKind, note: string, fieldIds: string[]) => void;
  onResubmit: (values: Record<string, string>, evidenceNote: string) => void;
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
  record: AuditReviewRecord,
) {
  if (choice === "merged") {
    return {
      body: `Rekam resmi ${record.match?.id ?? "terpilih"} tetap menjadi acuan. Sumber kandidat dihubungkan dan perbedaan metadata dicatat sebagai bahan pelengkapan, tanpa penimpaan otomatis.`,
      title: "Data resmi tetap aman dan dapat diaudit",
    };
  }
  if (choice === "approved_new") {
    return {
      body: "Kandidat diterima sebagai rekam resmi baru setelah keputusan dikonfirmasi. Bukti, indikator, reviewer, waktu, dan versi kandidat tetap tercatat.",
      title: "Kandidat menjadi data baru",
    };
  }
  if (choice === "changes_requested") {
    return {
      body: "Kandidat dikembalikan kepada pemilik data untuk memperbaiki bidang yang dipilih. Rekam resmi dan perhitungan evaluasi belum berubah.",
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
