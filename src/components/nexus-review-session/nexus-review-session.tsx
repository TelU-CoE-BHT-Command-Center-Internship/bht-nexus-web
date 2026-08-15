"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { AuditReviewRecord } from "@/components/nexus-audit-review/nexus-audit-review-content";

export type NexusReviewActor = {
  name: string;
  roleLabel: string;
};

export type NexusReviewCapabilities = {
  canReview: boolean;
  canSubmitCorrection: boolean;
};

type NexusReviewSessionValue = {
  actor: NexusReviewActor;
  capabilities: NexusReviewCapabilities;
  records: AuditReviewRecord[];
  submitRecord: (record: AuditReviewRecord) => void;
  submitRecords: (records: AuditReviewRecord[]) => void;
};

const NexusReviewSessionContext = createContext<NexusReviewSessionValue | null>(
  null,
);

export function NexusReviewSessionProvider({
  actor,
  capabilities,
  children,
}: {
  actor: NexusReviewActor;
  capabilities: NexusReviewCapabilities;
  children: ReactNode;
}) {
  const [records, setRecords] = useState<AuditReviewRecord[]>([]);
  const submitRecords = useCallback((incoming: AuditReviewRecord[]) => {
    const incomingIds = new Set(incoming.map((record) => record.id));
    setRecords((current) => [
      ...incoming,
      ...current.filter((item) => !incomingIds.has(item.id)),
    ]);
  }, []);
  const submitRecord = useCallback(
    (record: AuditReviewRecord) => submitRecords([record]),
    [submitRecords],
  );
  const value = useMemo(
    () => ({ actor, capabilities, records, submitRecord, submitRecords }),
    [actor, capabilities, records, submitRecord, submitRecords],
  );

  return (
    <NexusReviewSessionContext.Provider value={value}>
      {children}
    </NexusReviewSessionContext.Provider>
  );
}

export function useNexusReviewSession() {
  const session = useContext(NexusReviewSessionContext);

  if (!session) {
    throw new Error(
      "useNexusReviewSession must be used inside NexusReviewSessionProvider",
    );
  }

  return session;
}

export function useOptionalNexusReviewSession() {
  return useContext(NexusReviewSessionContext);
}
