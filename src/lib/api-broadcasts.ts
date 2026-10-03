import type { BroadcastDocument } from "@/components/nexus-broadcast/nexus-broadcast-content";
import type { BroadcastRecipientSummary } from "@/components/nexus-broadcast/nexus-broadcast-model";
import { apiFetch } from "@/lib/api-client";

export type BroadcastImage = {
  imageId: string;
  url: string;
  name: string;
  width: number;
  height: number;
};
export type BroadcastDeliveryConfiguration = {
  sender: string;
  configured: boolean;
  mode: "capture" | "provider";
};
export type BroadcastRecipients = BroadcastRecipientSummary & {
  recipientHash: string;
  delivery: BroadcastDeliveryConfiguration;
};
export type BroadcastSummary = {
  requestedRecipientCount: number;
  acceptedCount: number;
  failedCount: number;
  unconfirmedCount: number;
  pendingCount: number;
};
export type SavedBroadcast = {
  publicId: string;
  subject: string;
  document: BroadcastDocument;
  images: BroadcastImage[];
  markdown: string;
  version: number;
  status: "draft" | "sending" | "accepted" | "partial" | "failed";
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
};
export type BroadcastHistory = SavedBroadcast & {
  createdByName: string;
  summary: BroadcastSummary;
  deliveryMode: "capture" | "provider" | null;
};
export type BroadcastDetail = SavedBroadcast & {
  summary: BroadcastSummary;
  deliveries: {
    publicId: string;
    email: string;
    kind: "broadcast" | "test";
    status: "pending" | "sending" | "accepted" | "failed" | "unknown";
    deliveryMode: "capture" | "provider";
    sender: string;
    failureCode: string | null;
    providerEmailId: string | null;
    messageVersion: number;
    subject: string;
    requestedAt: string;
    acceptedAt: string | null;
  }[];
};
export type BroadcastDraftInput = Pick<
  SavedBroadcast,
  "subject" | "document" | "images"
>;

export function getBroadcastRecipients() {
  return apiFetch<BroadcastRecipients>("/broadcasts/recipients");
}
export function listBroadcasts() {
  return apiFetch<BroadcastHistory[]>("/broadcasts");
}
export function getBroadcast(publicId: string) {
  return apiFetch<BroadcastDetail>(`/broadcasts/${publicId}`);
}
export function createBroadcast(body: BroadcastDraftInput) {
  return apiFetch<SavedBroadcast>("/broadcasts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
export function updateBroadcast(
  publicId: string,
  body: BroadcastDraftInput & { expectedVersion: number },
) {
  return apiFetch<SavedBroadcast>(`/broadcasts/${publicId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
export function sendBroadcast(
  publicId: string,
  expectedVersion: number,
  recipientHash: string,
) {
  return apiFetch<BroadcastDetail>(`/broadcasts/${publicId}/send`, {
    method: "POST",
    body: JSON.stringify({ expectedVersion, recipientHash }),
  });
}
export function testBroadcast(
  publicId: string,
  expectedVersion: number,
  requestId: string,
  emails: string[],
) {
  return apiFetch<BroadcastSummary>(`/broadcasts/${publicId}/test`, {
    method: "POST",
    body: JSON.stringify({ expectedVersion, requestId, emails }),
  });
}
export function retryBroadcast(publicId: string, expectedVersion: number) {
  return apiFetch<BroadcastDetail>(`/broadcasts/${publicId}/retry`, {
    method: "POST",
    body: JSON.stringify({ expectedVersion }),
  });
}
export function uploadBroadcastImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  return apiFetch<{ publicId: string; url: string }>("/broadcasts/images", {
    method: "POST",
    body,
  });
}
