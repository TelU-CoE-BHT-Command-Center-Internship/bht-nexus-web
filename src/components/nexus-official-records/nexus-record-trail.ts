"use client";

import { useEffect, useMemo, useState } from "react";
import {
  displayRecordId,
  formatAuditTimestamp,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  getRecordTrail,
  type RecordTrail,
  type RecordTrailCorrection,
  type RecordTrailDecision,
  type RecordTrailHouse,
  type RecordTrailSource,
} from "@/lib/api-record-trail";

/**
 * Jejak satu rekam resmi dari server: sumber yang membentuknya dan keputusan
 * tinjauan terakhir yang menyetujuinya. Bentuknya sama dengan bagian Sumber
 * dan Keputusan tinjauan pada rincian setiap rumah Data Resmi.
 */

export type NexusRecordTrailProvenance = {
  capturedAt: string;
  identifier: string;
  note?: string;
  source:
    | "Dokumen"
    | "Google Scholar"
    | "Manual"
    | "SINTA"
    | "Workbook KM 2026";
  sourceUrl?: string;
};

export type NexusRecordTrailReview = {
  candidateId: string;
  decision:
    | "Dihubungkan ke rekam resmi"
    | "Disetujui sebagai data baru"
    | "Pelengkapan metadata disetujui";
  note: string;
  reviewedAt: string;
  reviewer: string;
};

/** Satu koreksi langsung, siap ditampilkan pada Riwayat koreksi. */
export type NexusRecordTrailCorrection = {
  changes: { label: string; value: string }[];
  correctedAt: string;
  corrector: string;
  id: string;
  reason: string;
};

export type NexusRecordTrailState =
  | { state: "error" | "idle" | "loading" }
  | {
      corrections: NexusRecordTrailCorrection[];
      provenance: NexusRecordTrailProvenance[];
      review?: NexusRecordTrailReview;
      state: "ready";
    };

const sourceLabels: Record<string, NexusRecordTrailProvenance["source"]> = {
  document: "Dokumen",
  google_scholar: "Google Scholar",
  import: "Workbook KM 2026",
  manual: "Manual",
  rag: "Dokumen",
  sinta: "SINTA",
};

const sourceNotes: Partial<
  Record<NexusRecordTrailProvenance["source"], string>
> = {
  "Google Scholar": "Dikumpulkan dari profil Google Scholar peneliti.",
  Manual: "Diajukan melalui formulir pengajuan BHT Nexus.",
  SINTA: "Dikumpulkan dari profil SINTA peneliti.",
};

function provenanceOf(source: RecordTrailSource): NexusRecordTrailProvenance {
  const label = sourceLabels[source.source] ?? "Manual";
  const reference = source.reference?.trim();
  return {
    capturedAt: formatAuditTimestamp(source.capturedAt),
    identifier:
      label === "Manual" && reference
        ? `Tanda terima ${displayRecordId(reference)}`
        : (source.sourceUrl ?? reference ?? "Tidak tercatat"),
    note: sourceNotes[label],
    source: label,
    sourceUrl: source.sourceUrl ?? undefined,
  };
}

function reviewOf(
  decisions: readonly RecordTrailDecision[],
): NexusRecordTrailReview | undefined {
  const approvals = decisions.filter(
    (decision) => decision.decision === "approve",
  );
  const latest = approvals[0];
  if (!latest) return undefined;
  const firstPromotion = approvals.findLast(
    (decision) => decision.purpose === "promotion",
  );
  const decision: NexusRecordTrailReview["decision"] =
    latest.purpose === "completion"
      ? "Pelengkapan metadata disetujui"
      : latest === firstPromotion
        ? "Disetujui sebagai data baru"
        : "Dihubungkan ke rekam resmi";
  return {
    candidateId: displayRecordId(latest.reviewCasePublicId),
    decision,
    note:
      latest.reason?.trim() ||
      (latest.purpose === "completion"
        ? "Usulan pelengkapan metadata diperiksa dan disetujui."
        : "Kandidat diperiksa dan disetujui menjadi rekam resmi."),
    reviewedAt: formatAuditTimestamp(latest.decidedAt),
    reviewer: latest.reviewerName,
  };
}

const correctionLabels: Record<string, string> = {
  contractStart: "Tanggal mulai kontrak",
  eventDate: "Tanggal kegiatan",
  kmIndicators: "Kaitan indikator KM",
  protectionType: "Bentuk perlindungan",
  publicationDate: "Tanggal terbit",
  quartile: "Kuartil jurnal",
  registrationNumber: "Nomor pencatatan",
  reportedQuarter: "Triwulan dilaporkan",
  submissionDate: "Tanggal pengajuan",
  workType: "Bentuk karya",
  year: "Tahun",
};

