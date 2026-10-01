"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { nexusServerPermissionLabel } from "@/components/nexus-access-policy/nexus-role-server";
import { NexusAdministrationIcon } from "@/components/nexus-administration/nexus-administration-icons";
import styles from "@/components/nexus-audit-denials/nexus-audit-denials.module.css";
import {
  nexusAuditDenialsContent as content,
  windowOptions,
} from "@/components/nexus-audit-denials/nexus-audit-denials-content";
import { NexusWorkspaceBreadcrumb } from "@/components/nexus-workspace-ui/nexus-workspace-breadcrumb";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceToolbar,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceEmptyState,
  NexusWorkspaceLoadError,
  NexusWorkspaceResultMeta,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  formatPageUpdatedLabel,
  normalizeWorkspaceSearch,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceCatalog,
  NexusWorkspaceMobileCard,
  NexusWorkspaceMobileSubtitle,
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
  NexusWorkspaceTableSignal,
  NexusWorkspaceTableText,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";
import {
  listPermissionDenials,
  type PermissionDenialEntry,
} from "@/lib/api-audit";
import { apiErrorMessage } from "@/lib/api-client";

const DEFAULT_WINDOW = "60";

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Modul", primary: true },
  { id: "kind", label: "Tindakan" },
  { id: "signal", label: "Jumlah penolakan" },
];

const windowConfig: NexusSelectConfig = {
  defaultValue: DEFAULT_WINDOW,
  id: "audit-window",
  label: content.windowLabel,
  options: windowOptions,
};

type DenialRow = {
  action: string;
  count: number;
  description?: string;
  id: string;
  module: string;
};

function denialRow(entry: PermissionDenialEntry, index: number): DenialRow {
  if (!entry.permission) {
    return {
      action: "Belum tercatat",
      count: entry.count,
      id: `unknown-${index}`,
      module: content.unknownPermissionLabel,
    };
  }
  const label = nexusServerPermissionLabel(entry.permission);
  return {
    action: label.action ?? "Kelola",
    count: entry.count,
    description: label.description,
    id: entry.permission,
    module: label.module,
  };
}

type NexusAuditDenialsProps = {
  /** Halaman Administrasi yang boleh dibuka akun ini, untuk jejak halaman. */
  administrationHref?: string;
};

