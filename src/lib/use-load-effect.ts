"use client";

import { useEffect, useRef } from "react";

/**
 * Menjalankan pemuat data saat komponen dipasang dan setiap kali pemuatnya
 * berganti, misalnya ketika filter yang ia baca berubah.
 *
 * React menyambung ulang efek ketika halaman yang sempat disembunyikan batas
 * Suspense tampil lagi, contohnya saat kode laci rincian baru dimuat pada
 * pembukaan pertama. Pemuat yang sama tidak dijalankan ulang pada saat itu,
 * sehingga halaman tidak membaca ulang data yang sudah ada dan tidak berkedip
 * di belakang laci.
 */
export function useLoadEffect(load: () => void) {
  const started = useRef<() => void>(undefined);

  useEffect(() => {
    if (started.current === load) return;
    started.current = load;
    load();
  }, [load]);
}
