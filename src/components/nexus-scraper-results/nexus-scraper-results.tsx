"use client";

import { useDeferredValue, useMemo, useState } from "react";
import styles from "@/components/nexus-scraper-results/nexus-scraper-results.module.css";
import type {
  CandidateDecision,
  NexusScraperResultsContent,
  StagedCandidate,
} from "@/components/nexus-scraper-results/nexus-scraper-results-content";
import { normalizeDoi } from "@/components/nexus-scraper-results/nexus-scraper-review";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceTabs,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceField,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
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
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";

type DecisionRecord = {
  decision: CandidateDecision;
  label: string;
  note: string;
};

type CorrectionRecord = {
  values: Record<string, string>;
  version: number;
};

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Judul / entitas", primary: true },
  { id: "type", label: "Jenis" },
  { id: "source", label: "Sumber" },
  { id: "match", label: "Kecocokan" },
  { id: "owner", label: "Pemilik" },
  { id: "found", label: "Ditemukan" },
  { id: "status", label: "Status" },
  { id: "action", label: "Aksi" },
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

function getYear(candidate: StagedCandidate) {
  return candidate.details.find((detail) => detail.id === "year")?.value ?? "—";
}

function getEffectiveStatus(
  candidate: StagedCandidate,
  decision?: DecisionRecord,
) {
  if (decision?.decision === "changes_requested") return "needs_fix" as const;
  if (decision) return "completed" as const;
  return candidate.status === "completed"
    ? ("completed" as const)
    : candidate.status;
}

function statusTone(status: ReturnType<typeof getEffectiveStatus>) {
  if (status === "completed") return "success" as const;
  if (status === "needs_fix") return "danger" as const;
  return "waiting" as const;
}

function sourceTone(source: StagedCandidate["source"]) {
  if (source === "sinta") return "success" as const;
  if (source === "scholar") return "info" as const;
  if (source === "document") return "waiting" as const;
  return "neutral" as const;
}

