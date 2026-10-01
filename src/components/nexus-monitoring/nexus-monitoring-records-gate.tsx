"use client";

import type { ReactNode } from "react";
import { useNexusOfficialRecords } from "@/components/nexus-official-records/nexus-official-records-hooks";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceLoading } from "@/components/nexus-workspace-ui/nexus-workspace-loading";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";

/**
 * Menahan Monitoring sampai rekam resmi dari server selesai dibaca, supaya
 * angka realisasi tidak sempat tampil nol sebelum datanya ada.
 */
export function NexusMonitoringRecordsGate({
  children,
}: {
  children: ReactNode;
}) {
  const { errorMessage, retry, state } = useNexusOfficialRecords();

  if (state === "loading") {
    return <NexusWorkspaceLoading label="Memuat rekam resmi…" />;
  }
  if (state === "error") {
    return (
      <NexusWorkspacePage
        description="Capaian indikator KM dihitung dari rekam resmi CoE BHT."
        descriptionId="monitoring-unavailable-description"
        title="Monitoring KM"
        titleId="monitoring-unavailable-title"
      >
        <NexusWorkspaceState
          actions={
            <NexusWorkspaceButton onClick={retry} type="button">
              Coba lagi
            </NexusWorkspaceButton>
          }
          description={errorMessage ?? "Rekam resmi belum dapat dimuat."}
          eyebrow="Gagal memuat"
          title="Monitoring KM belum dapat dihitung"
          tone="danger"
        />
      </NexusWorkspacePage>
    );
  }
  return children;
}
