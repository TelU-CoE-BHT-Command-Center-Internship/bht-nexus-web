"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  NexusIndicatorTargetVersion,
  NexusMonitoringPeriodRecord,
} from "@/components/nexus-monitoring/nexus-monitoring-targets";
import { nexusCurrentTargetVersion } from "@/components/nexus-monitoring/nexus-monitoring-targets";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import type { NexusKmIndicatorId } from "@/content/nexus-km-indicators";

export type NexusTargetChange = {
  indicatorId: NexusKmIndicatorId;
  value: number;
};

type NexusMonitoringSessionValue = {
  /**
   * Mendaftarkan periode baru. Target periode terakhir dapat disalin sebagai
   * versi awal sehingga pengelola hanya menyesuaikan target yang berubah.
   */
  addPeriod: (input: {
    copyFromPeriodId?: string;
    reason: string;
    year: number;
  }) => NexusMonitoringPeriodRecord;
  periods: readonly NexusMonitoringPeriodRecord[];
  /** Menyimpan target baru sebagai versi berikutnya; versi lama tetap ada. */
  saveTargets: (input: {
    changes: readonly NexusTargetChange[];
    periodId: string;
    reason: string;
  }) => number;
  targetVersions: readonly NexusIndicatorTargetVersion[];
};

const NexusMonitoringSessionContext =
  createContext<NexusMonitoringSessionValue | null>(null);

/**
 * Periode dan target Monitoring KM selama sesi ruang kerja. Provider berada
 * pada layout ruang kerja supaya target yang baru diubah tetap berlaku ketika
 * pengguna berpindah ke Tinjauan atau Data Resmi lalu kembali.
 */
export function NexusMonitoringSessionProvider({
  children,
  initialPeriods,
  initialTargetVersions,
}: {
  children: ReactNode;
  initialPeriods: readonly NexusMonitoringPeriodRecord[];
  initialTargetVersions: readonly NexusIndicatorTargetVersion[];
}) {
  const { actor } = useNexusReviewSession();
  const [periods, setPeriods] = useState(initialPeriods);
  const [targetVersions, setTargetVersions] = useState(initialTargetVersions);

  const saveTargets = useCallback<NexusMonitoringSessionValue["saveTargets"]>(
    ({ changes, periodId, reason }) => {
      const recordedAt = new Date().toISOString();
      const additions = changes.flatMap((change) => {
        const previous = nexusCurrentTargetVersion(
          targetVersions,
          periodId,
          change.indicatorId,
        );
        if (previous?.value === change.value && previous.literal === null) {
          return [];
        }
        const version = (previous?.version ?? 0) + 1;
        return [
          {
            actorName: actor.name,
            actorRoleLabel: actor.roleLabel,
            id: `TGT-${periodId}-${change.indicatorId}-${version}`,
            indicatorId: change.indicatorId,
            literal: null,
            origin: "manual" as const,
            periodId,
            reason,
            recordedAt,
            value: change.value,
            version,
          },
        ];
      });
      if (additions.length > 0) {
        setTargetVersions((current) => [...current, ...additions]);
      }
      return additions.length;
    },
    [actor.name, actor.roleLabel, targetVersions],
  );

  const addPeriod = useCallback<NexusMonitoringSessionValue["addPeriod"]>(
    ({ copyFromPeriodId, reason, year }) => {
      const recordedAt = new Date().toISOString();
      const period: NexusMonitoringPeriodRecord = {
        copiedFromPeriodId: copyFromPeriodId,
        createdAt: recordedAt,
        createdBy: actor.name,
        id: String(year),
        origin: "added",
        year,
      };
      if (periods.some((item) => item.id === period.id)) return period;

      const sourceIds = copyFromPeriodId
        ? new Set(
            targetVersions
              .filter((version) => version.periodId === copyFromPeriodId)
              .map((version) => version.indicatorId),
          )
        : new Set<NexusKmIndicatorId>();
      const copies = [...sourceIds].flatMap((indicatorId) => {
        const source = copyFromPeriodId
          ? nexusCurrentTargetVersion(
              targetVersions,
              copyFromPeriodId,
              indicatorId,
            )
          : undefined;
        if (!source) return [];
        return [
          {
            actorName: actor.name,
            actorRoleLabel: actor.roleLabel,
            id: `TGT-${period.id}-${indicatorId}-1`,
            indicatorId,
            literal: source.literal,
            origin: "copied" as const,
            periodId: period.id,
            reason: `Disalin dari periode ${copyFromPeriodId}. ${reason}`,
            recordedAt,
            value: source.value,
            version: 1,
          },
        ];
      });

      setPeriods((current) => [...current, period]);
      if (copies.length > 0) {
        setTargetVersions((current) => [...current, ...copies]);
      }
      return period;
    },
    [actor.name, actor.roleLabel, periods, targetVersions],
  );

  const value = useMemo(
    () => ({ addPeriod, periods, saveTargets, targetVersions }),
    [addPeriod, periods, saveTargets, targetVersions],
  );

  return (
    <NexusMonitoringSessionContext.Provider value={value}>
      {children}
    </NexusMonitoringSessionContext.Provider>
  );
}

export function useNexusMonitoringSession() {
  const session = useContext(NexusMonitoringSessionContext);
  if (!session) {
    throw new Error(
      "useNexusMonitoringSession must be used inside NexusMonitoringSessionProvider",
    );
  }
  return session;
}
