"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { nexusAcademicFromServer } from "@/components/nexus-academic/nexus-academic-server";
import { nexusActivityFromServer } from "@/components/nexus-activities/nexus-activity-server";
import { useNexusClusterScope } from "@/components/nexus-cluster-scope/nexus-cluster-scope";
import { nexusContractProposalFromServer } from "@/components/nexus-contract-proposals/nexus-contract-proposals-server";
import { nexusIntellectualPropertyFromServer } from "@/components/nexus-intellectual-property/nexus-intellectual-property-server";
import {
  type NexusOfficialRecordSessionState,
  type NexusOfficialRecordSet,
  projectNexusOfficialRecordSet,
} from "@/components/nexus-official-records/nexus-official-records";
import { belongsToActivityHouse } from "@/components/nexus-official-records/nexus-record-metadata";
import { nexusPublicationFromServer } from "@/components/nexus-publications/nexus-publication-server";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import { listAllActivities } from "@/lib/api-activities";
import { apiErrorMessage } from "@/lib/api-client";
import { listAllHouseRecords } from "@/lib/api-house-records";
import { listAllPublications } from "@/lib/api-publications";
import { useLoadEffect } from "@/lib/use-load-effect";

const CACHE_TTL_MS = 60_000;

let cached:
  | { at: number; key: string; records: NexusOfficialRecordSet }
  | undefined;

async function loadOfficialRecords(
  key: string,
  divisionPublicId?: string,
): Promise<NexusOfficialRecordSet> {
  if (cached?.key === key && Date.now() - cached.at < CACHE_TTL_MS)
    return cached.records;
  const [publications, activities, properties, contracts, academics] =
    await Promise.all([
      listAllPublications({ divisionPublicId }),
      listAllActivities({ divisionPublicId }),
      listAllHouseRecords("intellectual-properties", { divisionPublicId }),
      listAllHouseRecords("contracts-proposals", { divisionPublicId }),
      listAllHouseRecords("academics", { divisionPublicId }),
    ]);
  const records: NexusOfficialRecordSet = {
    academic: academics.map((record) => nexusAcademicFromServer(record)),
    activities: activities
      .filter((record) => !belongsToActivityHouse(record.metadata ?? {}))
      .map((record) => nexusActivityFromServer(record)),
    contracts: contracts.map((record) =>
      nexusContractProposalFromServer(record),
    ),
    intellectualProperty: properties.map((record) =>
      nexusIntellectualPropertyFromServer(record),
    ),
    publications: publications.map((record) =>
      nexusPublicationFromServer(record),
    ),
  };
  cached = { at: Date.now(), key, records };
  return records;
}

const emptyRecords: NexusOfficialRecordSet = {
  academic: [],
  activities: [],
  contracts: [],
  intellectualProperty: [],
  publications: [],
};

/** Perubahan sesi yang berlaku pada rekam resmi seluruh rumah data. */
export function useNexusOfficialRecordSession(): NexusOfficialRecordSessionState {
  const { officialRecordCorrections } = useNexusReviewSession();

  return useMemo(
    () => ({ officialRecordCorrections }),
    [officialRecordCorrections],
  );
}

/**
 * Rekam resmi kelima rumah data dari server beserta koreksi sesi. Monitoring
 * membaca hook ini sehingga angka realisasinya berasal dari rekam yang sama
 * dengan halaman Data Resmi.
 */
export function useNexusOfficialRecords() {
  const { divisionPublicId, scopeKey } = useNexusClusterScope();
  const { actor } = useNexusReviewSession();
  const cacheKey = `${actor.id}:${scopeKey}`;
  const session = useNexusOfficialRecordSession();
  const [base, setBase] = useState<NexusOfficialRecordSet>(() =>
    cached?.key === cacheKey ? cached.records : emptyRecords,
  );
  const [state, setState] = useState<"error" | "loading" | "ready">(
    cached?.key === cacheKey ? "ready" : "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>();
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    loadOfficialRecords(cacheKey, divisionPublicId)
      .then((records) => {
        if (request !== latestRequest.current) return;
        setBase(records);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(
          apiErrorMessage(error, "Rekam resmi belum dapat dimuat."),
        );
        setState("error");
      });
  }, [cacheKey, divisionPublicId]);

  useLoadEffect(load);

  const records = useMemo(
    () => projectNexusOfficialRecordSet(base, session),
    [base, session],
  );

  return { errorMessage, records, retry: load, state };
}
