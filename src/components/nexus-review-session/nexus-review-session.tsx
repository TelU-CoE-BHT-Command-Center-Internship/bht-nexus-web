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
  AuditMatchingStatus,
  AuditOfficialMatch,
  AuditReviewDecision,
  AuditReviewHistory,
  AuditReviewRecord,
  AuditReviewStatus,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import type {
  MetadataCompletionProposal,
  MetadataCompletionResolutions,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import type {
  OfficialMetadataProjection,
  OfficialMetadataProjectionMap,
  OfficialRecordDecisionProjection,
  OfficialRecordDecisionProjectionMap,
} from "@/components/nexus-review-session/nexus-official-record-projection";

export type NexusReviewActor = {
  id: string;
  name: string;
  roleLabel: string;
};

export type NexusReviewCapabilities = {
  canReview: boolean;
  canSubmitCorrection: boolean;
};

export type NexusRecordCapabilities = NexusReviewCapabilities & {
  canApprove: boolean;
  canReject: boolean;
  canRequestChanges: boolean;
  reviewBlockReason?: "not_authorized" | "self_submitted" | "unknown_submitter";
};

export type AuditCorrection = {
  after: Record<string, string>;
  before: Record<string, string>;
  evidenceNote: string;
  fieldIds: string[];
  resolutions?: MetadataCompletionResolutions;
  version: number;
};

export type AuditRuntimeState = {
  correction?: AuditCorrection;
  decision?: AuditReviewDecision;
  fixRequest?: AuditFixRequest;
  history: AuditReviewHistory[];
  latestSubmittedBy: string;
  latestSubmittedByActorId?: string;
  matches: AuditOfficialMatch[];
  matchingStatus: AuditMatchingStatus;
  matchingVersion?: number;
  reviewTargetRecordId?: string;
  status: AuditReviewStatus;
  version: number;
};

type NexusReviewSessionValue = {
  actor: NexusReviewActor;
  capabilities: NexusReviewCapabilities;
  capabilitiesFor: (
    record: AuditReviewRecord,
    state: AuditRuntimeState,
  ) => NexusRecordCapabilities;
  applyOfficialMetadataCompletion: (
    recordId: string,
    projection: OfficialMetadataProjection,
  ) => void;
  applyOfficialRecordDecision: (
    projection: OfficialRecordDecisionProjection,
  ) => void;
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
  officialMetadataByRecordId: OfficialMetadataProjectionMap;
  officialRecordDecisions: OfficialRecordDecisionProjectionMap;
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
    latestSubmittedBy: record.submittedBy,
    latestSubmittedByActorId: record.submittedByActorId,
    matches: record.matches,
    matchingStatus:
      record.matchingStatus ??
      (record.candidateKind === "metadata_completion"
        ? "not_required"
        : "current"),
    matchingVersion:
      record.matchingVersion ??
      (record.candidateKind === "metadata_completion"
        ? undefined
        : record.version),
    reviewTargetRecordId: record.decision?.targetRecordId,
    status: record.status,
    version: record.version,
  };
}

/**
 * Hasil pencocokan hanya sah bila dibuat untuk versi kandidat yang sedang
 * ditinjau. `not_required` dipakai pada pelengkapan rekam yang targetnya sudah
 * ditentukan sejak usulan dibuat.
 */
export function auditMatchingIsCurrent(state: AuditRuntimeState) {
  return (
    state.matchingStatus === "not_required" ||
    (state.matchingStatus === "current" &&
      state.matchingVersion === state.version)
  );
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
  const [officialMetadataByRecordId, setOfficialMetadataByRecordId] =
    useState<OfficialMetadataProjectionMap>({});
  const [officialRecordDecisions, setOfficialRecordDecisions] =
    useState<OfficialRecordDecisionProjectionMap>({});
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
        submittedAt: new Date().toISOString(),
        submittedBy: actor.name,
        submittedByActorId: actor.id,
      };

      setCompletionProposals((current) => ({
        ...current,
        [recordId]: proposal,
      }));
      return proposal;
    },
    [actor.id, actor.name, createSessionRecordId],
  );
  const clearCompletionProposal = useCallback((recordId: string) => {
    setCompletionProposals((current) => {
      if (!current[recordId]) return current;
      const next = { ...current };
      delete next[recordId];
      return next;
    });
  }, []);
  const applyOfficialMetadataCompletion = useCallback(
    (recordId: string, projection: OfficialMetadataProjection) => {
      setOfficialMetadataByRecordId((current) => ({
        ...current,
        [recordId]: projection,
      }));
    },
    [],
  );
  const applyOfficialRecordDecision = useCallback(
    (projection: OfficialRecordDecisionProjection) => {
      setOfficialRecordDecisions((current) => ({
        ...current,
        [projection.candidate.id]: projection,
      }));
    },
    [],
  );
  const capabilitiesFor = useCallback(
    (
      _record: AuditReviewRecord,
      state: AuditRuntimeState,
    ): NexusRecordCapabilities => {
      const hasKnownSubmitter = Boolean(state.latestSubmittedByActorId);
      const submittedByCurrentActor =
        state.latestSubmittedByActorId === actor.id;
      const canReview =
        capabilities.canReview &&
        state.status === "waiting" &&
        hasKnownSubmitter &&
        !submittedByCurrentActor;

      return {
        canApprove: canReview,
        canReject: canReview,
        canRequestChanges: canReview,
        canReview,
        canSubmitCorrection:
          capabilities.canSubmitCorrection &&
          state.status === "needs_fix" &&
          Boolean(state.fixRequest?.assigneeActorId) &&
          state.fixRequest?.assigneeActorId === actor.id,
        reviewBlockReason: !hasKnownSubmitter
          ? "unknown_submitter"
          : submittedByCurrentActor
            ? "self_submitted"
            : !capabilities.canReview
              ? "not_authorized"
              : undefined,
      };
    },
    [actor.id, capabilities.canReview, capabilities.canSubmitCorrection],
  );
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
      applyOfficialMetadataCompletion,
      applyOfficialRecordDecision,
      capabilities,
      capabilitiesFor,
      clearCompletionProposal,
      completionProposals,
      createCompletionProposal,
      createSessionRecordId,
      records,
      officialMetadataByRecordId,
      officialRecordDecisions,
      runtimeByRecordId,
      submitRecord,
      submitRecords,
      updateRecordRuntime,
    }),
    [
      actor,
      applyOfficialMetadataCompletion,
      applyOfficialRecordDecision,
      capabilities,
      capabilitiesFor,
      clearCompletionProposal,
      completionProposals,
      createCompletionProposal,
      createSessionRecordId,
      records,
      officialMetadataByRecordId,
      officialRecordDecisions,
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
