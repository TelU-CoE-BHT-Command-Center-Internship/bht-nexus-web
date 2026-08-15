"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useState } from "react";
import styles from "@/components/nexus-audit-review/nexus-audit-review.module.css";
import type {
  AuditDecisionKind,
  AuditReviewCategory,
  AuditReviewRecord,
  AuditReviewSource,
  AuditReviewStatus,
  NexusAuditReviewContent,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import type { AuditRuntimeState } from "@/components/nexus-audit-review/nexus-audit-review-drawer-model";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceTabs,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceButton,
  NexusWorkspaceLinkButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceMobileAction,
  NexusWorkspaceMobileCard,
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableAction,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
  NexusWorkspaceTableSignal,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  type NexusSelectOption,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import {
  NexusWorkspaceNoAccess,
  NexusWorkspaceState,
} from "@/components/nexus-workspace-ui/nexus-workspace-state";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";

const NexusAuditReviewDrawer = dynamic(() =>
  import("@/components/nexus-audit-review/nexus-audit-review-drawer").then(
    (module) => module.NexusAuditReviewDrawer,
  ),
);

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Data / usulan", primary: true },
  { id: "type", label: "Jenis" },
  { id: "source", label: "Sumber" },
  { id: "signal", label: "Sinyal" },
  { id: "owner", label: "Pemilik" },
  { id: "period", label: "Periode" },
  { id: "status", label: "Status" },
  { id: "action", label: "Aksi" },
];

const categoryOptions = [
  { label: "Semua jenis data", value: "all" },
  { label: "Publikasi & konferensi", value: "publication_conference" },
  { label: "Riset & bisnis", value: "research_business" },
  { label: "Pengabdian masyarakat", value: "community_service" },
  { label: "HKI, paten & inovasi", value: "innovation_ip" },
  { label: "Akademik & SDM", value: "academic_hr" },
  { label: "Kegiatan & tata kelola", value: "activity_governance" },
] as const;

const statusConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "status",
  label: "Filter status tinjauan",
  options: [
    { label: "Semua status", value: "all" },
    { label: "Menunggu tinjauan", tone: "waiting", value: "waiting" },
    { label: "Perlu perbaikan", tone: "needs-fix", value: "needs_fix" },
    { label: "Selesai ditinjau", tone: "completed", value: "completed" },
  ],
};

const sortConfig: NexusSelectConfig = {
  defaultValue: "newest",
  id: "sort",
  label: "Urutkan antrean",
  options: [
    { label: "Urutan: Terbaru", value: "newest" },
    { label: "Urutan: Terlama", value: "oldest" },
    { label: "Urutan: Judul A–Z", value: "title" },
  ],
};

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "5",
  id: "page-size",
  label: "Jumlah data per halaman",
  options: [
    { label: "5 per halaman", value: "5" },
    { label: "10 per halaman", value: "10" },
    { label: "20 per halaman", value: "20" },
  ],
};

const sourceLabels: Record<AuditReviewSource, string> = {
  document: "Dokumen",
  manual: "Manual",
  scholar: "Google Scholar",
  sinta: "SINTA",
  spreadsheet: "Impor lembar kerja",
};

const sourceOrder: AuditReviewSource[] = [
  "sinta",
  "scholar",
  "document",
  "spreadsheet",
  "manual",
];

function ReviewIcon({ name }: { name: "completed" | "fix" | "waiting" }) {
  if (name === "completed")
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M5 12.5 9.2 17 19 7" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  if (name === "fix")
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="m7 17 1.2-4.2L16 5l3 3-7.8 7.8zM14.5 6.5l3 3" />
      </svg>
    );
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function statusLabel(status: AuditReviewStatus) {
  if (status === "completed") return "Selesai ditinjau";
  if (status === "needs_fix") return "Perlu perbaikan";
  return "Menunggu tinjauan";
}

function statusTone(status: AuditReviewStatus) {
  if (status === "completed") return "success" as const;
  if (status === "needs_fix") return "danger" as const;
  return "waiting" as const;
}

function sourceTone(source: AuditReviewSource) {
  if (source === "sinta") return "success" as const;
  if (source === "scholar") return "info" as const;
  if (source === "document") return "waiting" as const;
  if (source === "spreadsheet") return "info" as const;
  return "neutral" as const;
}

function decisionLabel(kind: AuditDecisionKind) {
  if (kind === "approved_completion") return "Pelengkapan metadata disetujui";
  if (kind === "approved_new") return "Diterima sebagai data baru";
  if (kind === "approved_update") return "Pembaruan data disetujui";
  if (kind === "merged") return "Dihubungkan ke data resmi";
  if (kind === "rejected") return "Ditolak";
  return "Perbaikan diminta";
}

