"use client";

import { useMemo } from "react";
import type { NexusMonitoringInput } from "@/components/nexus-monitoring/nexus-monitoring-measurement";
import {
  NEXUS_DEFAULT_MONITORING_PERIOD_ID,
  type NexusMonitoringPeriod,
  nexusMonitoringPeriodFromRecord,
  nexusMonitoringPeriodOptions,
} from "@/components/nexus-monitoring/nexus-monitoring-period";
import { useNexusMonitoringSession } from "@/components/nexus-monitoring/nexus-monitoring-session";
import { nexusMonitoringRecordsFrom } from "@/components/nexus-monitoring/nexus-monitoring-sources";
import { nexusTargetLookup } from "@/components/nexus-monitoring/nexus-monitoring-targets";
import { useNexusOfficialRecords } from "@/components/nexus-official-records/nexus-official-records-hooks";

export type NexusMonitoringData = {
  /** Pesan kegagalan pemuatan rekam resmi dari server. */
  errorMessage?: string;
  input: NexusMonitoringInput;
  /** `false` ketika periode pada alamat belum terdaftar. */
  isKnownPeriod: boolean;
  /** Keadaan pemuatan rekam resmi; angka baru bermakna setelah `ready`. */
  loadState: "error" | "loading" | "ready";
  period: NexusMonitoringPeriod;
  periodOptions: readonly NexusMonitoringPeriod[];
  /** Membaca ulang rekam resmi tanpa keadaan memuat, misalnya setelah koreksi. */
  refresh: () => Promise<void>;
  retry: () => void;
};

/**
 * Masukan pengukuran Monitoring untuk satu periode: rekam resmi dari server,
 * target versi terbaru periode itu, dan daftar periode terdaftar. Seluruh
 * halaman Monitoring membaca hook ini sehingga angkanya selalu sama.
 */
export function useNexusMonitoringData(
  requestedPeriodId: string = NEXUS_DEFAULT_MONITORING_PERIOD_ID,
): NexusMonitoringData {
  const official = useNexusOfficialRecords();
  const targetsSession = useNexusMonitoringSession();
  const { periods, targetVersions } = targetsSession;
  const records = useMemo(
    () => nexusMonitoringRecordsFrom(official.records),
    [official.records],
  );
  const periodOptions = useMemo(
    () => nexusMonitoringPeriodOptions(periods),
    [periods],
  );
  const knownPeriod = periods.find((item) => item.id === requestedPeriodId);
  const period = knownPeriod
    ? nexusMonitoringPeriodFromRecord(knownPeriod)
    : nexusMonitoringPeriodFromRecord({
        id: requestedPeriodId,
        year: Number(requestedPeriodId) || 0,
      });
  const targets = useMemo(
    () => nexusTargetLookup(targetVersions, requestedPeriodId),
    [requestedPeriodId, targetVersions],
  );
  const input = useMemo(
    () => ({ period: requestedPeriodId, records, targets }),
    [records, requestedPeriodId, targets],
  );

  return {
    errorMessage: targetsSession.errorMessage ?? official.errorMessage,
    input,
    isKnownPeriod: Boolean(knownPeriod),
    loadState:
      official.state === "error" || targetsSession.state === "error"
        ? "error"
        : official.state === "loading" || targetsSession.state === "loading"
          ? "loading"
          : "ready",
    period,
    periodOptions,
    refresh: official.refresh,
    retry: () => {
      official.retry();
      targetsSession.retry();
    },
  };
}
