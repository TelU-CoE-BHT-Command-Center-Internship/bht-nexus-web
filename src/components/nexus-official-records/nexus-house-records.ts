"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiErrorKind, apiErrorMessage } from "@/lib/api-client";
import {
  type AcademicDetail,
  type AcademicSummary,
  type ContractProposalDetail,
  type ContractProposalSummary,
  getHouseRecord,
  type IntellectualPropertyDetail,
  type IntellectualPropertySummary,
  listAllHouseRecords,
  type OfficialHouse,
} from "@/lib/api-house-records";
import { useLoadEffect } from "@/lib/use-load-effect";

export type NexusLoadState = "error" | "loading" | "ready";

type HouseRecordShapes = {
  academics: { detail: AcademicDetail; summary: AcademicSummary };
  "contracts-proposals": {
    detail: ContractProposalDetail;
    summary: ContractProposalSummary;
  };
  "intellectual-properties": {
    detail: IntellectualPropertyDetail;
    summary: IntellectualPropertySummary;
  };
};

/**
 * Katalog satu rumah data dari server. Dibaca saat halaman dibuka dan setiap
 * kali filter anggotanya berganti; filter anggota diterapkan server.
 */
export function useNexusHouseCatalog<House extends OfficialHouse, View>(
  house: House,
  toView: (summary: HouseRecordShapes[House]["summary"]) => View,
  errorFallback: string,
  memberPublicId?: string,
) {
  const [records, setRecords] = useState<View[]>([]);
  const [state, setState] = useState<NexusLoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loadedAt, setLoadedAt] = useState<Date>();
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    listAllHouseRecords(house, { memberPublicId })
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
  }, [errorFallback, house, memberPublicId, toView]);

  useLoadEffect(load);

  return { errorMessage, loadedAt, records, retry: load, state };
}

/** Rincian satu rekam beserta pihak yang terlibat. */
export function useNexusHouseDetail<House extends OfficialHouse, View>(
  house: House,
  publicId: string | null,
  toView: (detail: HouseRecordShapes[House]["detail"]) => View,
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
        .then((record) => {
          if (request !== latestRequest.current) return;
          const view = toView(record);
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