function CandidateDrawer({
  candidate,
  content,
  correction,
  decision,
  onClose,
  onDecide,
  onResubmit,
}: {
  candidate: StagedCandidate;
  content: NexusScraperResultsContent;
  correction?: CorrectionRecord;
  decision?: DecisionRecord;
  onClose: () => void;
  onDecide: (
    candidate: StagedCandidate,
    decision: CandidateDecision,
    note: string,
  ) => void;
  onResubmit: (
    candidate: StagedCandidate,
    values: Record<string, string>,
  ) => void;
}) {
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      candidate.details.map((detail) => [
        detail.id,
        correction?.values[detail.id] ?? detail.value,
      ]),
    ),
  );
  const match = candidate.matches[0];
  const sharesDoi = Boolean(
    candidate.doi && match?.doi && normalizeDoi(candidate.doi) === match.doi,
  );
  const hasCorrection = candidate.details.some(
    (detail) =>
      draft[detail.id]?.trim() !==
      (correction?.values[detail.id] ?? detail.value),
  );
  const correctionComplete = candidate.details.every(
    (detail) => draft[detail.id]?.trim().length > 0,
  );
  const noteReady = note.trim().length > 0;

  return (
    <NexusWorkspaceDrawer
      closeLabel={
        content.locale === "en"
          ? "Close candidate details"
          : "Tutup rincian kandidat"
      }
      description={`${candidate.typeLabel} · ${candidate.sourceLabel} · ${candidate.discoveredAtLabel}`}
      eyebrow={candidate.id}
      onClose={onClose}
      steps={[
        {
          active: true,
          complete: true,
          label: content.locale === "en" ? "Source" : "Sumber",
          number: 1,
        },
        {
          active: true,
          complete: Boolean(match),
          label: content.locale === "en" ? "Compare" : "Bandingkan",
          number: 2,
        },
        {
          active: Boolean(decision),
          complete: Boolean(
            decision && decision.decision !== "changes_requested",
          ),
          label: content.locale === "en" ? "Decision" : "Keputusan",
          number: 3,
        },
      ]}
      title={candidate.title}
    >
      <section className={styles.detailCard}>
        <header>
          <div>
            <span className={styles.detailEyebrow}>
              {content.locale === "en"
                ? "Candidate metadata"
                : "Metadata kandidat"}
            </span>
            <h3 className={styles.detailTitle}>{candidate.researcher}</h3>
          </div>
          <NexusWorkspaceTableBadge tone={sourceTone(candidate.source)}>
            {candidate.sourceLabel}
          </NexusWorkspaceTableBadge>
        </header>
        <dl className={styles.detailGrid}>
          {candidate.details.map((detail) => (
            <div key={detail.id}>
              <dt>{detail.label}</dt>
              <dd>{correction?.values[detail.id] ?? detail.value}</dd>
            </div>
          ))}
        </dl>
        <a
          className={styles.sourceLink}
          href={candidate.sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          {content.sourceUrlLabel}
        </a>
      </section>

      {correction ? (
        <section className={styles.detailCard}>
          <header>
            <div>
              <span className={styles.detailEyebrow}>
                {content.correctionTitle}
              </span>
              <h3 className={styles.detailTitle}>
                {content.versionLabel} {correction.version}
              </h3>
            </div>
            <NexusWorkspaceTableBadge tone="info">
              {content.locale === "en" ? "Resubmitted" : "Dikirim ulang"}
            </NexusWorkspaceTableBadge>
          </header>
          <div className={styles.comparisonList}>
            {candidate.details.map((detail) => (
              <div key={detail.id}>
                <strong>{detail.label}</strong>
                <span className={styles.comparisonValue}>
                  <b>{content.beforeLabel}</b>
                  {detail.value}
                </span>
                <span className={styles.comparisonValue}>
                  <b>{content.afterLabel}</b>
                  {correction.values[detail.id] ?? detail.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {match ? (
        <section className={styles.detailCard}>
          <header>
            <div>
              <span className={styles.detailEyebrow}>
                {content.comparisonTitle}
              </span>
              <h3 className={styles.detailTitle}>{match.title}</h3>
            </div>
            <NexusWorkspaceTableBadge
              tone={
                candidate.match.score && candidate.match.score >= 90
                  ? "danger"
                  : "waiting"
              }
            >
              {candidate.match.score}% · {candidate.match.verdictLabel}
            </NexusWorkspaceTableBadge>
          </header>
          <div className={styles.comparisonTableWrap}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>{content.comparisonColumns.field}</th>
                  <th>{content.comparisonColumns.candidate}</th>
                  <th>{content.comparisonColumns.official}</th>
                </tr>
              </thead>
              <tbody>
                {match.comparisons.map((row) => (
                  <tr key={row.id}>
                    <th>{row.label}</th>
                    <td>{correction?.values[row.id] ?? row.candidateValue}</td>
                    <td>
                      <span
                        className={styles.officialValue}
                        data-status={row.status}
                      >
                        {row.officialValue}
                      </span>
                      <small>{row.statusLabel}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <NexusWorkspaceNotice>
          {content.locale === "en"
            ? "No comparable official record was found. A reviewer must still validate the source before accepting a new record."
            : "Belum ada rekam resmi pembanding. Reviewer tetap wajib memvalidasi sumber sebelum menerima data baru."}
        </NexusWorkspaceNotice>
      )}

      <section className={styles.detailCard}>
        <header>
          <div>
            <span className={styles.detailEyebrow}>
              {content.timelineTitle}
            </span>
            <h3 className={styles.detailTitle}>
              {candidate.timeline.length}{" "}
              {content.locale === "en"
                ? "recorded events"
                : "kejadian tercatat"}
            </h3>
          </div>
        </header>
        <ol className={styles.timeline}>
          {candidate.timeline.map((entry) => (
            <li key={entry.id}>
              <i />
              <div>
                <strong>{entry.label}</strong>
                <span className={styles.timelineMeta}>
                  {entry.actor} · {entry.timeLabel}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {decision?.decision === "changes_requested" ? (
        <section className={styles.decisionCard}>
          <NexusWorkspaceNotice tone="danger">
            {content.decidedLabel}: {decision.label} · {decision.note}
          </NexusWorkspaceNotice>
          <h3 className={styles.decisionTitle}>{content.correctionTitle}</h3>
          <div className={styles.correctionFields}>
            {candidate.details.map((detail) => (
              <NexusWorkspaceField
                id={`correction-${candidate.id}-${detail.id}`}
                key={detail.id}
                label={detail.label}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [detail.id]: event.target.value,
                  }))
                }
                value={draft[detail.id] ?? ""}
              />
            ))}
          </div>
          <NexusWorkspaceButton
            disabled={!hasCorrection || !correctionComplete}
            onClick={() => {
              onResubmit(candidate, draft);
              onClose();
            }}
            tone="primary"
            type="button"
          >
            {content.resubmitLabel}
          </NexusWorkspaceButton>
        </section>
      ) : decision ? (
        <NexusWorkspaceNotice tone="success">
          {content.decidedLabel}: {decision.label}
          {decision.note ? ` · ${decision.note}` : ""}
        </NexusWorkspaceNotice>
      ) : (
        <section className={styles.decisionCard}>
          <div>
            <span className={styles.decisionEyebrow}>
              {content.locale === "en"
                ? "Reviewer decision"
                : "Keputusan reviewer"}
            </span>
            <h3 className={styles.decisionTitle}>{content.noteLabel}</h3>
            <p>{content.noteRequiredLabel}</p>
          </div>
          <NexusWorkspaceField
            id={`note-${candidate.id}`}
            label={content.noteLabel}
            onChange={(event) => setNote(event.target.value)}
            placeholder={content.notePlaceholder}
            value={note}
          />
          {sharesDoi ? (
            <NexusWorkspaceNotice tone="danger">
              {content.blockedByDoiLabel}
            </NexusWorkspaceNotice>
          ) : null}
          <div className={styles.decisionButtons}>
            <NexusWorkspaceButton
              disabled={!noteReady}
              onClick={() => onDecide(candidate, "changes_requested", note)}
              type="button"
            >
              {content.requestFixLabel}
            </NexusWorkspaceButton>
            <NexusWorkspaceButton
              disabled={!noteReady}
              onClick={() => onDecide(candidate, "rejected", note)}
              tone="danger"
              type="button"
            >
              {content.rejectLabel}
            </NexusWorkspaceButton>
            {match ? (
              <NexusWorkspaceButton
                disabled={!noteReady}
                onClick={() => onDecide(candidate, "merged", note)}
                type="button"
              >
                {content.mergeLabel}
              </NexusWorkspaceButton>
            ) : null}
            <NexusWorkspaceButton
              disabled={sharesDoi || !noteReady}
              onClick={() => onDecide(candidate, "approved_new", note)}
              tone="primary"
              type="button"
            >
              {content.acceptNewLabel}
            </NexusWorkspaceButton>
          </div>
        </section>
      )}
    </NexusWorkspaceDrawer>
  );
}

export function NexusScraperResults({
  content,
}: {
  content: NexusScraperResultsContent;
}) {
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [year, setYear] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [pageSizeValue, setPageSizeValue] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, DecisionRecord>>(
    () => {
      const settled: Record<string, DecisionRecord> = {};
      for (const candidate of content.candidates) {
        if (candidate.status === "completed") {
          const decision =
            candidate.matches.length > 0 ? "merged" : "approved_new";
          settled[candidate.id] = {
            decision,
            label: content.decisionLabels[decision],
            note: "",
          };
        }
      }
      return settled;
    },
  );
  const [corrections, setCorrections] = useState<
    Record<string, CorrectionRecord>
  >({});
  const deferredQuery = useDeferredValue(query);
  const years = useMemo(
    () =>
      Array.from(
        new Set(
          content.candidates.map(getYear).filter((value) => value !== "—"),
        ),
      ).sort((a, b) => b.localeCompare(a)),
    [content.candidates],
  );
  const statusConfig: NexusSelectConfig = {
    defaultValue: "all",
    id: "status",
    label: content.statusFilterLabel,
    options: [
      { label: content.statusOptions[0]?.label ?? "All", value: "all" },
      ...content.statusOptions.slice(1).map((option) => ({
        ...option,
        tone:
          option.value === "completed"
            ? ("completed" as const)
            : option.value === "needs_fix"
              ? ("needs-fix" as const)
              : ("waiting" as const),
      })),
    ],
  };
  const typeConfig: NexusSelectConfig = {
    defaultValue: "all",
    id: "candidate-type",
    label: content.typeFilterLabel,
    options: [
      { label: content.typeOptions[0]?.label ?? "All", value: "all" },
      ...content.typeOptions.slice(1),
    ],
  };
  const yearConfig: NexusSelectConfig = {
    defaultValue: "all",
    id: "year",
    label: content.locale === "en" ? "Year" : "Tahun",
    options: [
      {
        label: content.locale === "en" ? "All years" : "Semua tahun",
        value: "all",
      },
      ...years.map((value) => ({ label: value, value })),
    ],
  };
  const sortConfig: NexusSelectConfig = {
    defaultValue: "newest",
    id: "sort",
    label: content.locale === "en" ? "Sort" : "Urutan",
    options: [
      {
        label: content.locale === "en" ? "Sort: Newest" : "Urutan: Terbaru",
        value: "newest",
      },
      {
        label: content.locale === "en" ? "Sort: Oldest" : "Urutan: Terlama",
        value: "oldest",
      },
      {
        label: content.locale === "en" ? "Title A–Z" : "Judul A–Z",
        value: "title",
      },
    ],
  };
  const pageSizeConfig: NexusSelectConfig = {
    defaultValue: "10",
    id: "candidate-page-size",
    label: content.paginationLabel,
    options: [
      { label: "10 / halaman", value: "10" },
      { label: "20 / halaman", value: "20" },
      { label: "50 / halaman", value: "50" },
    ],
  };
  const sourceTabs = content.sourceTabs.map((tab) => ({
    count:
      tab.id === "all"
        ? content.candidates.length
        : content.candidates.filter((candidate) => candidate.source === tab.id)
            .length,
    id: tab.id,
    label: tab.label,
  }));
  const filtered = useMemo(() => {
    const needle = deferredQuery
      .trim()
      .toLocaleLowerCase(content.locale === "en" ? "en-US" : "id-ID");
    const next = content.candidates.filter((candidate) => {
      const effectiveStatus = getEffectiveStatus(
        candidate,
        decisions[candidate.id],
      );
      return (
        (source === "all" || candidate.source === source) &&
        (status === "all" || effectiveStatus === status) &&
        (type === "all" || candidate.type === type) &&
        (year === "all" || getYear(candidate) === year) &&
        (!needle ||
          `${candidate.title} ${candidate.owner} ${candidate.researcher} ${candidate.doi ?? ""}`
            .toLocaleLowerCase()
            .includes(needle))
      );
    });
    return next.toSorted((a, b) =>
      sort === "title"
        ? a.title.localeCompare(
            b.title,
            content.locale === "en" ? "en-US" : "id-ID",
          )
        : sort === "oldest"
          ? a.discoveredAt.localeCompare(b.discoveredAt)
          : b.discoveredAt.localeCompare(a.discoveredAt),
    );
  }, [
    content.candidates,
    content.locale,
    decisions,
    deferredQuery,
    sort,
    source,
    status,
    type,
    year,
  ]);
  const pageSize = Number(pageSizeValue);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const selected = content.candidates.find(
    (candidate) => candidate.id === openId,
  );
  const effectiveStatuses = content.candidates.map((candidate) =>
    getEffectiveStatus(candidate, decisions[candidate.id]),
  );
  const counts = {
    completed: effectiveStatuses.filter((value) => value === "completed")
      .length,
    needsFix: effectiveStatuses.filter((value) => value === "needs_fix").length,
    waiting: effectiveStatuses.filter((value) => value === "waiting").length,
  };
  const hasActiveFilters =
    source !== "all" ||
    status !== "all" ||
    type !== "all" ||
    year !== "all" ||
    sort !== "newest" ||
    query.length > 0;

  function resetFilters() {
    setSource("all");
    setStatus("all");
    setType("all");
    setYear("all");
    setSort("newest");
    setQuery("");
    setCurrentPage(1);
  }
  function decide(
    candidate: StagedCandidate,
    nextDecision: CandidateDecision,
    note: string,
  ) {
    setDecisions((current) => ({
      ...current,
      [candidate.id]: {
        decision: nextDecision,
        label: content.decisionLabels[nextDecision],
        note,
      },
    }));
    if (nextDecision !== "changes_requested") setOpenId(null);
  }
  function resubmit(
    candidate: StagedCandidate,
    values: Record<string, string>,
  ) {
    setCorrections((current) => ({
      ...current,
      [candidate.id]: {
        values,
        version: (current[candidate.id]?.version ?? 1) + 1,
      },
    }));
    setDecisions((current) => {
      const next = { ...current };
      delete next[candidate.id];
      return next;
    });
  }

  const rows = visible.map((candidate) => {
    const decision = decisions[candidate.id];
    const effectiveStatus = getEffectiveStatus(candidate, decision);
    const tone = statusTone(effectiveStatus);
    const statusLabel = decision?.label ?? candidate.statusLabel;
    const matchTone =
      candidate.match.score === null
        ? "neutral"
        : candidate.match.score >= 90
          ? "danger"
          : "waiting";
    const open = () => setOpenId(candidate.id);
    const action = (
      <NexusWorkspaceTableAction
        key={`${candidate.id}-action`}
        label={`${content.reviewLabel}: ${candidate.title}`}
        onClick={open}
      >
        {content.reviewLabel}
      </NexusWorkspaceTableAction>
    );
    return {
      id: candidate.id,
      cells: {
        primary: (
          <NexusWorkspaceTablePrimary
            onClick={open}
            subtitle={candidate.researcher}
            title={candidate.title}
          />
        ),
        type: candidate.typeLabel,
        source: (
          <NexusWorkspaceTableBadge tone={sourceTone(candidate.source)}>
            {candidate.sourceLabel}
          </NexusWorkspaceTableBadge>
        ),
        match: (
          <NexusWorkspaceTableSignal
            primary={
              candidate.match.score === null
                ? content.noMatchLabel
                : `${candidate.match.score}%`
            }
            secondary={
              candidate.match.score === null
                ? undefined
                : candidate.match.verdictLabel
            }
            tone={matchTone}
          />
        ),
        owner: candidate.owner,
        found: (
          <time dateTime={candidate.discoveredAt}>
            {candidate.discoveredAtLabel}
          </time>
        ),
        status: (
          <NexusWorkspaceTableBadge tone={tone}>
            {statusLabel}
          </NexusWorkspaceTableBadge>
        ),
        action,
      },
      mobile: (
        <NexusWorkspaceMobileCard
          action={
            <NexusWorkspaceMobileAction
              label={`${content.reviewLabel}: ${candidate.title}`}
              onClick={open}
            >
              {content.reviewLabel}
            </NexusWorkspaceMobileAction>
          }
          eyebrow={
            <>
              <NexusWorkspaceTableBadge tone={sourceTone(candidate.source)}>
                {candidate.sourceLabel}
              </NexusWorkspaceTableBadge>
              <NexusWorkspaceTableBadge tone={tone}>
                {statusLabel}
              </NexusWorkspaceTableBadge>
            </>
          }
          meta={
            <dl>
              <div>
                <dt>{content.columns.type}</dt>
                <dd>{candidate.typeLabel}</dd>
              </div>
              <div>
                <dt>{content.columns.match}</dt>
                <dd>
                  {candidate.match.score === null
                    ? content.noMatchLabel
                    : `${candidate.match.score}% · ${candidate.match.verdictLabel}`}
                </dd>
              </div>
              <div>
                <dt>{content.columns.owner}</dt>
                <dd>{candidate.owner}</dd>
              </div>
              <div>
                <dt>{content.columns.discoveredAt}</dt>
                <dd>{candidate.discoveredAtLabel}</dd>
              </div>
            </dl>
          }
          title={candidate.title}
        >
          <p className={styles.mobileSubtitle}>{candidate.researcher}</p>
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="candidates-description"
      title={
        content.locale === "en"
          ? "Cross-domain Reviews"
          : "Tinjauan Kegiatan & Karya"
      }
      titleId="candidates-title"
    >
      <NexusWorkspaceMetrics
        metrics={[
          {
            icon: <ReviewIcon name="waiting" />,
            id: "waiting",
            label:
              content.locale === "en" ? "Awaiting Review" : "Menunggu Tinjauan",
            tone: "waiting",
            unit: content.locale === "en" ? "records" : "data",
            value: counts.waiting,
          },
          {
            icon: <ReviewIcon name="fix" />,
            id: "fix",
            label: content.locale === "en" ? "Needs Fixing" : "Perlu Perbaikan",
            tone: "needs-fix",
            unit: content.locale === "en" ? "records" : "data",
            value: counts.needsFix,
          },
          {
            icon: <ReviewIcon name="completed" />,
            id: "completed",
            label: content.locale === "en" ? "Reviewed" : "Selesai Ditinjau",
            tone: "completed",
            unit: content.locale === "en" ? "records" : "data",
            value: counts.completed,
          },
        ]}
      />
      <div className={styles.filters}>
        <NexusWorkspaceTabs
          activeId={source}
          label={
            content.locale === "en"
              ? "Filter by source"
              : "Filter berdasarkan sumber"
          }
          onActiveChange={(value) => {
            setSource(value);
            setCurrentPage(1);
          }}
          panelId="cross-domain-source-panel"
          tabs={sourceTabs}
        />
        <div
          className={styles.toolbar}
          id="cross-domain-source-panel"
          role="tabpanel"
        >
          <NexusWorkspaceSearch
            label={content.searchLabel}
            name="cross-domain-search"
            onValueChange={(value) => {
              setQuery(value);
              setCurrentPage(1);
            }}
            placeholder={content.searchPlaceholder}
            value={query}
          />
          {[statusConfig, typeConfig, yearConfig, sortConfig].map((config) => (
            <NexusWorkspaceSelect
              config={config}
              isOpen={openFilterId === config.id}
              key={config.id}
              name={`cross-domain-${config.id}`}
              onOpenChange={(isOpen) =>
                setOpenFilterId(isOpen ? config.id : null)
              }
              onValueChange={(value) => {
                if (config.id === "status") setStatus(value);
                else if (config.id === "candidate-type") setType(value);
                else if (config.id === "year") setYear(value);
                else setSort(value);
                setCurrentPage(1);
              }}
              placement="top-on-narrow"
              value={
                config.id === "status"
                  ? status
                  : config.id === "candidate-type"
                    ? type
                    : config.id === "year"
                      ? year
                      : sort
              }
            />
          ))}
        </div>
        <div aria-live="polite" className={styles.resultMeta}>
          <p>
            {query !== deferredQuery
              ? content.loadingLabel
              : `${filtered.length} ${content.resultCountLabel}`}
          </p>
          {hasActiveFilters ? (
            <button onClick={resetFilters} type="button">
              {content.resetFiltersLabel}
            </button>
          ) : null}
        </div>
        <NexusWorkspaceTableSection
          guidance={
            content.locale === "en"
              ? "Signals help find related records; reviewers still verify metadata, sources, and evidence before deciding."
              : "Sinyal membantu menemukan rekam terkait; reviewer tetap memeriksa metadata, sumber, dan bukti sebelum mengambil keputusan."
          }
          summary={`${sourceTabs.find((tab) => tab.id === source)?.label ?? "Semua"}: ${filtered.length} ${content.locale === "en" ? "matching records" : "data sesuai filter"}`}
          title={content.candidatesTitle}
          titleId="cross-domain-queue-title"
        >
          <NexusWorkspaceRecordTable
            caption={content.tableCaption}
            columns={columns}
            empty={
              <div className={styles.emptyState}>
                <strong>{content.emptyFilterLabel}</strong>
                <p>
                  {content.locale === "en"
                    ? "Change the keyword or filters to see another candidate."
                    : "Ubah kata kunci atau filter untuk melihat kandidat lain."}
                </p>
                {hasActiveFilters ? (
                  <NexusWorkspaceButton onClick={resetFilters} type="button">
                    {content.resetFiltersLabel}
                  </NexusWorkspaceButton>
                ) : null}
              </div>
            }
            isLoading={query !== deferredQuery}
            pagination={
              <NexusTablePagination
                currentPage={currentPage}
                itemCount={filtered.length}
                navigationLabel={content.paginationLabel}
                nextPageLabel={
                  content.locale === "en" ? "Next page" : "Halaman berikutnya"
                }
                onPageChange={setCurrentPage}
                onPageSizeChange={(value) => {
                  setPageSizeValue(value);
                  setCurrentPage(1);
                }}
                pageLabel={content.locale === "en" ? "Page" : "Halaman"}
                pageSizeConfig={pageSizeConfig}
                pageSizeValue={pageSizeValue}
                previousPageLabel={
                  content.locale === "en"
                    ? "Previous page"
                    : "Halaman sebelumnya"
                }
                rangePrefix={
                  content.locale === "en" ? "Showing" : "Menampilkan"
                }
                totalUnit={content.locale === "en" ? "records" : "data"}
              />
            }
            rows={rows}
          />
        </NexusWorkspaceTableSection>
        <p className={styles.footnote}>{content.promoteNote}</p>
      </div>
      {selected ? (
        <CandidateDrawer
          candidate={selected}
          content={content}
          correction={corrections[selected.id]}
          decision={decisions[selected.id]}
          key={`${selected.id}-${corrections[selected.id]?.version ?? 0}-${decisions[selected.id]?.decision ?? "open"}`}
          onClose={() => setOpenId(null)}
          onDecide={decide}
          onResubmit={resubmit}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
