import type {
  NexusIndicatorTargetVersion,
  NexusMonitoringPeriodRecord,
} from "@/components/nexus-monitoring/nexus-monitoring-targets";
import { apiFetch } from "@/lib/api-client";
export type NexusTargetState = {
  periods: NexusMonitoringPeriodRecord[];
  targetVersions: NexusIndicatorTargetVersion[];
};
export function readKpiTargets(divisionPublicId?: string) {
  const query = divisionPublicId
    ? `?divisionPublicId=${encodeURIComponent(divisionPublicId)}`
    : "";
  return apiFetch<NexusTargetState>(`/kpi/targets${query}`);
}
export function saveKpiTargets(body: {
  year: number;
  divisionPublicId?: string;
  reason: string;
  changes: {
    code: string;
    value: number | null;
    literal: string | null;
    expectedVersion: number;
  }[];
}) {
  return apiFetch<NexusTargetState & { changedCount: number }>("/kpi/targets", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
export function createKpiPeriod(body: {
  year: number;
  divisionPublicId?: string;
  copyFromYear?: number;
  reason: string;
}) {
  return apiFetch<NexusTargetState>("/kpi/periods", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
