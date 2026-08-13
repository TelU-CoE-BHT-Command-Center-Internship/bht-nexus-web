"use client";

import { useDeferredValue, useMemo, useState } from "react";
import styles from "@/components/nexus-scraper-results/nexus-scraper-results.module.css";
import type {
  CandidateDecision,
  NexusScraperResultsContent,
  StagedCandidate,
} from "@/components/nexus-scraper-results/nexus-scraper-results-content";
import { normalizeDoi } from "@/components/nexus-scraper-results/nexus-scraper-review";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import shell from "@/components/nexus-workspace-ui/nexus-workspace-page.module.css";
import {
  NexusWorkspaceFootnote,
  NexusWorkspacePanel,
  NexusWorkspaceStack,
} from "@/components/nexus-workspace-ui/nexus-workspace-panel";
import {
  SortableColumn,
  useTableSort,
} from "@/components/nexus-workspace-ui/nexus-workspace-sort";

type SortKey = "discoveredAt" | "match" | "status" | "title";

type DecisionRecord = {
  decision: CandidateDecision;
  label: string;
  note: string;
};

type NexusScraperResultsProps = {
  content: NexusScraperResultsContent;
};

function readCandidate(candidate: StagedCandidate, key: SortKey) {
  if (key === "match") {
    return String(candidate.match.score ?? -1).padStart(4, "0");
  }

  if (key === "status") {
    return candidate.statusLabel;
  }

  if (key === "discoveredAt") {
    return candidate.discoveredAt;
  }

  return candidate.title;
}

