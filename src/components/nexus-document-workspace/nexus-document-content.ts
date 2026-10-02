import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";

export type NexusDocumentCapability = "extraction" | "qa";

export type NexusDocumentProcessingAttempt = {
  attemptedAt: string;
  number: number;
  reason?: string;
  status: AutomationJobStatus;
};

export type NexusDocumentProcessingJob = {
  attempts: NexusDocumentProcessingAttempt[];
  correlationId: string;
  finishedAt?: string;
  id: string;
  requestedAt: string;
  requestedByActorId: string;
  status: AutomationJobStatus;
};

export type NexusDocumentRecord = {
  capabilities: NexusDocumentCapability[];
  fileLabel: string;
  id: string;
  ownerUnit: string;
  processingHistory: NexusDocumentProcessingJob[];
  processingJob: NexusDocumentProcessingJob;
  statusLabel: string;
  title: string;
  updatedAt: string;
  updatedLabel: string;
};

export function latestDocumentProcessingAttempt(document: NexusDocumentRecord) {
  return document.processingJob.attempts.at(-1);
}
