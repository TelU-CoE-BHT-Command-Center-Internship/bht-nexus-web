"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActivityDetail, ActivitySummary } from "@/lib/api-activities";
import {
  type ActivityHouse,
  getHouseRecord,
  listAllHouseRecords,
} from "@/lib/api-activity-houses";
import { apiErrorKind, apiErrorMessage } from "@/lib/api-client";
import { resolveMemberNames } from "@/lib/member-names";
import { useLoadEffect } from "@/lib/use-load-effect";

export type NexusLoadState = "error" | "loading" | "ready";

/** Katalog satu rumah data dari server, dibaca sekali saat halaman dibuka. */
export function useNexusHouseCatalog<View>(
  house: ActivityHouse,
  toView: (summary: ActivitySummary) => View,
  errorFallback: string,
) {
  const [records, setRecords] = useState<View[]>([]);
  const [state, setState] = useState<NexusLoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loadedAt, setLoadedAt] = useState<Date>();
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    listAllHouseRecords(house)
      .then((summaries) => {
        if (request !== latestRequest.current) return;
        setRecords(summaries.map(toView));
        setLoadedAt(new Date());
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(apiErrorMessage(error, errorFallback));
        setState("error");
      });
  }, [errorFallback, house, toView]);

  useLoadEffect(load);

  return { errorMessage, loadedAt, records, retry: load, state };
}

/** Rincian satu rekam beserta nama anggota yang terlibat. */
export function useNexusHouseDetail<View>(
  house: ActivityHouse,
  publicId: string | null,
  toView: (detail: ActivityDetail, names: ReadonlyMap<string, string>) => View,
  errorFallback: string,
) {
  const cache = useRef(new Map<string, View>());
  const latestRequest = useRef(0);
  const [detail, setDetail] = useState<{
    errorMessage?: string;
    notFound?: boolean;
    record?: View;
    state: NexusLoadState | "idle";
  }>({ state: "idle" });

  const load = useCallback(
    (id: string | null) => {
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
      getHouseRecord(house, id)
        .then(async (record) => {
          const names = await resolveMemberNames(
            record.participants.flatMap((participant) =>
              participant.memberPublicId ? [participant.memberPublicId] : [],
            ),
          );
          if (request !== latestRequest.current) return;
          const view = toView(record, names);
          cache.current.set(id, view);
          setDetail({ record: view, state: "ready" });
        })
        .catch((error: unknown) => {
          if (request !== latestRequest.current) return;
          setDetail({
            errorMessage: apiErrorMessage(error, errorFallback),
            notFound: apiErrorKind(error) === "not-found",
            state: "error",
          });
        });
    },
    [errorFallback, house, toView],
  );

  useEffect(() => {
    load(publicId);
    return () => {
      latestRequest.current += 1;
    };
  }, [load, publicId]);

  const retry = useCallback(() => load(publicId), [load, publicId]);

  return { ...detail, retry };
}
