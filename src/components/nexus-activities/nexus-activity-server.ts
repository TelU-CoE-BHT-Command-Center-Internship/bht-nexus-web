"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ActivityCompletionFieldKey,
  ActivityGroup,
  ActivityKind,
  NexusActivityView,
} from "@/components/nexus-activities/nexus-activities-content";
import {
  belongsToActivityHouse,
  metadataText,
} from "@/components/nexus-official-records/nexus-record-metadata";
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
import { getMember } from "@/lib/api-members";
import { useLoadEffect } from "@/lib/use-load-effect";

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
  memberNames: readonly string[] = [],
): NexusActivityView {
  const metadata = summary.metadata ?? {};
  const text = (key: string) => metadataText(metadata, key);
  const evidenceUrl = text("evidenceUrl");
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
    ...(evidenceUrl ? [] : (["evidenceUrl"] as const)),
  ];

  return {
    evaluationPeriod: String(new Date(summary.periodStart).getUTCFullYear()),
    eventDate: (text("eventDate") ?? summary.periodStart).slice(0, 10),
    evidenceNote: evidenceUrl
      ? "Dokumen sumber dapat dibuka melalui tautan yang tercatat."
      : "Sumber belum mencatat tautan atau lokasi dokumen untuk rekam ini.",
    evidenceStatus: evidenceUrl ? "public" : "unrecorded",
    evidenceUrl,
    funding: funding(summary.amount),
    group: groupByKind[kind],
    id: summary.publicId,
    issn: text("issn"),
    journalVolume: text("journalVolume"),
    kind,
    kmLinks,
    location: text("location"),
    missingFields,
    organization: text("organization") ?? text("institution"),
    ownerUnit: "",
    periodLabel: periodLabel(summary),
    primaryParty: text("primaryParty") ?? text("speakerName") ?? "",
    provenance: [],
    publicId: summary.publicId,
    publicationFrequency: text("publicationFrequency"),
    quality: missingFields.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    recordStatus: statusLabels[summary.status],
    recordedAt: formatAuditTimestamp(summary.createdAt),
    referenceNumber: text("referenceNumber"),
    relatedMemberIds: (detail?.participants ?? []).flatMap((participant) =>
      participant.memberPublicId ? [participant.memberPublicId] : [],
    ),
    role: text("role"),
    scheme: text("scheme"),
    submittedOn: text("submissionDate")?.slice(0, 10),
    targetGroup: text("targetGroup"),
    team:
      text("team") ??
      (memberNames.length > 0 ? memberNames.join("; ") : undefined),
    title: summary.title,
    updatedAt: formatAuditTimestamp(summary.createdAt),
  };
}

export type NexusLoadState = "error" | "loading" | "ready";

/** Nama anggota yang tertaut sebagai peserta; kosong bila akun tidak boleh membaca anggota. */
async function participantNames(activity: ActivityDetail) {
  const results = await Promise.allSettled(
    activity.participants.flatMap((participant) =>
      participant.memberPublicId ? [getMember(participant.memberPublicId)] : [],
    ),
  );
  return results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value.name] : [],
  );
}

/** Katalog kegiatan resmi dari server. */
export function useNexusActivityCatalog() {
  const [records, setRecords] = useState<NexusActivityView[]>([]);
  const [state, setState] = useState<NexusLoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loadedAt, setLoadedAt] = useState<Date>();
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    listAllActivities()
      .then((activities) => {
        if (request !== latestRequest.current) return;
        setRecords(
          activities
            .filter(
              (activity) => !belongsToActivityHouse(activity.metadata ?? {}),
            )
            .map((activity) => nexusActivityFromServer(activity)),
        );
        setLoadedAt(new Date());
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

  useLoadEffect(load);

  return { errorMessage, loadedAt, records, retry: load, state };
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
      .then(async (activity) => {
        const names = await participantNames(activity);
        if (request !== latestRequest.current) return;
        const record = nexusActivityFromServer(activity, activity, names);
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
