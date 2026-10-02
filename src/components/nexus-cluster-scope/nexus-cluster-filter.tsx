"use client";

import { useNexusClusterScope } from "@/components/nexus-cluster-scope/nexus-cluster-scope";
import { NexusMemberContext } from "@/components/nexus-members/nexus-member-context";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { useNexusWorkspaceProceed } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

const ALL_CLUSTERS = "all";

function ClusterIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="7.5" r="2.75" />
      <circle cx="6" cy="16" r="2.75" />
      <circle cx="18" cy="16" r="2.75" />
      <path d="m10.6 9.9-3.2 3.7M13.4 9.9l3.2 3.7M8.75 16h6.5" />
    </svg>
  );
}

/**
 * Pilihan klaster pada baris filter halaman. Hanya tampil untuk akun yang
 * melihat semua klaster; ketua klaster dibatasi server ke klasternya sendiri.
 */
export function NexusClusterSelect({
  isOpen,
  onOpenChange,
  placement = "top-on-narrow",
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  placement?: "bottom" | "top" | "top-on-narrow";
}) {
  const cluster = useNexusClusterScope();
  const proceed = useNexusWorkspaceProceed();
  if (!cluster.canChoose) return null;

  const config: NexusSelectConfig = {
    defaultValue: ALL_CLUSTERS,
    id: "cluster",
    label: "Filter klaster",
    options: [
      { label: "Semua klaster", value: ALL_CLUSTERS },
      ...cluster.divisions.map((division) => ({
        label: division.name,
        value: division.publicId,
      })),
    ],
  };

  return (
    <NexusWorkspaceSelect
      config={config}
      isOpen={isOpen}
      leadingIcon={<ClusterIcon />}
      name="cluster-filter"
      onOpenChange={onOpenChange}
      onValueChange={(value) =>
        proceed(() =>
          cluster.selectDivision(value === ALL_CLUSTERS ? undefined : value),
        )
      }
      placement={placement}
      value={cluster.divisionPublicId ?? ALL_CLUSTERS}
    />
  );
}

/**
 * Penjelasan cakupan untuk ketua klaster: daftar dan angka di halaman hanya
 * memuat rekam yang melibatkan ketua atau anggota klasternya.
 */
export function NexusClusterScopeNotice() {
  const { scope } = useNexusClusterScope();

  if (scope?.kind === "division") {
    return (
      <NexusMemberContext
        description="Daftar dan angka di halaman ini hanya memuat rekam yang melibatkan ketua atau anggota klaster ini, termasuk rekam lintas klaster."
        icon={<ClusterIcon />}
        label="Cakupan klaster Anda"
        memberName={scope.division.name}
      />
    );
  }
  if (scope?.kind === "none") {
    return (
      <NexusMemberContext
        description="Akun ini belum terhubung ke anggota sebuah klaster, sehingga belum ada rekam yang dapat ditampilkan. Minta pengelola akun menautkan akun ke anggota klasternya."
        icon={<ClusterIcon />}
        label="Klaster belum terhubung"
        memberName="Belum ada rekam dalam cakupan"
      />
    );
  }
  return null;
}
