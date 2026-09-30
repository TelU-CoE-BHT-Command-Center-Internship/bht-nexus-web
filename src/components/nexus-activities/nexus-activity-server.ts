"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ActivityCompletionFieldKey,
  ActivityGroup,
  ActivityKind,
  NexusActivityView,
} from "@/components/nexus-activities/nexus-activities-content";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { nexusKmIndicators } from "@/content/nexus-km-indicators";
import {
  type ActivityDetail,
  type ActivityStatus,
  type ActivitySummary,
  getActivity,
  listAllActivities,
} from "@/lib/api-activities";
import { apiErrorKind, apiErrorMessage } from "@/lib/api-client";

/**
 * Satu-satunya penerjemah kegiatan server ke bentuk halaman Kegiatan &
 * Pengabdian. Jenis dan kelompok mengikuti indikator KM yang tercatat pada
 * rekam, sama seperti aturan rekam resmi lain; tanpa indikator, jenis
 * mengikuti tipe kegiatan dari server.
 */

const kindByIndicator: Record<string, ActivityKind> = {
  "KM-9": "Pembicara Undangan Internasional",
  "KM-10": "Kunjungan Lembaga Internasional",
  "KM-20": "Keterlibatan Unit Bisnis",
  "KM-21": "Pembinaan UMKM / Komunitas",
  "KM-22": "Pengelolaan Konferensi Internasional",
  "KM-23": "Kontrak Non-Riset",
  "KM-24": "Community Services",
  "KM-25": "Proposal Abdimas DRTPM",
  "KM-26": "Proposal Abdimas SDGs",
  "KM-27": "Pengelolaan Jurnal Ilmiah",
};

const groupByKind: Record<ActivityKind, ActivityGroup> = {
  "Community Services": "Pengabdian masyarakat",
  "Keterlibatan Unit Bisnis": "Bisnis",
  "Kegiatan Lainnya": "Riset & jejaring",
  "Kontrak Non-Riset": "Pengabdian masyarakat",
  "Kunjungan Lembaga Internasional": "Riset & jejaring",
  "Pembicara Undangan Internasional": "Riset & jejaring",
  "Pembinaan UMKM / Komunitas": "Bisnis",
  "Pengelolaan Jurnal Ilmiah": "Pengabdian masyarakat",
  "Pengelolaan Konferensi Internasional": "Pengabdian masyarakat",
  "Proposal Abdimas DRTPM": "Pengabdian masyarakat",
  "Proposal Abdimas SDGs": "Pengabdian masyarakat",
};

const statusLabels: Record<ActivityStatus, NexusActivityView["recordStatus"]> =
  {
    cancelled: "Dibatalkan",
    closed: "Selesai",
    ongoing: "Berjalan",
    planned: "Direncanakan",
  };

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

function periodLabel(summary: ActivitySummary) {
  const start = formatDate(summary.periodStart);
  return summary.periodEnd
    ? `${start} – ${formatDate(summary.periodEnd)}`
    : `Mulai ${start}`;
}

function funding(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return undefined;
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

export function nexusActivityFromServer(
  summary: ActivitySummary,
  detail?: ActivityDetail,
): NexusActivityView {
  const kmLinks = (summary.kmIndicators ?? []).flatMap((id) => {
    const indicator = nexusKmIndicators.find((item) => item.id === id);
    return indicator ? [{ indicator, note: "" }] : [];
  });
  const firstIndicator = kmLinks[0]?.indicator.id;
  const kind: ActivityKind =
    (firstIndicator ? kindByIndicator[firstIndicator] : undefined) ??
    (summary.type === "community_service"
      ? "Community Services"
      : "Kegiatan Lainnya");
  const missingFields: ActivityCompletionFieldKey[] = [
    ...(summary.title.trim() === "" ? (["title"] as const) : []),
    "evidenceUrl",
  ];

  return {
    evaluationPeriod: "",
    evidenceNote:
      "Sumber belum mencatat tautan atau lokasi dokumen untuk rekam ini.",
    evidenceStatus: "unrecorded",
    funding: funding(summary.amount),
    group: groupByKind[kind],
    id: summary.publicId,
    kind,
    kmLinks,
    missingFields,
    ownerUnit: "",
    periodLabel: periodLabel(summary),
    primaryParty: "",
    provenance: [],
    publicId: summary.publicId,
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    recordStatus: statusLabels[summary.status],
    recordedAt: formatAuditTimestamp(summary.createdAt),
    relatedMemberIds: (detail?.participants ?? []).flatMap((participant) =>
      participant.memberPublicId ? [participant.memberPublicId] : [],
    ),
    title: summary.title,
    updatedAt: "",
  };
}

export type NexusLoadState = "error" | "loading" | "ready";

/** Katalog kegiatan resmi dari server. */
export function useNexusActivityCatalog() {
  const [records, setRecords] = useState<NexusActivityView[]>([]);
  const [state, setState] = useState<NexusLoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    listAllActivities()
      .then((activities) => {
        if (request !== latestRequest.current) return;
        setRecords(
          activities.map((activity) => nexusActivityFromServer(activity)),
        );
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(
          apiErrorMessage(error, "Kegiatan resmi belum dapat dimuat."),
        );
        setState("error");
      });
  }, []);

  useEffect(() => {
    load();
    return () => {
      latestRequest.current += 1;
    };
  }, [load]);

  return { errorMessage, records, retry: load, state };
}

/** Rincian satu kegiatan (termasuk peserta), disimpan selama halaman terbuka. */
export function useNexusActivityDetail(publicId: string | null) {
  const cache = useRef(new Map<string, NexusActivityView>());
  const latestRequest = useRef(0);
  const [detail, setDetail] = useState<{
    errorMessage?: string;
    notFound?: boolean;
    record?: NexusActivityView;
    state: NexusLoadState | "idle";
  }>({ state: "idle" });

  const load = useCallback((id: string | null) => {
    const request = ++latestRequest.current;
    if (!id) {
      setDetail({ state: "idle" });
      return;
    }
    const cached = cache.current.get(id);
    if (cached) {
      setDetail({ record: cached, state: "ready" });
      return;
    }
    setDetail({ state: "loading" });
    getActivity(id)
      .then((activity) => {
        if (request !== latestRequest.current) return;
        const record = nexusActivityFromServer(activity, activity);
        cache.current.set(id, record);
        setDetail({ record, state: "ready" });
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setDetail({
          errorMessage: apiErrorMessage(
            error,
            "Rincian kegiatan belum dapat dimuat.",
          ),
          notFound: apiErrorKind(error) === "not-found",
          state: "error",
        });
      });
  }, []);

  useEffect(() => {
    load(publicId);
    return () => {
      latestRequest.current += 1;
    };
  }, [load, publicId]);

  const retry = useCallback(() => load(publicId), [load, publicId]);

  return { ...detail, retry };
}
