"use client";

import { useMemo } from "react";
import {
  getNexusOfficialBaseRecords,
  type NexusOfficialRecordSessionState,
  type NexusOfficialRecordSet,
  projectNexusOfficialRecordSet,
} from "@/components/nexus-official-records/nexus-official-records";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";

const baseRecords = getNexusOfficialBaseRecords();

/** Perubahan sesi yang berlaku pada rekam resmi seluruh rumah data. */
export function useNexusOfficialRecordSession(): NexusOfficialRecordSessionState {
  const {
    officialMetadataByRecordId,
    officialRecordCorrections,
    officialRecordDecisions,
  } = useNexusReviewSession();

  return useMemo(
    () => ({
      officialMetadataByRecordId,
      officialRecordCorrections,
      officialRecordDecisions,
    }),
    [
      officialMetadataByRecordId,
      officialRecordCorrections,
      officialRecordDecisions,
    ],
  );
}

/**
 * Rekam resmi kelima rumah data sebagaimana berlaku pada sesi ini. Monitoring
 * membaca hook ini sehingga persetujuan Tinjauan, pelengkapan metadata, dan
 * koreksi langsung ikut membentuk angka realisasi.
 */
export function useNexusOfficialRecords(): NexusOfficialRecordSet {
  const session = useNexusOfficialRecordSession();
  return useMemo(
    () => projectNexusOfficialRecordSet(baseRecords, session),
    [session],
  );
}
