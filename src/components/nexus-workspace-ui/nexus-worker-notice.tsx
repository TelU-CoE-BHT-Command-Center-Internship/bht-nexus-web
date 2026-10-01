"use client";

import { useEffect, useState } from "react";
import styles from "@/components/nexus-workspace-ui/nexus-worker-notice.module.css";
import {
  type NexusWorkerName,
  WORKER_UNAVAILABLE_EVENT,
  workerUnavailableMessage,
} from "@/lib/worker-unavailable";

const VISIBLE_MS = 6000;

/** Pemberitahuan singkat di kanan atas ketika RAG atau Scraper dipanggil saat worker nonaktif. */
export function NexusWorkerNotice() {
  const [notice, setNotice] = useState<{
    id: number;
    worker: NexusWorkerName;
  } | null>(null);

  useEffect(() => {
    let counter = 0;
    const onUnavailable = (event: Event) => {
      counter += 1;
      setNotice({
        id: counter,
        worker: (event as CustomEvent<NexusWorkerName>).detail,
      });
    };
    window.addEventListener(WORKER_UNAVAILABLE_EVENT, onUnavailable);
    return () =>
      window.removeEventListener(WORKER_UNAVAILABLE_EVENT, onUnavailable);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (!notice) return null;

  return (
    <output className={styles.notice} key={notice.id}>
      <span aria-hidden="true" className={styles.icon}>
        !
      </span>
      <p>{workerUnavailableMessage(notice.worker)}</p>
      <button
        aria-label="Tutup pemberitahuan"
        onClick={() => setNotice(null)}
        type="button"
      >
        ×
      </button>
    </output>
  );
}
