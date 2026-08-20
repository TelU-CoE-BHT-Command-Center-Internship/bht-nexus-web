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
import type {
  AuditFixRequest,
  AuditReviewDecision,
  AuditReviewHistory,
  AuditReviewRecord,
  AuditReviewStatus,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import type {
  MetadataCompletionProposal,
  MetadataCompletionResolutions,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";

export type NexusReviewActor = {
  name: string;
  roleLabel: string;
};

export type NexusReviewCapabilities = {
  canReview: boolean;
  canSubmitCorrection: boolean;
};

export type AuditCorrection = {
  after: Record<string, string>;
  before: Record<string, string>;
  evidenceNote: string;
  fieldIds: string[];
  version: number;
};

export type AuditRuntimeState = {
  correction?: AuditCorrection;
  decision?: AuditReviewDecision;
  fixRequest?: AuditFixRequest;
  history: AuditReviewHistory[];
  status: AuditReviewStatus;
  version: number;
};

type NexusReviewSessionValue = {
  actor: NexusReviewActor;
  capabilities: NexusReviewCapabilities;
  clearCompletionProposal: (recordId: string) => void;
  completionProposals: Record<string, MetadataCompletionProposal>;
  createCompletionProposal: (
    idPrefix: string,
    recordId: string,
    resolutions: MetadataCompletionResolutions,
    note: string,
  ) => MetadataCompletionProposal;
  createSessionRecordId: (idPrefix: string) => string;
  records: AuditReviewRecord[];
  runtimeByRecordId: Record<string, AuditRuntimeState>;
  submitRecord: (record: AuditReviewRecord) => void;
  submitRecords: (records: AuditReviewRecord[]) => void;
  updateRecordRuntime: (
    record: AuditReviewRecord,
    update: (current: AuditRuntimeState) => AuditRuntimeState,
  ) => void;
};

const NexusReviewSessionContext = createContext<NexusReviewSessionValue | null>(
  null,
);

export function initialAuditRuntimeState(
  record: AuditReviewRecord,
): AuditRuntimeState {
  return {
    decision: record.decision,
    fixRequest: record.fixRequest,
    history: record.history,
    status: record.status,
    version: record.version,
  };
}

export function NexusReviewSessionProvider({
  actor,
  capabilities,
  children,
}: {
  actor: NexusReviewActor;
  capabilities: NexusReviewCapabilities;
  children: ReactNode;
}) {
  const [completionProposals, setCompletionProposals] = useState<
    Record<string, MetadataCompletionProposal>
  >({});
  const [records, setRecords] = useState<AuditReviewRecord[]>([]);
  const [runtimeByRecordId, setRuntimeByRecordId] = useState<
    Record<string, AuditRuntimeState>
  >({});
  const sequenceByPrefix = useRef<Record<string, number>>({});
  const createSessionRecordId = useCallback((idPrefix: string) => {
    const nextSequence = (sequenceByPrefix.current[idPrefix] ?? 0) + 1;
    sequenceByPrefix.current[idPrefix] = nextSequence;
    return `${idPrefix}-${String(nextSequence).padStart(5, "0")}`;
  }, []);
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
  const createCompletionProposal = useCallback(
    (
      idPrefix: string,
      recordId: string,
      resolutions: MetadataCompletionResolutions,
      note: string,
    ) => {
      const proposal: MetadataCompletionProposal = {
        id: createSessionRecordId(idPrefix),
        note,
        recordId,
        resolutions,
        status: "waiting-review",
        submittedAt: "Baru saja",
        submittedBy: actor.name,
      };

      setCompletionProposals((current) => ({
        ...current,
        [recordId]: proposal,
      }));
      return proposal;
    },
    [actor.name, createSessionRecordId],
  );
  const clearCompletionProposal = useCallback((recordId: string) => {
    setCompletionProposals((current) => {
      if (!current[recordId]) return current;
      const next = { ...current };
      delete next[recordId];
      return next;
    });
  }, []);
  const updateRecordRuntime = useCallback(
    (
      record: AuditReviewRecord,
      update: (current: AuditRuntimeState) => AuditRuntimeState,
    ) => {
      setRuntimeByRecordId((current) => ({
        ...current,
        [record.id]: update(
          current[record.id] ?? initialAuditRuntimeState(record),
        ),
      }));
    },
    [],
  );
  const value = useMemo(
    () => ({
      actor,
      capabilities,
      clearCompletionProposal,
      completionProposals,
      createCompletionProposal,
      createSessionRecordId,
      records,
      runtimeByRecordId,
      submitRecord,
      submitRecords,
      updateRecordRuntime,
    }),
    [
      actor,
      capabilities,
      clearCompletionProposal,
      completionProposals,
      createCompletionProposal,
      createSessionRecordId,
      records,
      runtimeByRecordId,
      submitRecord,
      submitRecords,
      updateRecordRuntime,
    ],
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
