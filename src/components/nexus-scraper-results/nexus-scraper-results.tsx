"use client";

import { useMemo, useState } from "react";
import styles from "@/components/nexus-scraper-results/nexus-scraper-results.module.css";
import type {
  NexusScraperResultsContent,
  StagedCandidate,
} from "@/components/nexus-scraper-results/nexus-scraper-results-content";
import {
  WorkspaceFootnote,
  WorkspacePage,
  WorkspacePageHeader,
  WorkspacePanel,
} from "@/components/nexus-workspace-page/nexus-workspace-page";
import shell from "@/components/nexus-workspace-page/nexus-workspace-page.module.css";
import {
  SortableColumn,
  useTableSort,
} from "@/components/nexus-workspace-page/nexus-workspace-sort";

type SortKey = "discoveredAt" | "match" | "status" | "title";

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

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

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

      return [candidate.title, candidate.owner, candidate.researcher]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [content.candidates, query, source, status, type]);

  const sorted = sortRows(filtered, readCandidate);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function reset(apply: () => void) {
    apply();
    setPage(1);
    setOpenId(null);
  }

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        description={content.description}
        title={content.title}
      />

      <WorkspacePanel flush id="scraper-queue" title={content.candidatesTitle}>
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
            <span className={styles.visuallyHidden}>{content.searchLabel}</span>
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

        <div className={shell.tableWrap}>
          <table className={shell.table}>
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
                    {content.emptyLabel}
                  </td>
                </tr>
              ) : null}

              {visible.map((candidate) => (
                <CandidateRows
                  candidate={candidate}
                  content={content}
                  isOpen={openId === candidate.id}
                  key={candidate.id}
                  onToggle={() =>
                    setOpenId(openId === candidate.id ? null : candidate.id)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>

        <nav aria-label={content.paginationLabel} className={styles.pagination}>
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
      </WorkspacePanel>

      <WorkspaceFootnote>{content.promoteNote}</WorkspaceFootnote>
    </WorkspacePage>
  );
}

type CandidateRowsProps = {
  candidate: StagedCandidate;
  content: NexusScraperResultsContent;
  isOpen: boolean;
  onToggle: () => void;
};

function CandidateRows({
  candidate,
  content,
  isOpen,
  onToggle,
}: CandidateRowsProps) {
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
            <strong>
              {candidate.match.score === null
                ? content.noMatchLabel
                : `${candidate.match.score}%`}
            </strong>
            <span>{candidate.match.verdictLabel}</span>
          </span>
        </td>
        <td data-label={content.columns.owner}>{candidate.owner}</td>
        <td data-label={content.columns.status}>
          <span className={styles.status} data-status={candidate.status}>
            {candidate.statusLabel}
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

            <div className={styles.detailFooter}>
              <a
                className={styles.sourceLink}
                href={candidate.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                {content.sourceUrlLabel}
              </a>

              <div className={styles.decisionButtons}>
                <button className={shell.ghostButton} type="button">
                  {content.rejectLabel}
                </button>
                {candidate.match.comparisonCount > 0 ? (
                  <button className={shell.ghostButton} type="button">
                    {content.mergeLabel}
                  </button>
                ) : null}
                <button className={shell.primaryButton} type="button">
                  {content.acceptNewLabel}
                </button>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
