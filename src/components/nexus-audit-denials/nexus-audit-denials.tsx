"use client";

import { useEffect, useMemo, useState } from "react";
import {
  nexusAuditDenialsContent as content,
  windowOptions,
} from "@/components/nexus-audit-denials/nexus-audit-denials-content";
import {
  NexusWorkspaceEmptyState,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceMobileCard,
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableSignal,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import {
  listPermissionDenials,
  type PermissionDenialEntry,
} from "@/lib/api-audit";
import { ApiRequestError } from "@/lib/api-client";

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "permission", label: "Permission", primary: true },
  { id: "count", label: "Jumlah" },
];

const windowConfig: NexusSelectConfig = {
  defaultValue: "60",
  id: "audit-window",
  label: content.windowLabel,
  options: windowOptions,
};

export function NexusAuditDenials() {
  const [minutes, setMinutes] = useState("60");
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [entries, setEntries] = useState<PermissionDenialEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    listPermissionDenials(Number(minutes))
      .then((result) => {
        if (cancelled) return;
        setEntries(result.data);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiRequestError ? error.message : content.errorLabel,
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [minutes]);

  const rows = useMemo(
    () =>
      entries.map((entry, index) => {
        const permissionLabel =
          entry.permission ?? content.unknownPermissionLabel;
        return {
          id: entry.permission ?? `unknown-${index}`,
          cells: {
            count: (
              <NexusWorkspaceTableSignal
                primary={entry.count}
                tone={entry.count > 0 ? "danger" : "neutral"}
              />
            ),
            permission: permissionLabel,
          },
          mobile: (
            <NexusWorkspaceMobileCard
              action={null}
              eyebrow={null}
              meta={<dl />}
              title={permissionLabel}
            >
              {entry.count} {content.columns.count.toLowerCase()}
            </NexusWorkspaceMobileCard>
          ),
        };
      }),
    [entries],
  );

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="audit-denials-description"
      title={content.title}
      titleId="audit-denials-title"
    >
      {loadError !== null ? (
        <NexusWorkspaceNotice tone="danger">{loadError}</NexusWorkspaceNotice>
      ) : null}

      <NexusWorkspaceSelect
        config={windowConfig}
        isOpen={isWindowOpen}
        name="audit-window"
        onOpenChange={setIsWindowOpen}
        onValueChange={setMinutes}
        value={minutes}
      />

      <NexusWorkspaceRecordTable
        caption={content.tableCaption}
        columns={columns}
        empty={
          <NexusWorkspaceEmptyState
            description={content.emptyDescription}
            title={content.emptyTitle}
          />
        }
        isLoading={isLoading}
        pagination={null}
        rows={rows}
      />
    </NexusWorkspacePage>
  );
}