const workTypeLabels: Record<string, string> = {
  book: "Buku",
  book_chapter: "Book chapter",
  conference_paper: "Makalah konferensi",
  journal_article: "Artikel jurnal",
  other: "Belum diklasifikasikan",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

function correctionValue(key: string, value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return dateFormatter.format(new Date(`${value}T00:00:00Z`));
  }
  if (key === "kmIndicators") return value || "Tidak terkait indikator KM";
  if (key === "reportedQuarter") return value ? `TW${value}` : "Dikosongkan";
  if (key === "workType") return workTypeLabels[value] ?? value;
  return value;
}

function correctionOf(
  correction: RecordTrailCorrection,
): NexusRecordTrailCorrection {
  return {
    changes: Object.entries(correction.changes).map(([key, value]) => ({
      label: correctionLabels[key] ?? key,
      value: correctionValue(key, value),
    })),
    correctedAt: formatAuditTimestamp(correction.correctedAt),
    corrector: correction.correctorName,
    id: correction.correctionPublicId,
    reason: correction.reason,
  };
}

export function nexusRecordTrailView(
  trail: RecordTrail,
): NexusRecordTrailState {
  return {
    corrections: trail.corrections.map(correctionOf),
    provenance: trail.sources.map(provenanceOf),
    review: reviewOf(trail.decisions),
    state: "ready",
  };
}

const housesByHref: Record<string, RecordTrailHouse> = {
  "/nexus/akademik": "academics",
  "/nexus/kegiatan": "activities",
  "/nexus/kekayaan-intelektual": "intellectual-properties",
  "/nexus/kontrak-proposal": "contracts-proposals",
  "/nexus/publikasi": "publications",
};

/** Rumah data jejak dari tautan rumah Data Resmi, misalnya pada Monitoring. */
export function nexusRecordTrailHouse(
  houseHref: string,
): RecordTrailHouse | undefined {
  return housesByHref[houseHref.split(/[?#]/)[0] ?? ""];
}

/** Banyaknya koreksi langsung yang sudah dimuat untuk rekam ini. */
export function nexusRecordTrailCorrectionCount(
  trail: NexusRecordTrailState,
): number {
  return trail.state === "ready" ? trail.corrections.length : 0;
}

/**
 * Jejak rekam yang sedang dibuka; dibaca ulang setiap rincian dibuka atau
 * `revision` berubah, misalnya setelah rekam dikoreksi.
 */
export function useNexusRecordTrail(
  house: RecordTrailHouse | undefined,
  publicId: string | undefined,
  revision?: string,
): NexusRecordTrailState {
  const [trail, setTrail] = useState<NexusRecordTrailState>({
    state: house && publicId ? "loading" : "idle",
  });

  const request = useMemo(
    () => (house && publicId ? { house, publicId, revision } : undefined),
    [house, publicId, revision],
  );

  useEffect(() => {
    if (!request) {
      setTrail({ state: "idle" });
      return;
    }
    let cancelled = false;
    setTrail({ state: "loading" });
    getRecordTrail(request.house, request.publicId)
      .then((result) => {
        if (!cancelled) setTrail(nexusRecordTrailView(result));
      })
      .catch(() => {
        if (!cancelled) setTrail({ state: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [request]);

  return trail;
}

/** Keterangan bagian Sumber ketika belum ada kartu sumber untuk ditampilkan. */
export function nexusRecordTrailSourcesMessage(
  trail: NexusRecordTrailState,
): string {
  if (trail.state === "loading") return "Memuat sumber pembentuk rekam ini…";
  if (trail.state === "error") {
    return "Sumber pembentuk rekam ini belum dapat dimuat. Tutup lalu buka kembali rinciannya untuk mencoba lagi.";
  }
  return "Rekam ini tidak berasal dari kandidat Tinjauan, misalnya data awal sistem, sehingga tidak mempunyai sumber pembentuk.";
}

/** Keterangan bagian Keputusan tinjauan ketika belum ada keputusan disetujui. */
export function nexusRecordTrailReviewMessage(
  trail: NexusRecordTrailState,
): string {
  if (trail.state === "loading") return "Memuat keputusan tinjauan…";
  if (trail.state === "error") {
    return "Keputusan tinjauan rekam ini belum dapat dimuat. Tutup lalu buka kembali rinciannya untuk mencoba lagi.";
  }
  return "Belum ada keputusan tinjauan yang tertaut ke rekam ini.";
}
