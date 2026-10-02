"use client";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNexusClusterScope } from "@/components/nexus-cluster-scope/nexus-cluster-scope";
import type {
  NexusIndicatorTargetVersion,
  NexusMonitoringPeriodRecord,
} from "@/components/nexus-monitoring/nexus-monitoring-targets";
import { nexusCurrentTargetVersion } from "@/components/nexus-monitoring/nexus-monitoring-targets";
import type { NexusKmIndicatorId } from "@/content/nexus-km-indicators";
import { apiErrorMessage } from "@/lib/api-client";
import {
  createKpiPeriod,
  type NexusTargetState,
  readKpiTargets,
  saveKpiTargets,
} from "@/lib/api-kpi-targets";
import { useLoadEffect } from "@/lib/use-load-effect";
export type NexusTargetChange = {
  indicatorId: NexusKmIndicatorId;
  literal: string | null;
  value: number | null;
};
type NexusMonitoringSessionValue = {
  addPeriod: (input: {
    copyFromPeriodId?: string;
    reason: string;
    year: number;
  }) => Promise<NexusMonitoringPeriodRecord>;
  periods: readonly NexusMonitoringPeriodRecord[];
  saveTargets: (input: {
    changes: readonly NexusTargetChange[];
    periodId: string;
    reason: string;
  }) => Promise<number>;
  targetVersions: readonly NexusIndicatorTargetVersion[];
  state: "error" | "loading" | "ready";
  errorMessage?: string;
  retry: () => void;
};
const NexusMonitoringSessionContext =
  createContext<NexusMonitoringSessionValue | null>(null);
export function NexusMonitoringSessionProvider({
  children,
  canReadTargets,
}: {
  children: ReactNode;
  canReadTargets: boolean;
}) {
  const { divisionPublicId } = useNexusClusterScope();
  const [data, setData] = useState<NexusTargetState>({
    periods: [],
    targetVersions: [],
  });
  const [state, setState] = useState<"error" | "loading" | "ready">(
    canReadTargets ? "loading" : "ready",
  );
  const [errorMessage, setErrorMessage] = useState<string>();
  const latestRequest = useRef(0);
  const load = useCallback(() => {
    if (!canReadTargets) return;
    const request = ++latestRequest.current;
    setState("loading");
    setErrorMessage(undefined);
    readKpiTargets(divisionPublicId)
      .then((result) => {
        if (request !== latestRequest.current) return;
        setData(result);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(
          apiErrorMessage(error, "Periode dan target belum dapat dimuat."),
        );
        setState("error");
      });
  }, [canReadTargets, divisionPublicId]);
  useLoadEffect(load);
  const saveTargets = useCallback<NexusMonitoringSessionValue["saveTargets"]>(
    async ({ changes, periodId, reason }) => {
      const response = await saveKpiTargets({
        year: Number(periodId),
        divisionPublicId,
        reason,
        changes: changes.map((change) => ({
          code: change.indicatorId,
          value: change.value,
          literal: change.literal,
          expectedVersion:
            nexusCurrentTargetVersion(
              data.targetVersions,
              periodId,
              change.indicatorId,
            )?.version ?? 0,
        })),
      });
      ++latestRequest.current;
      setData(response);
      setState("ready");
      setErrorMessage(undefined);
      return response.changedCount;
    },
    [data.targetVersions, divisionPublicId],
  );
  const addPeriod = useCallback<NexusMonitoringSessionValue["addPeriod"]>(
    async ({ copyFromPeriodId, reason, year }) => {
      const response = await createKpiPeriod({
        year,
        divisionPublicId,
        reason,
        ...(copyFromPeriodId ? { copyFromYear: Number(copyFromPeriodId) } : {}),
      });
      const period = response.periods.find((item) => item.year === year);
      if (!period)
        throw new Error("Periode baru belum tersedia pada respons server.");
      ++latestRequest.current;
      setData(response);
      setState("ready");
      setErrorMessage(undefined);
      return period;
    },
    [divisionPublicId],
  );
  const value = useMemo(
    () => ({
      addPeriod,
      periods: data.periods,
      saveTargets,
      targetVersions: data.targetVersions,
      state,
      errorMessage,
      retry: load,
    }),
    [addPeriod, data, saveTargets, state, errorMessage, load],
  );
  return (
    <NexusMonitoringSessionContext.Provider value={value}>
      {children}
    </NexusMonitoringSessionContext.Provider>
  );
}
export function useNexusMonitoringSession() {
  const session = useContext(NexusMonitoringSessionContext);
  if (!session)
    throw new Error(
      "useNexusMonitoringSession must be used inside NexusMonitoringSessionProvider",
    );
  return session;
}
