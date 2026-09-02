"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";

type MonitoringNumberProps = {
  /** Teks pengganti ketika nilainya memang belum diketahui. */
  fallback?: string;
  fractionDigits?: number;
  suffix?: string;
  value: number | null;
};

const DURATION_MS = 900;

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function formatValue(value: number, fractionDigits: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Tab yang tersembunyi menahan frame animasi, sehingga hitungan bisa berhenti
 * di angka antara. Halaman yang dimuat di latar karena itu langsung
 * menampilkan angka akhirnya.
 */
function isHidden() {
  return (
    typeof document !== "undefined" && document.visibilityState === "hidden"
  );
}

/**
 * Angka metrik yang berjalan menuju nilai akhirnya saat pertama kali terlihat
 * dan saat nilainya berganti. Nilai akhir selalu dirender lebih dahulu supaya
 * hasil server dan klien sama, lalu animasi dimulai setelah komponen terpasang.
 *
 * Pembaca layar menerima nilai akhirnya seketika; hanya lapisan visual yang
 * dianimasikan. Preferensi `prefers-reduced-motion` langsung menampilkan nilai
 * akhir tanpa animasi.
 */
export function MonitoringNumber({
  fallback = "—",
  fractionDigits = 0,
  suffix,
  value,
}: MonitoringNumberProps) {
  const [running, setRunning] = useState<number | null>(null);
  /**
   * Angka yang sedang terlihat. Nilai inilah titik mulai animasi berikutnya,
   * bukan nilai target sebelumnya, sehingga effect yang dijalankan ulang tetap
   * melanjutkan dari tampilan yang sudah ada dan tidak pernah membatalkan
   * hitungan pertama.
   */
  const shown = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (value === null) {
      shown.current = null;
      setRunning(null);
      return;
    }

    if (prefersReducedMotion() || isHidden()) {
      shown.current = value;
      setRunning(null);
      return;
    }

    const start = shown.current ?? 0;

    if (start === value) {
      shown.current = value;
      setRunning(null);
      return;
    }

    const startedAt = performance.now();
    shown.current = start;
    setRunning(start);

    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      if (progress < 1) {
        shown.current = start + (value - start) * eased;
        setRunning(shown.current);
        frame.current = requestAnimationFrame(step);
        return;
      }
      // Setelah selesai, angka kembali menjadi satu simpul teks biasa supaya
      // penyalinan teks tidak ikut membawa nilai antara.
      shown.current = value;
      setRunning(null);
    };

    frame.current = requestAnimationFrame(step);
    /* Pengaman bila frame animasi tertahan: angka akhir tetap muncul. */
    const settle = window.setTimeout(() => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      shown.current = value;
      setRunning(null);
    }, DURATION_MS + 200);

    return () => {
      window.clearTimeout(settle);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [value]);

  if (value === null) {
    return <span>{fallback}</span>;
  }

  const finalLabel = `${formatValue(value, fractionDigits)}${suffix ?? ""}`;

  if (running === null) {
    return <span>{finalLabel}</span>;
  }

  return (
    <span>
      <span aria-hidden="true">
        {`${formatValue(running, fractionDigits)}${suffix ?? ""}`}
      </span>
      <span className={styles.visuallyHidden}>{finalLabel}</span>
    </span>
  );
}
