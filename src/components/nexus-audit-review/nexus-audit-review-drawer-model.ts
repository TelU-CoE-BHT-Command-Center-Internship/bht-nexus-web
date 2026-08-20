import type {
  AuditDecisionKind,
  AuditOfficialMatch,
  AuditReviewRecord,
  AuditReviewStatus,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import type {
  AuditRuntimeState,
  NexusReviewCapabilities,
} from "@/components/nexus-review-session/nexus-review-session";

export type { AuditRuntimeState };

export type AuditReviewDrawerProps = {
  capabilities: NexusReviewCapabilities;
  onClose: () => void;
  onDecide: (
    kind: AuditDecisionKind,
    note: string,
    fieldIds: string[],
    targetRecordId?: string,
  ) => void;
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
      body: `Rekam resmi ${selectedMatch?.id ?? "terpilih"} tetap menjadi acuan. Sumber kandidat dihubungkan dan perbedaan metadata dicatat sebagai bahan pelengkapan, tanpa penimpaan otomatis.`,
      title: "Data resmi tetap aman dan dapat diaudit",
    };
  }
  if (choice === "approved_update") {
    return {
      body: `Perubahan yang diperiksa diterapkan pada ${selectedMatch?.id ?? "rekam resmi terpilih"} setelah konfirmasi. Nilai sebelumnya, sumber, reviewer, waktu, dan versi tetap dapat ditelusuri.`,
      title: "Pembaruan diterapkan dengan jejak versi",
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
      body: "Kandidat diterima sebagai rekam resmi baru setelah keputusan dikonfirmasi. Bukti, indikator, reviewer, waktu, dan versi kandidat tetap tercatat.",
      title: "Kandidat menjadi data baru",
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
