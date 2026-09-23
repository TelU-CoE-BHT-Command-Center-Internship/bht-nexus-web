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
  input: NexusMonitoringInput;
  /** `false` ketika periode pada alamat belum terdaftar. */
  isKnownPeriod: boolean;
  period: NexusMonitoringPeriod;
  periodOptions: readonly NexusMonitoringPeriod[];
};

/**
 * Masukan pengukuran Monitoring untuk satu periode: rekam resmi sesi berjalan,
 * target versi terbaru periode itu, dan daftar periode terdaftar. Seluruh
 * halaman Monitoring membaca hook ini sehingga angkanya selalu sama.
 */
export function useNexusMonitoringData(
  requestedPeriodId: string = NEXUS_DEFAULT_MONITORING_PERIOD_ID,
): NexusMonitoringData {
  const officialRecords = useNexusOfficialRecords();
  const { periods, targetVersions } = useNexusMonitoringSession();
  const records = useMemo(
    () => nexusMonitoringRecordsFrom(officialRecords),
    [officialRecords],
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
    input,
    isKnownPeriod: Boolean(knownPeriod),
    period,
    periodOptions,
  };
}
