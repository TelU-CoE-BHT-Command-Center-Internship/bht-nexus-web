"use client";

import { useState } from "react";
import {
  NexusClusterScopeNotice,
  NexusClusterSelect,
} from "@/components/nexus-cluster-scope/nexus-cluster-filter";
import styles from "@/components/nexus-cluster-scope/nexus-cluster-filter-bar.module.css";
import { useNexusClusterScope } from "@/components/nexus-cluster-scope/nexus-cluster-scope";
import { NexusWorkspaceLoadError } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { useNexusWorkspaceProceed } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

export function NexusClusterFilterBar() {
  const cluster = useNexusClusterScope();
  const proceed = useNexusWorkspaceProceed();
  const [isOpen, setIsOpen] = useState(false);

  if (cluster.directoryUnavailable) {
    return (
      <NexusWorkspaceLoadError
        title="Daftar klaster belum dapat dimuat"
        description="Muat ulang halaman untuk mencoba kembali memilih klaster."
        onRetry={() => proceed(() => window.location.reload())}
      />
    );
  }
  if (
    !cluster.canChoose &&
    cluster.scope?.kind !== "division" &&
    cluster.scope?.kind !== "none"
  )
    return null;

  return (
    <div className={styles.bar}>
      <NexusClusterScopeNotice />
      {cluster.canChoose ? (
        <div className={styles.select}>
          <NexusClusterSelect
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            placement="bottom"
          />
        </div>
      ) : null}
    </div>
  );
}
