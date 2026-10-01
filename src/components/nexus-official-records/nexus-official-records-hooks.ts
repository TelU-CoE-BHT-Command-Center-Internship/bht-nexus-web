"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { nexusAcademicFromServer } from "@/components/nexus-academic/nexus-academic-server";
import { nexusActivityFromServer } from "@/components/nexus-activities/nexus-activity-server";
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
import { listAllHouseRecords } from "@/lib/api-activity-houses";
import { apiErrorMessage } from "@/lib/api-client";
import { listAllPublications } from "@/lib/api-publications";
import { useLoadEffect } from "@/lib/use-load-effect";

const CACHE_TTL_MS = 60_000;

let cached: { at: number; records: NexusOfficialRecordSet } | undefined;

async function loadOfficialRecords(): Promise<NexusOfficialRecordSet> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.records;
  const [publications, activities, properties, contracts, academics] =
    await Promise.all([
      listAllPublications(),
      listAllActivities(),
      listAllHouseRecords("intellectual-properties"),
      listAllHouseRecords("contracts-proposals"),
      listAllHouseRecords("academics"),
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
  cached = { at: Date.now(), records };
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
  const session = useNexusOfficialRecordSession();
  const [base, setBase] = useState<NexusOfficialRecordSet>(emptyRecords);
  const [state, setState] = useState<"error" | "loading" | "ready">(
    cached ? "ready" : "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>();
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    loadOfficialRecords()
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
  }, []);

  useLoadEffect(load);

  const records = useMemo(
    () => projectNexusOfficialRecordSet(base, session),
    [base, session],
  );

  return { errorMessage, records, retry: load, state };
}