export function NexusAuditDenials({
  administrationHref,
}: NexusAuditDenialsProps) {
  const [minutes, setMinutes] = useState(DEFAULT_WINDOW);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<PermissionDenialEntry[]>([]);
  const [state, setState] = useState<"error" | "loading" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loadedAt, setLoadedAt] = useState<Date>();
  const latestRequest = useRef(0);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const isSearchUpdating = searchQuery !== deferredSearchQuery;

  const load = useCallback((windowMinutes: string) => {
    const request = ++latestRequest.current;
    setState("loading");
    listPermissionDenials(Number(windowMinutes))
      .then((result) => {
        if (request !== latestRequest.current) return;
        setEntries(result.data);
        setLoadedAt(new Date());
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(apiErrorMessage(error, content.errorLabel));
        setState("error");
      });
  }, []);

  useEffect(() => {
    load(minutes);
    return () => {
      latestRequest.current += 1;
    };
  }, [load, minutes]);

  const denials = useMemo(
    () =>
      entries
        .map(denialRow)
        .toSorted(
          (first, second) =>
            second.count - first.count ||
            first.module.localeCompare(second.module, "id-ID"),
        ),
    [entries],
  );
  const filtered = useMemo(() => {
    const query = normalizeWorkspaceSearch(deferredSearchQuery);
    if (!query) return denials;
    return denials.filter((denial) =>
      normalizeWorkspaceSearch(`${denial.module} ${denial.action}`).includes(
        query,
      ),
    );
  }, [deferredSearchQuery, denials]);

  const isLoading = state === "loading";
  /* Angka hanya tampil dari catatan yang benar-benar terbaca; saat memuat
     atau gagal, ringkasan menunggu alih-alih menampilkan nol. */
  const isReady = state === "ready";
  const totalDenials = denials.reduce((sum, denial) => sum + denial.count, 0);
  const highestCount = denials[0]?.count ?? 0;
  const windowLabel =
    windowOptions.find((option) => option.value === minutes)?.label ??
    windowOptions[1].label;
  const hasActiveFilters = searchQuery !== "" || minutes !== DEFAULT_WINDOW;
  const resetFilters = () => {
    setSearchQuery("");
    setMinutes(DEFAULT_WINDOW);
  };

  const rows = filtered.map((denial) => ({
    cells: {
      kind: <NexusWorkspaceTableText>{denial.action}</NexusWorkspaceTableText>,
      primary: (
        <NexusWorkspaceTablePrimary
          subtitle={denial.description}
          title={denial.module}
        />
      ),
      signal: (
        <NexusWorkspaceTableSignal
          primary={denial.count}
          secondary="kali ditolak"
          tone="danger"
        />
      ),
    },
    id: denial.id,
    mobile: (
      <NexusWorkspaceMobileCard
        action={null}
        eyebrow={
          <NexusWorkspaceTableBadge tone="danger">
            {denial.count} kali ditolak
          </NexusWorkspaceTableBadge>
        }
        meta={
          <dl>
            <div>
              <dt>Tindakan</dt>
              <dd>{denial.action}</dd>
            </div>
          </dl>
        }
        title={denial.module}
      >
        {denial.description ? (
          <NexusWorkspaceMobileSubtitle>
            {denial.description}
          </NexusWorkspaceMobileSubtitle>
        ) : null}
      </NexusWorkspaceMobileCard>
    ),
  }));

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="audit-denials-description"
      meta={loadedAt ? formatPageUpdatedLabel(loadedAt) : undefined}
      title={content.title}
      titleId="audit-denials-title"
    >
      {administrationHref ? (
        <NexusWorkspaceBreadcrumb
          current={content.title}
          trail={[{ href: administrationHref, label: "Administrasi" }]}
        />
      ) : null}

      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <NexusAdministrationIcon name="shield" />,
            id: "total-denials",
            label: "Total Penolakan",
            tone: "needs-fix",
            unit: "kali",
            value: isReady ? totalDenials : null,
          },
          {
            icon: <NexusAdministrationIcon name="key" />,
            id: "denied-permissions",
            label: "Hak Akses Terdampak",
            tone: "waiting",
            unit: "hak akses",
            value: isReady ? denials.length : null,
          },
          {
            icon: <NexusAdministrationIcon name="clock" />,
            id: "highest-denial",
            label: "Penolakan Tertinggi",
            tone: "completed",
            unit: "kali pada satu hak akses",
            value: isReady ? highestCount : null,
          },
        ]}
        unavailable={state === "error"}
      />

      <NexusWorkspaceCatalog
        className={styles.catalog}
        labelledBy="audit-denials-table-title"
      >
        <NexusWorkspaceToolbar>
          <NexusWorkspaceSearch
            label={content.searchLabel}
            name="audit-denials-search"
            onValueChange={setSearchQuery}
            placeholder={content.searchPlaceholder}
            value={searchQuery}
          />
          <NexusWorkspaceSelect
            config={windowConfig}
            isOpen={isWindowOpen}
            name="audit-window"
            onOpenChange={setIsWindowOpen}
            onValueChange={setMinutes}
            placement="top-on-narrow"
            value={minutes}
          />
        </NexusWorkspaceToolbar>

        {state === "error" ? null : (
          <NexusWorkspaceResultMeta
            isUpdating={isSearchUpdating}
            onResetFilters={hasActiveFilters ? resetFilters : undefined}
            resultLabel={`${filtered.length} hak akses ditemukan`}
            updatingLabel="Memperbarui hasil pencarian"
          />
        )}

        <NexusWorkspaceTableSection
          guidance={content.guidance}
          summary={
            state === "error"
              ? windowLabel
              : `${windowLabel} · ${filtered.length} dari ${denials.length} hak akses sesuai filter`
          }
          title={content.tableTitle}
          titleId="audit-denials-table-title"
        >
          {state === "error" ? (
            <NexusWorkspaceLoadError
              description={errorMessage ?? content.errorLabel}
              onRetry={() => load(minutes)}
              title="Catatan penolakan akses belum dapat dimuat"
            />
          ) : (
            <NexusWorkspaceRecordTable
              caption={content.tableCaption}
              columns={columns}
              empty={
                <NexusWorkspaceEmptyState
                  description={
                    denials.length === 0
                      ? "Tidak ada tindakan yang ditolak pada rentang waktu ini."
                      : "Ubah kata kunci atau rentang waktu untuk melihat penolakan lain."
                  }
                  onResetFilters={hasActiveFilters ? resetFilters : undefined}
                  title={
                    denials.length === 0
                      ? "Tidak ada penolakan akses"
                      : "Tidak ada hak akses yang cocok"
                  }
                />
              }
              isLoading={isSearchUpdating || isLoading}
              pagination={null}
              rows={rows}
            />
          )}
        </NexusWorkspaceTableSection>
      </NexusWorkspaceCatalog>
    </NexusWorkspacePage>
  );
}