export function NexusScraperResults({ content }: NexusScraperResultsProps) {
  const { sort, sortRows, toggle } = useTableSort<SortKey>("discoveredAt");
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, DecisionRecord>>(
    () => {
      const settled: Record<string, DecisionRecord> = {};

      for (const candidate of content.candidates) {
        if (candidate.status !== "completed") {
          continue;
        }

        const decision =
          candidate.matches.length > 0 ? "merged" : "approved_new";
        settled[candidate.id] = {
          decision,
          label: content.decisionLabels[decision],
          note: "",
        };
      }

      return settled;
    },
  );

  const deferredQuery = useDeferredValue(query);
  const isPending = deferredQuery !== query;

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLocaleLowerCase("id-ID");

    return content.candidates.filter((candidate) => {
      if (source !== "all" && candidate.source !== source) {
        return false;
      }
      if (status !== "all" && candidate.status !== status) {
        return false;
      }
      if (type !== "all" && candidate.type !== type) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }

      return [
        candidate.title,
        candidate.owner,
        candidate.researcher,
        candidate.doi ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("id-ID")
        .includes(needle);
    });
  }, [content.candidates, deferredQuery, source, status, type]);

  const sorted = sortRows(filtered, readCandidate);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const isFiltered =
    source !== "all" || status !== "all" || type !== "all" || query.length > 0;

  function reset(apply: () => void) {
    apply();
    setPage(1);
    setOpenId(null);
  }

  function resetFilters() {
    reset(() => {
      setSource("all");
      setStatus("all");
      setType("all");
      setQuery("");
    });
  }

  function decide(
    candidate: StagedCandidate,
    decision: CandidateDecision,
    note: string,
  ) {
    setDecisions((current) => ({
      ...current,
      [candidate.id]: {
        decision,
        label: content.decisionLabels[decision],
        note,
      },
    }));
    setOpenId(null);
  }

  return (
    <NexusWorkspacePage
      description={content.description}
      descriptionId="candidates-description"
      title={content.title}
      titleId="candidates-title"
    >
      <NexusWorkspaceStack>
        <NexusWorkspacePanel
          flush
          id="scraper-queue"
          title={content.candidatesTitle}
        >
          <div className={styles.tabs}>
            {content.sourceTabs.map((tab) => (
              <button
                aria-pressed={source === tab.id}
                className={styles.tab}
                key={tab.id}
                onClick={() => reset(() => setSource(tab.id))}
                type="button"
              >
                {tab.label}
                <span className={styles.tabCount}>{tab.count}</span>
              </button>
            ))}
          </div>

          <div className={styles.toolbar}>
            <label className={styles.searchField} htmlFor="candidate-search">
              <span className={styles.visuallyHidden}>
                {content.searchLabel}
              </span>
              <input
                id="candidate-search"
                onChange={(event) => reset(() => setQuery(event.target.value))}
                placeholder={content.searchPlaceholder}
                type="search"
                value={query}
              />
            </label>

            <label className={styles.filterField} htmlFor="candidate-status">
              <span>{content.statusFilterLabel}</span>
              <select
                id="candidate-status"
                onChange={(event) => reset(() => setStatus(event.target.value))}
                value={status}
              >
                {content.statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField} htmlFor="candidate-type">
              <span>{content.typeFilterLabel}</span>
              <select
                id="candidate-type"
                onChange={(event) => reset(() => setType(event.target.value))}
                value={type}
              >
                {content.typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p aria-live="polite" className={styles.resultCount}>
            {isPending
              ? content.loadingLabel
              : `${sorted.length} ${content.resultCountLabel}`}
          </p>

          <div className={shell.tableWrap}>
            <table className={shell.table}>
              <caption className={styles.visuallyHidden}>
                {content.tableCaption}
              </caption>
              <thead>
                <tr>
                  <SortableColumn
                    activeKey={sort.key}
                    direction={sort.direction}
                    label={content.columns.title}
                    onSort={toggle}
                    sortKey="title"
                  />
                  <th scope="col">{content.columns.type}</th>
                  <th scope="col">{content.columns.source}</th>
                  <SortableColumn
                    activeKey={sort.key}
                    direction={sort.direction}
                    label={content.columns.match}
                    onSort={toggle}
                    sortKey="match"
                  />
                  <th scope="col">{content.columns.owner}</th>
                  <SortableColumn
                    activeKey={sort.key}
                    direction={sort.direction}
                    label={content.columns.status}
                    onSort={toggle}
                    sortKey="status"
                  />
                  <SortableColumn
                    activeKey={sort.key}
                    direction={sort.direction}
                    label={content.columns.discoveredAt}
                    onSort={toggle}
                    sortKey="discoveredAt"
                  />
                  <th scope="col">{content.columns.action}</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td className={styles.emptyCell} colSpan={8}>
                      <p>{content.emptyFilterLabel}</p>
                      {isFiltered ? (
                        <button
                          className={shell.ghostButton}
                          onClick={resetFilters}
                          type="button"
                        >
                          {content.resetFiltersLabel}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ) : null}

                {visible.map((candidate) => (
                  <CandidateRows
                    candidate={candidate}
                    content={content}
                    decision={decisions[candidate.id]}
                    isOpen={openId === candidate.id}
                    key={candidate.id}
                    onDecide={decide}
                    onToggle={() =>
                      setOpenId(openId === candidate.id ? null : candidate.id)
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>

          <nav
            aria-label={content.paginationLabel}
            className={styles.pagination}
          >
            <label className={styles.pageSize} htmlFor="candidate-page-size">
              <span className={styles.visuallyHidden}>
                {content.paginationLabel}
              </span>
              <select
                id="candidate-page-size"
                onChange={(event) =>
                  reset(() => setPageSize(Number(event.target.value)))
                }
                value={String(pageSize)}
              >
                {content.pageSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.pageButtons}>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    aria-current={number === currentPage ? "page" : undefined}
                    className={styles.pageButton}
                    key={number}
                    onClick={() => {
                      setPage(number);
                      setOpenId(null);
                    }}
                    type="button"
                  >
                    {number}
                  </button>
                ),
              )}
            </div>
          </nav>
        </NexusWorkspacePanel>

        <NexusWorkspaceFootnote>{content.promoteNote}</NexusWorkspaceFootnote>
      </NexusWorkspaceStack>
    </NexusWorkspacePage>
  );
}

type CandidateRowsProps = {
  candidate: StagedCandidate;
  content: NexusScraperResultsContent;
  decision?: DecisionRecord;
  isOpen: boolean;
  onDecide: (
    candidate: StagedCandidate,
    decision: CandidateDecision,
    note: string,
  ) => void;
  onToggle: () => void;
};

function CandidateRows({
  candidate,
  content,
  decision,
  isOpen,
  onDecide,
  onToggle,
}: CandidateRowsProps) {
  const [note, setNote] = useState("");
  const [confirmingReject, setConfirmingReject] = useState(false);

  const match = candidate.matches[0];
  const sharesDoi = Boolean(
    candidate.doi && match?.doi && normalizeDoi(candidate.doi) === match.doi,
  );

  return (
    <>
      <tr className={styles.row} data-open={isOpen}>
        <th scope="row">
          {candidate.title}
          <span className={styles.researcher}>{candidate.researcher}</span>
        </th>
        <td data-label={content.columns.type}>{candidate.typeLabel}</td>
        <td data-label={content.columns.source}>{candidate.sourceLabel}</td>
        <td data-label={content.columns.match}>
          <span className={styles.match} data-verdict={candidate.match.verdict}>
            {candidate.match.score === null ? (
              <strong>{content.noMatchLabel}</strong>
            ) : (
              <>
                <strong>{candidate.match.score}%</strong>
                <span>{candidate.match.verdictLabel}</span>
              </>
            )}
          </span>
        </td>
        <td data-label={content.columns.owner}>{candidate.owner}</td>
        <td data-label={content.columns.status}>
          <span
            className={styles.status}
            data-status={decision ? "completed" : candidate.status}
          >
            {decision ? decision.label : candidate.statusLabel}
          </span>
        </td>
        <td data-label={content.columns.discoveredAt}>
          <time dateTime={candidate.discoveredAt}>
            {candidate.discoveredAtLabel}
          </time>
        </td>
        <td data-label={content.columns.action}>
          <button
            aria-expanded={isOpen}
            aria-label={`${content.reviewLabel}: ${candidate.title}`}
            className={shell.ghostButton}
            onClick={onToggle}
            type="button"
          >
            {content.reviewLabel}
          </button>
        </td>
      </tr>

      {isOpen ? (
        <tr className={styles.detailRow}>
          <td colSpan={8}>
            <dl className={styles.detailGrid}>
              {candidate.details.map((detail) => (
                <div className={styles.detailEntry} key={detail.id}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>

            {match ? (
              <details className={`${shell.disclosure} ${styles.block}`}>
                <summary>{content.comparisonTitle}</summary>
                <div className={shell.disclosureBody}>
                  <table className={styles.comparisonTable}>
                    <thead>
                      <tr>
                        <th scope="col">{content.comparisonColumns.field}</th>
                        <th scope="col">
                          {content.comparisonColumns.candidate}
                        </th>
                        <th scope="col">
                          {content.comparisonColumns.official}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {match.comparisons.map((row) => (
                        <tr key={row.id}>
                          <th scope="row">{row.label}</th>
                          <td>{row.candidateValue}</td>
                          <td>
                            <span
                              className={styles.comparisonValue}
                              data-status={row.status}
                            >
                              {row.officialValue}
                            </span>
                            <span className={styles.comparisonStatus}>
                              {row.statusLabel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ) : null}

            <details className={`${shell.disclosure} ${styles.block}`}>
              <summary>
                {content.timelineTitle} ({candidate.timeline.length})
              </summary>
              <ol className={`${shell.disclosureBody} ${styles.timeline}`}>
                {candidate.timeline.map((entry) => (
                  <li key={entry.id}>
                    <p>{entry.label}</p>
                    <span>
                      {entry.actor} · {entry.timeLabel}
                    </span>
                  </li>
                ))}
              </ol>
            </details>

            <div className={styles.detailFooter}>
              <a
                className={styles.sourceLink}
                href={candidate.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                {content.sourceUrlLabel}
              </a>

              {decision ? (
                <p aria-live="polite" className={styles.decided}>
                  {content.decidedLabel}: {decision.label}
                  {decision.note ? ` · ${decision.note}` : ""}
                </p>
              ) : (
                <div className={styles.decisionArea}>
                  <label
                    className={styles.noteField}
                    htmlFor={`note-${candidate.id}`}
                  >
                    <span>{content.noteLabel}</span>
                    <input
                      id={`note-${candidate.id}`}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder={content.notePlaceholder}
                      type="text"
                      value={note}
                    />
                  </label>

                  {sharesDoi ? (
                    <p className={styles.blocked}>
                      {content.blockedByDoiLabel}
                    </p>
                  ) : null}

                  <div className={styles.decisionButtons}>
                    <button
                      className={shell.ghostButton}
                      onClick={() =>
                        confirmingReject
                          ? onDecide(candidate, "rejected", note)
                          : setConfirmingReject(true)
                      }
                      type="button"
                    >
                      {confirmingReject
                        ? content.confirmRejectLabel
                        : content.rejectLabel}
                    </button>

                    {match ? (
                      <button
                        className={shell.ghostButton}
                        onClick={() => onDecide(candidate, "merged", note)}
                        type="button"
                      >
                        {content.mergeLabel}
                      </button>
                    ) : null}

                    <button
                      className={shell.primaryButton}
                      disabled={sharesDoi}
                      onClick={() => onDecide(candidate, "approved_new", note)}
                      type="button"
                    >
                      {content.acceptNewLabel}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