function actionLabel(status: AuditReviewStatus) {
  if (status === "completed") return "Lihat hasil";
  if (status === "needs_fix") return "Lihat permintaan";
  return "Tinjau";
}

function initialRuntimeState(records: AuditReviewRecord[]) {
  return Object.fromEntries(
    records.map((record) => [
      record.id,
      {
        decision: record.decision,
        fixRequest: record.fixRequest,
        history: record.history,
        status: record.status,
        version: record.version,
      } satisfies AuditRuntimeState,
    ]),
  );
}

function searchableText(record: AuditReviewRecord) {
  return [
    record.title,
    record.subtitle,
    record.typeLabel,
    record.categoryLabel,
    record.owner,
    record.primaryPerson,
    ...record.kpiLinks.flatMap((item) => [
      item.category,
      item.indicatorId,
      item.indicatorLabel,
    ]),
    ...record.fields.flatMap((item) => [item.label, item.value]),
    ...record.evidence.flatMap((item) => [item.label, item.reference]),
  ]
    .join(" ")
    .toLocaleLowerCase("id-ID");
}

export function NexusAuditReview({
  content,
  initialRecordId,
}: {
  content: NexusAuditReviewContent;
  initialRecordId?: string;
}) {
  const reviewSession = useNexusReviewSession();
  const records = useMemo(
    () => [
      ...reviewSession.records,
      ...content.records.filter(
        (record) =>
          !reviewSession.records.some(
            (sessionRecord) => sessionRecord.id === record.id,
          ),
      ),
    ],
    [content.records, reviewSession.records],
  );
  const [runtime, setRuntime] = useState<Record<string, AuditRuntimeState>>(
    () => initialRuntimeState(records),
  );
  const [source, setSource] = useState<AuditReviewSource | "all">("all");
  const [status, setStatus] = useState<AuditReviewStatus | "all">("all");
  const [category, setCategory] = useState<AuditReviewCategory | "all">("all");
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeValue, setPageSizeValue] = useState("5");
  const [openId, setOpenId] = useState<string | null>(
    initialRecordId && records.some((record) => record.id === initialRecordId)
      ? initialRecordId
      : null,
  );
  const deferredQuery = useDeferredValue(query);

  const counts = useMemo(() => {
    const statuses = records.map(
      (record) => runtime[record.id]?.status ?? record.status,
    );
    return {
      completed: statuses.filter((value) => value === "completed").length,
      needsFix: statuses.filter((value) => value === "needs_fix").length,
      waiting: statuses.filter((value) => value === "waiting").length,
    };
  }, [records, runtime]);

  const sourceTabs = useMemo(
    () => [
      { count: records.length, id: "all", label: "Semua sumber" },
      ...sourceOrder
        .filter((sourceId) =>
          records.some((record) => record.source === sourceId),
        )
        .map((sourceId) => ({
          count: records.filter((record) => record.source === sourceId).length,
          id: sourceId,
          label: sourceLabels[sourceId],
        })),
    ],
    [records],
  );

  const categoryConfig = useMemo<NexusSelectConfig>(() => {
    const visibleOptions: [NexusSelectOption, ...NexusSelectOption[]] = [
      categoryOptions[0],
      ...categoryOptions
        .slice(1)
        .filter((option) =>
          records.some((record) => record.category === option.value),
        ),
    ];

    return {
      defaultValue: "all",
      id: "category",
      label: "Filter jenis data",
      options: visibleOptions,
    };
  }, [records]);

  const periodConfig = useMemo<NexusSelectConfig>(() => {
    const periods = Array.from(
      new Set(records.map((record) => record.periodLabel)),
    ).sort((first, second) => second.localeCompare(first, "id-ID"));

    return {
      defaultValue: "all",
      id: "period",
      label: "Filter periode evaluasi",
      options: [
        { label: "Semua periode", value: "all" },
        ...periods.map((value) => ({ label: value, value })),
      ],
    };
  }, [records]);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLocaleLowerCase("id-ID");
    const next = records.filter((record) => {
      const effectiveStatus = runtime[record.id]?.status ?? record.status;
      return (
        (source === "all" || record.source === source) &&
        (status === "all" || effectiveStatus === status) &&
        (category === "all" || record.category === category) &&
        (period === "all" || record.periodLabel === period) &&
        (needle.length === 0 || searchableText(record).includes(needle))
      );
    });

    return next.toSorted((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title, "id-ID")
        : sort === "oldest"
          ? a.discoveredAt.localeCompare(b.discoveredAt)
          : b.discoveredAt.localeCompare(a.discoveredAt),
    );
  }, [category, deferredQuery, period, records, runtime, sort, source, status]);

  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const selected = records.find((record) => record.id === openId);
  const selectedState = selected ? runtime[selected.id] : undefined;
  const requestedRecordIsMissing = Boolean(
    initialRecordId && !records.some((record) => record.id === initialRecordId),
  );
  const hasActiveFilters =
    source !== "all" ||
    status !== "all" ||
    category !== "all" ||
    period !== "all" ||
    sort !== "newest" ||
    query.length > 0;

  const resetFilters = () => {
    setSource("all");
    setStatus("all");
    setCategory("all");
    setPeriod("all");
    setSort("newest");
    setQuery("");
    setCurrentPage(1);
  };

  const decide = (
    record: AuditReviewRecord,
    kind: AuditDecisionKind,
    note: string,
    fieldIds: string[],
  ) => {
    const label = decisionLabel(kind);
    const timeLabel = formatAuditTimestamp();
    setRuntime((current) => {
      const previous = current[record.id];
      if (!previous) return current;

      return {
        ...current,
        [record.id]: {
          ...previous,
          decision: {
            actor: `${reviewSession.actor.name} · ${reviewSession.actor.roleLabel}`,
            kind,
            label,
            note,
            timeLabel,
          },
          fixRequest:
            kind === "changes_requested"
              ? {
                  assigneeLabel: "Akan ditentukan berdasarkan hak akses sistem",
                  fieldIds,
                  reason: note,
                }
              : undefined,
          history: [
            ...previous.history,
            {
              actor: `${reviewSession.actor.name} · ${reviewSession.actor.roleLabel}`,
              id: `${record.id}-${kind}-${previous.history.length + 1}`,
              label,
              timeLabel,
            },
          ],
          status: kind === "changes_requested" ? "needs_fix" : "completed",
        },
      };
    });
    setCurrentPage(1);
  };

  const resubmit = (
    record: AuditReviewRecord,
    values: Record<string, string>,
    evidenceNote: string,
  ) => {
    setRuntime((current) => {
      const previous = current[record.id];
      if (!previous?.fixRequest) return current;
      const nextVersion = previous.version + 1;
      const before = Object.fromEntries(
        previous.fixRequest.fieldIds.map((fieldId) => [
          fieldId,
          previous.correction?.after[fieldId] ??
            record.fields.find((item) => item.id === fieldId)?.value ??
            "",
        ]),
      );
      const after = Object.fromEntries(
        previous.fixRequest.fieldIds.map((fieldId) => [
          fieldId,
          values[fieldId] ?? "",
        ]),
      );

      return {
        ...current,
        [record.id]: {
          ...previous,
          correction: {
            after,
            before,
            evidenceNote,
            fieldIds: previous.fixRequest.fieldIds,
            version: nextVersion,
          },
          decision: undefined,
          fixRequest: undefined,
          history: [
            ...previous.history,
            {
              actor: `${reviewSession.actor.name} · ${reviewSession.actor.roleLabel}`,
              id: `${record.id}-resubmitted-${nextVersion}`,
              label: `Kandidat versi ${nextVersion} dikirim ulang`,
              timeLabel: formatAuditTimestamp(),
            },
          ],
          status: "waiting",
          version: nextVersion,
        },
      };
    });
    setCurrentPage(1);
  };

  const rows = visible.map((record) => {
    const recordState = runtime[record.id];
    const effectiveStatus = recordState?.status ?? record.status;
    const visibleActionLabel = actionLabel(effectiveStatus);
    const signal = recordState?.correction
      ? {
          primary: `Versi ${recordState.version} dikirim ulang`,
          secondary: "Perubahan menunggu verifikasi",
          tone: "info" as const,
        }
      : recordState?.status === "completed" && recordState.decision
        ? {
            primary: "Keputusan tercatat",
            secondary: recordState.decision.label,
            tone: "neutral" as const,
          }
        : record.signal;
    const open = () => setOpenId(record.id);
    const action = (
      <NexusWorkspaceTableAction
        key={`${record.id}-action`}
        label={`${visibleActionLabel}: ${record.title}`}
        onClick={open}
      >
        {visibleActionLabel}
      </NexusWorkspaceTableAction>
    );

    return {
      id: record.id,
      cells: {
        action,
        owner: record.owner,
        period: record.periodLabel,
        primary: (
          <NexusWorkspaceTablePrimary
            onClick={open}
            subtitle={record.subtitle}
            title={record.title}
          />
        ),
        signal: (
          <NexusWorkspaceTableSignal
            primary={signal.primary}
            secondary={signal.secondary}
            tone={signal.tone}
          />
        ),
        source: (
          <NexusWorkspaceTableBadge tone={sourceTone(record.source)}>
            {record.sourceLabel}
          </NexusWorkspaceTableBadge>
        ),
        status: (
          <NexusWorkspaceTableBadge tone={statusTone(effectiveStatus)}>
            {statusLabel(effectiveStatus)}
          </NexusWorkspaceTableBadge>
        ),
        type: record.typeLabel,
      },
      mobile: (
        <NexusWorkspaceMobileCard
          action={
            <NexusWorkspaceMobileAction
              label={`${visibleActionLabel}: ${record.title}`}
              onClick={open}
            >
              {visibleActionLabel}
            </NexusWorkspaceMobileAction>
          }
          eyebrow={
            <>
              <NexusWorkspaceTableBadge tone={sourceTone(record.source)}>
                {record.sourceLabel}
              </NexusWorkspaceTableBadge>
              <NexusWorkspaceTableBadge tone={statusTone(effectiveStatus)}>
                {statusLabel(effectiveStatus)}
              </NexusWorkspaceTableBadge>
            </>
          }
          meta={
            <dl>
              <div>
                <dt>Jenis</dt>
                <dd>{record.typeLabel}</dd>
              </div>
              <div>
                <dt>Sinyal</dt>
                <dd>{signal.primary}</dd>
              </div>
              <div>
                <dt>Pemilik</dt>
                <dd>{record.owner}</dd>
              </div>
              <div>
                <dt>Periode</dt>
                <dd>{record.periodLabel}</dd>
              </div>
            </dl>
          }
          title={record.title}
        >
          <p className={styles.mobileSubtitle}>{record.subtitle}</p>
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  if (!reviewSession.capabilities.canReview) {
    return (
      <NexusWorkspacePage
        description="Verifikasi kandidat lintas-domain sebelum menjadi data resmi dan masuk ke perhitungan evaluasi CoE."
        descriptionId="audit-review-description"
        title="Tinjauan Data"
        titleId="audit-review-title"
      >
        <NexusWorkspaceNoAccess
          returnHref="/nexus/dashboard"
          returnLabel="Kembali ke dashboard"
        />
      </NexusWorkspacePage>
    );
  }

  if (requestedRecordIsMissing) {
    return (
      <NexusWorkspacePage
        description="Verifikasi kandidat lintas-domain sebelum menjadi data resmi dan masuk ke perhitungan evaluasi CoE."
        descriptionId="audit-review-description"
        title="Tinjauan Data"
        titleId="audit-review-title"
      >
        <NexusWorkspaceState
          actions={
            <NexusWorkspaceLinkButton href="/nexus/tinjauan" tone="primary">
              Kembali ke antrean
            </NexusWorkspaceLinkButton>
          }
          description="Data yang dibuat dari alur frontend sementara dapat hilang setelah halaman dimuat ulang. Kembali ke antrean untuk melanjutkan."
          eyebrow="Sesi tinjauan"
          title="Data tinjauan tidak tersedia pada sesi ini"
        />
      </NexusWorkspacePage>
    );
  }

  return (
    <NexusWorkspacePage
      description="Verifikasi kandidat lintas-domain sebelum menjadi data resmi dan masuk ke perhitungan evaluasi CoE."
      descriptionId="audit-review-description"
      meta={content.lastUpdatedLabel}
      title="Tinjauan Data"
      titleId="audit-review-title"
    >
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <ReviewIcon name="waiting" />,
            id: "waiting",
            label: "Menunggu Tinjauan",
            tone: "waiting",
            unit: "data",
            value: counts.waiting,
          },
          {
            icon: <ReviewIcon name="fix" />,
            id: "fix",
            label: "Perlu Perbaikan",
            tone: "needs-fix",
            unit: "data",
            value: counts.needsFix,
          },
          {
            icon: <ReviewIcon name="completed" />,
            id: "completed",
            label: "Selesai Ditinjau",
            tone: "completed",
            unit: "data",
            value: counts.completed,
          },
        ]}
      />

      <section aria-labelledby="audit-queue-title" className={styles.queue}>
        <div className={styles.queueIntro}>
          <div>
            <span className={styles.queueEyebrow}>Ruang kerja Audit KM</span>
            <h3 id="audit-queue-title">Satu antrean untuk seluruh data CoE</h3>
            <p className={styles.queueDescription}>
              Jenis data mengubah bidang yang diperiksa, bukan alur keputusan
              reviewer.
            </p>
          </div>
          <NexusWorkspaceNotice>
            Data resmi hanya berubah setelah kandidat diterima atau dihubungkan
            oleh reviewer.
          </NexusWorkspaceNotice>
        </div>

        <NexusWorkspaceTabs
          activeId={source}
          label="Filter antrean berdasarkan sumber"
          onActiveChange={(value) => {
            setSource(value as AuditReviewSource | "all");
            setCurrentPage(1);
          }}
          panelId="audit-source-panel"
          tabs={sourceTabs}
        />

        <div className={styles.toolbar} id="audit-source-panel" role="tabpanel">
          <NexusWorkspaceSearch
            label="Cari data tinjauan"
            name="audit-review-search"
            onValueChange={(value) => {
              setQuery(value);
              setCurrentPage(1);
            }}
            placeholder="Cari judul, orang, indikator, atau bukti"
            value={query}
          />
          {[
            { config: statusConfig, value: status },
            { config: categoryConfig, value: category },
            { config: periodConfig, value: period },
            { config: sortConfig, value: sort },
          ].map(({ config, value }) => (
            <NexusWorkspaceSelect
              config={config}
              isOpen={openFilterId === config.id}
              key={config.id}
              name={`audit-review-${config.id}`}
              onOpenChange={(isOpen) =>
                setOpenFilterId(isOpen ? config.id : null)
              }
              onValueChange={(nextValue) => {
                if (config.id === "status")
                  setStatus(nextValue as AuditReviewStatus | "all");
                else if (config.id === "category")
                  setCategory(nextValue as AuditReviewCategory | "all");
                else if (config.id === "period") setPeriod(nextValue);
                else setSort(nextValue);
                setCurrentPage(1);
              }}
              placement="top-on-narrow"
              value={value}
            />
          ))}
        </div>

        <div aria-live="polite" className={styles.resultMeta}>
          <p className={styles.resultMetaCopy}>
            {query !== deferredQuery
              ? "Memperbarui hasil"
              : `${filtered.length} data ditemukan`}
          </p>
          {hasActiveFilters ? (
            <button onClick={resetFilters} type="button">
              Atur ulang filter
            </button>
          ) : null}
        </div>

        <NexusWorkspaceTableSection
          guidance="Sinyal hanya membantu memusatkan perhatian. Reviewer tetap memeriksa identitas, periode, bukti, dan data pembanding."
          summary={`${sourceTabs.find((tab) => tab.id === source)?.label ?? "Semua sumber"}: ${filtered.length} data sesuai filter`}
          title="Antrean tinjauan"
          titleId="audit-review-queue-table-title"
        >
          <NexusWorkspaceRecordTable
            caption="Daftar kandidat lintas-domain untuk ditinjau oleh Audit KM"
            columns={columns}
            empty={
              <div className={styles.emptyState}>
                <strong>Tidak ada data yang cocok</strong>
                <p className={styles.emptyCopy}>
                  Ubah kata kunci atau filter untuk melihat kandidat lainnya.
                </p>
                {hasActiveFilters ? (
                  <NexusWorkspaceButton onClick={resetFilters} type="button">
                    Atur ulang filter
                  </NexusWorkspaceButton>
                ) : null}
              </div>
            }
            isLoading={query !== deferredQuery}
            pagination={
              <NexusTablePagination
                currentPage={safePage}
                itemCount={filtered.length}
                navigationLabel="Navigasi halaman antrean tinjauan"
                nextPageLabel="Halaman berikutnya"
                onPageChange={setCurrentPage}
                onPageSizeChange={(value) => {
                  setPageSizeValue(value);
                  setCurrentPage(1);
                }}
                pageLabel="Halaman"
                pageSizeConfig={pageSizeConfig}
                pageSizeValue={pageSizeValue}
                previousPageLabel="Halaman sebelumnya"
                rangePrefix="Menampilkan"
                totalUnit="data"
              />
            }
            rows={rows}
          />
        </NexusWorkspaceTableSection>
      </section>

      {selected && selectedState ? (
        <NexusAuditReviewDrawer
          key={`${selected.id}-${selectedState.status}-${selectedState.version}-${selectedState.decision?.kind ?? "open"}`}
          capabilities={reviewSession.capabilities}
          onClose={() => setOpenId(null)}
          onDecide={(kind, note, fieldIds) =>
            decide(selected, kind, note, fieldIds)
          }
          onResubmit={(values, evidenceNote) =>
            resubmit(selected, values, evidenceNote)
          }
          record={selected}
          state={selectedState}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
