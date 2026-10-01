export const WORKER_UNAVAILABLE_CODE = "WORKER_UNAVAILABLE";
export const WORKER_UNAVAILABLE_EVENT = "nexus:worker-unavailable";

export type NexusWorkerName = "rag" | "scraper";

const workerLabels: Record<NexusWorkerName, string> = {
  rag: "RAG",
  scraper: "Scraper",
};

export function workerUnavailableMessage(worker: NexusWorkerName) {
  return `${workerLabels[worker]} Worker sedang tidak Aktif`;
}

/** Memberi tahu pemberitahuan global bahwa server menolak panggilan karena worker nonaktif. */
export function announceWorkerUnavailable(errors: unknown) {
  if (typeof window === "undefined") return;
  const worker =
    typeof errors === "object" && errors !== null
      ? (errors as { worker?: unknown }).worker
      : undefined;
  if (worker !== "rag" && worker !== "scraper") return;
  window.dispatchEvent(
    new CustomEvent<NexusWorkerName>(WORKER_UNAVAILABLE_EVENT, {
      detail: worker,
    }),
  );
}
