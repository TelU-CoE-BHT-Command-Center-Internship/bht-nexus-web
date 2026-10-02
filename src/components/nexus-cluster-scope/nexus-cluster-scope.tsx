"use client";

import { useRouter } from "next/navigation";

import {
  createContext,
  Fragment,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { NEXUS_CLUSTER_COOKIE } from "@/components/nexus-cluster-scope/nexus-cluster-cookie";
import type { NexusDataScope, NexusDivision } from "@/lib/api-divisions";

type NexusClusterScopeValue = {
  /** Klaster yang sedang membatasi tampilan, baik dipilih maupun tetap. */
  activeDivision?: NexusDivision;
  /** Klaster yang dikirim ke server; kosong berarti semua rekam dalam cakupan. */
  divisionPublicId?: string;
  divisions: readonly NexusDivision[];
  directoryUnavailable: boolean;
  /** Pengguna boleh memilih klaster sendiri (cakupan semua klaster). */
  canChoose: boolean;
  /** Kunci yang berubah setiap cakupan atau pilihan klaster berganti. */
  scopeKey: string;
  scope: NexusDataScope | null;
  selectDivision: (publicId: string | undefined) => void;
};

const fallbackValue: NexusClusterScopeValue = {
  canChoose: false,
  divisions: [],
  directoryUnavailable: false,
  scope: null,
  scopeKey: "unknown",
  selectDivision: () => undefined,
};

const NexusClusterScopeContext =
  createContext<NexusClusterScopeValue>(fallbackValue);

function rememberDivision(publicId: string | undefined) {
  try {
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie ini hanya menyimpan pilihan filter bagi render server, termasuk pada peramban tanpa Cookie Store.
    document.cookie = publicId
      ? `${NEXUS_CLUSTER_COOKIE}=${encodeURIComponent(publicId)}; path=/; SameSite=Lax`
      : `${NEXUS_CLUSTER_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    /* Pilihan tetap berlaku selama halaman terbuka walau cookie ditolak. */
  }
}

/**
 * Cakupan klaster akun yang sedang masuk. Ketua klaster selalu dibatasi
 * server ke klasternya; peran lain dapat memilih satu klaster, dan pilihan
 * itu berlaku di semua tab sampai diganti.
 */
export function NexusClusterScopeProvider({
  children,
  divisions,
  directoryUnavailable = false,
  initialDivisionPublicId,
  scope,
}: {
  children: ReactNode;
  divisions: readonly NexusDivision[];
  directoryUnavailable?: boolean;
  initialDivisionPublicId?: string;
  scope: NexusDataScope | null;
}) {
  const router = useRouter();
  const canChoose = scope?.kind === "all" && divisions.length > 0;
  const [selected, setSelected] = useState(() =>
    canChoose &&
    divisions.some((division) => division.publicId === initialDivisionPublicId)
      ? initialDivisionPublicId
      : undefined,
  );

  const selectDivision = useCallback(
    (publicId: string | undefined) => {
      const next = divisions.some((division) => division.publicId === publicId)
        ? publicId
        : undefined;
      setSelected(next);
      rememberDivision(next);
      router.refresh();
    },
    [divisions, router],
  );

  const value = useMemo<NexusClusterScopeValue>(() => {
    const divisionPublicId = canChoose ? selected : undefined;
    const activeDivision =
      scope?.kind === "division"
        ? scope.division
        : divisions.find((division) => division.publicId === divisionPublicId);
    return {
      activeDivision,
      canChoose,
      divisionPublicId,
      divisions,
      directoryUnavailable,
      scope,
      scopeKey: `${scope?.kind ?? "unknown"}:${activeDivision?.publicId ?? "all"}`,
      selectDivision,
    };
  }, [
    canChoose,
    directoryUnavailable,
    divisions,
    scope,
    selectDivision,
    selected,
  ]);

  return (
    <NexusClusterScopeContext.Provider value={value}>
      <Fragment key={value.scopeKey}>{children}</Fragment>
    </NexusClusterScopeContext.Provider>
  );
}

export function useNexusClusterScope() {
  return useContext(NexusClusterScopeContext);
}
