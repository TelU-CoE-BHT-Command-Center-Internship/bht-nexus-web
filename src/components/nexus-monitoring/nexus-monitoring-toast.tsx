"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";

/** Konfirmasi singkat setelah perubahan berhasil, tanpa menggeser isi halaman. */
export function NexusMonitoringToast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  const dismiss = useRef(onDismiss);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    dismiss.current = onDismiss;
  }, [onDismiss]);
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => dismiss.current(), 7000);
    return () => window.clearTimeout(timer);
  }, [paused]);

  return (
    <output
      className={styles.monitoringToast}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
      onFocusCapture={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span aria-hidden="true" className={styles.monitoringToastIcon}>
        ✓
      </span>
      <p>{message}</p>
      <button
        aria-label="Tutup pemberitahuan"
        onClick={onDismiss}
        type="button"
      >
        ×
      </button>
    </output>
  );
}
