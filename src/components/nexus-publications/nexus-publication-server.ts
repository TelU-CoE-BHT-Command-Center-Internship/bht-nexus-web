"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  NexusPublicationView,
  PublicationCompletionFieldKey,
} from "@/components/nexus-publications/nexus-publications-content";
import {
  formatAuditTimestamp,
  personInitials,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { nexusKmIndicators } from "@/content/nexus-km-indicators";
import { apiErrorKind, apiErrorMessage } from "@/lib/api-client";
import { getMember } from "@/lib/api-members";
import {
  getPublication,
  listAllPublications,
  type PublicationDetail,
  type PublicationSummary,
  type WorkType,
} from "@/lib/api-publications";

/**
 * Satu-satunya penerjemah publikasi server ke bentuk halaman Publikasi. Bidang
 * yang belum dijawab server (jejak sumber, keputusan tinjauan, periode
 * evaluasi, penyedia sitasi) dibiarkan kosong, tidak pernah dikarang.
 */

const publicationTypes: Record<WorkType, NexusPublicationView["type"]> = {
  book_chapter: "Buku / Book Chapter",
  conference_paper: "Makalah Konferensi",
  journal_article: "Artikel Jurnal",
  other: "Belum diklasifikasikan",
  patent: "Belum diklasifikasikan",
};

function kmLinks(ids: readonly string[] | undefined) {
  return (ids ?? []).flatMap((id) => {
    const indicator = nexusKmIndicators.find((item) => item.id === id);
    return indicator ? [{ indicator, note: "" }] : [];
  });
}

/** Aturan kelengkapan yang sama dengan rekam resmi lain, diterapkan pada data server. */
function missingFields(
  summary: PublicationSummary,
  type: NexusPublicationView["type"],
): PublicationCompletionFieldKey[] {
  const quartileApplies = type === "Artikel Jurnal";
  return [
    ...(summary.title.trim() === "" ? (["title"] as const) : []),
    ...(type === "Belum diklasifikasikan" ? (["type"] as const) : []),
    ...(quartileApplies && !summary.quartile ? (["quartile"] as const) : []),
    ...(summary.doi ? [] : (["publisherUrl"] as const)),
  ];
}

export function nexusPublicationFromServer(
  summary: PublicationSummary,
  detail?: PublicationDetail,
): NexusPublicationView {
  const type = publicationTypes[summary.workType];
  const quartileApplies = type === "Artikel Jurnal";
  const missing = missingFields(summary, type);
  const doi = summary.doi?.trim() || undefined;

  return {
    authors: (detail?.authors ?? [])
      .toSorted((first, second) => first.authorOrder - second.authorOrder)
      .map((author) => ({
        id: `${summary.publicId}-${author.authorOrder}`,
        initials: personInitials(author.authorNameRaw),
        memberId: author.memberPublicId ?? undefined,
        name: author.authorNameRaw,
      })),
    citations: summary.citationCount,
    doi,
    evaluationPeriod: "",
    id: summary.publicId,
    identifier: detail?.issnL ?? undefined,
    kmLinks: kmLinks(summary.kmIndicators),
    missingFields: missing,
    provenance: [],
    publicId: summary.publicId,
    publisherUrl: doi ? `https://doi.org/${doi}` : undefined,
    quality: missing.length > 0 ? "Perlu dilengkapi" : "Lengkap",
    quartile: quartileApplies ? (summary.quartile ?? undefined) : undefined,
    quartileApplies,
    recordedAt: formatAuditTimestamp(summary.createdAt),
    sourceReportedQuartile: summary.quartile ?? undefined,
    title: summary.title,
    type,
    updatedAt: "",
    venue: summary.venue?.trim() ?? "",
    year: summary.year,
  };
}

export type NexusLoadState = "error" | "loading" | "ready";

/** Katalog publikasi resmi dari server; filter anggota diterapkan oleh server. */
export function useNexusPublicationCatalog(memberPublicId?: string) {
  const [records, setRecords] = useState<NexusPublicationView[]>([]);
  const [state, setState] = useState<NexusLoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loadedAt, setLoadedAt] = useState<Date>();
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    listAllPublications({ memberPublicId })
      .then((publications) => {
        if (request !== latestRequest.current) return;
        setRecords(
          publications.map((publication) =>
            nexusPublicationFromServer(publication),
          ),
        );
        setLoadedAt(new Date());
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(
          apiErrorMessage(error, "Publikasi resmi belum dapat dimuat."),
        );
        setState("error");
      });
  }, [memberPublicId]);

  useEffect(() => {
    load();
    return () => {
      latestRequest.current += 1;
    };
  }, [load]);

  return { errorMessage, loadedAt, records, retry: load, state };
}

/** Rincian satu publikasi (termasuk penulis), disimpan selama halaman terbuka. */
export function useNexusPublicationDetail(publicId: string | null) {
  const cache = useRef(new Map<string, NexusPublicationView>());
  const latestRequest = useRef(0);
  const [detail, setDetail] = useState<{
    errorMessage?: string;
    notFound?: boolean;
    record?: NexusPublicationView;
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
    getPublication(id)
      .then((publication) => {
        if (request !== latestRequest.current) return;
        const record = nexusPublicationFromServer(publication, publication);
        cache.current.set(id, record);
        setDetail({ record, state: "ready" });
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setDetail({
          errorMessage: apiErrorMessage(
            error,
            "Rincian publikasi belum dapat dimuat.",
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

/** Nama anggota untuk filter anggota aktif, bila akun boleh membaca direktori. */
export function useNexusMemberName(
  memberPublicId: string | undefined,
  canReadMembers: boolean,
) {
  const [name, setName] = useState<string>();

  useEffect(() => {
    setName(undefined);
    if (!memberPublicId || !canReadMembers) return;
    let cancelled = false;
    getMember(memberPublicId)
      .then((member) => {
        if (!cancelled) setName(member.name);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [canReadMembers, memberPublicId]);

  return name;
}
