"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { getAccountPermissions } from "@/lib/api-accounts";

/**
 * Jumlah penyesuaian akses khusus pada satu akun. Selain angka, jumlahnya bisa
 * sedang dibaca atau tidak dapat dibaca oleh akun yang sedang melihat.
 */
export type NexusAccountSpecialAccess = number | "loading" | "unavailable";

/** Pembaca akses khusus per akun bila jumlahnya dibaca terpisah dari sesi. */
export type NexusAccountSpecialAccessReader = {
  countFor: (accountId: string) => NexusAccountSpecialAccess;
  /** Dipanggil ketika jumlah akses khusus satu akun perlu ditampilkan. */
  request: (accountId: string) => void;
};

export function nexusAccountSpecialAccessLabel(
  count: NexusAccountSpecialAccess,
) {
  if (count === "loading") return "Memeriksa…";
  if (count === "unavailable") return "Belum dapat dibaca";
  return count > 0 ? `${count} penyesuaian` : "Mengikuti peran";
}

/**
 * Jumlah akses khusus tiap akun, dibaca hanya ketika perlu ditampilkan supaya
 * daftar akun tidak membaca izin setiap akun satu per satu.
 */
export function useNexusAccountSpecialAccess(
  canRead: boolean,
): NexusAccountSpecialAccessReader {
  const [counts, setCounts] = useState<
    Record<string, NexusAccountSpecialAccess>
  >({});
  const requested = useRef(new Set<string>());

  const request = useCallback(
    (accountId: string) => {
      if (!canRead || requested.current.has(accountId)) return;
      requested.current.add(accountId);
      getAccountPermissions(accountId)
        .then((result) => {
          const adjusted = result.permissions.filter(
            (permission) => permission.overrideStatus !== "inherited",
          ).length;
          setCounts((current) => ({ ...current, [accountId]: adjusted }));
        })
        .catch(() => {
          // Permintaan berikutnya untuk akun ini mencoba membaca lagi.
          requested.current.delete(accountId);
          setCounts((current) => ({ ...current, [accountId]: "unavailable" }));
        });
    },
    [canRead],
  );

  return useMemo(
    () => ({
      countFor: (accountId) =>
        canRead ? (counts[accountId] ?? "loading") : "unavailable",
      request,
    }),
    [canRead, counts, request],
  );
}
