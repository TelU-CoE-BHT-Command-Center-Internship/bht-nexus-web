"use client";

import Image from "next/image";
import badgeStyles from "@/components/nexus-publications/nexus-publication-badges.module.css";
import type { OfficialPublication } from "@/components/nexus-publications/nexus-publications-content";
import { NexusPublicationsIcon } from "@/components/nexus-publications/nexus-publications-icons";
import styles from "@/components/nexus-publications/nexus-publications-table.module.css";
import {
  getPrimaryPublicationSource,
  getPublicationSourceId,
  type PublicationSourceId,
} from "@/components/nexus-publications/nexus-publications-utils";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import type { NexusSelectConfig } from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";

type NexusPublicationsTableProps = {
  activeSourceLabel: string;
  activeSourceId: PublicationSourceId;
  completionProposalIds: readonly string[];
  currentPage: number;
  guidance: string;
  hasActiveFilters: boolean;
  isLoading: boolean;
  onOpenPublication: (publicationId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: string) => void;
  onResetFilters: () => void;
  pageSizeValue: string;
  publications: readonly OfficialPublication[];
  sourcePublicationCount: number;
  totalPublicationCount: number;
};

const loadingRowIds = ["row-a", "row-b", "row-c", "row-d", "row-e", "row-f"];
const loadingCellIds = [
  "title",
  "type",
  "source",
  "owner",
  "year",
  "citations",
  "quality",
  "action",
];
const mobileLoadingIds = ["mobile-a", "mobile-b", "mobile-c"];

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "publication-page-size",
  label: "Jumlah data per halaman",
  options: [
    { label: "10 / halaman", value: "10" },
    { label: "20 / halaman", value: "20" },
    { label: "50 / halaman", value: "50" },
  ],
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M4 10h12M10.5 4.5 16 10l-5.5 5.5" />
    </svg>
  );
}

function DetailIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M3 4.5h14v11H3zM6 8h8M6 11.5h5" />
      <path d="m13 14.5 2-2 1.5 1.5-2 2H13z" />
    </svg>
  );
}

function LoadingRows() {
  return (
    <>
      {loadingRowIds.map((rowId) => (
        <tr className={styles.loadingRow} key={rowId}>
          {loadingCellIds.map((cellId) => (
            <td key={`${rowId}-${cellId}`}>
              <span />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function SourceBadge({
  preferredSourceId,
  publication,
}: {
  preferredSourceId: PublicationSourceId;
  publication: OfficialPublication;
}) {
  const source =
    publication.provenance.find(
      (item) => getPublicationSourceId(item.source) === preferredSourceId,
    )?.source ?? getPrimaryPublicationSource(publication);
  const additionalSourceCount = publication.provenance.length - 1;

  return (
    <span className={styles.sourceGroup}>
      <span
        className={badgeStyles.sourceBadge}
        data-source={getPublicationSourceId(source)}
      >
        {source}
      </span>
      {additionalSourceCount > 0 ? (
        <small>+{additionalSourceCount} sumber</small>
      ) : null}
    </span>
  );
}

function QualitySignal({
  hasProposal,
  publication,
}: {
  hasProposal: boolean;
  publication: OfficialPublication;
}) {
  return (
    <span className={styles.qualitySignal}>
      <span
        className={badgeStyles.qualityBadge}
        data-quality={publication.quality}
      >
        {publication.quality}
      </span>
      {hasProposal ? <small>Pelengkapan diajukan</small> : null}
    </span>
  );
}

export function NexusPublicationsTable({
  activeSourceLabel,
  activeSourceId,
  completionProposalIds,
  currentPage,
  guidance,
  hasActiveFilters,
  isLoading,
  onOpenPublication,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
  pageSizeValue,
  publications,
  sourcePublicationCount,
  totalPublicationCount,
}: NexusPublicationsTableProps) {
  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(1, Math.ceil(publications.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const visiblePublications = publications.slice(
    startIndex,
    startIndex + pageSize,
  );

  return (
    <NexusWorkspaceTableSection
      guidance={guidance}
      summary={`${activeSourceLabel}: ${publications.length} sesuai filter dari ${sourcePublicationCount} publikasi sumber`}
      title="Daftar publikasi resmi"
      titleId="official-publications-title"
    >
      <div className={styles.desktopTable}>
        <table>
          <caption className={styles.visuallyHidden}>
            Publikasi resmi BHT Nexus
          </caption>
          <thead>
            <tr>
              <th>Publikasi</th>
              <th>Jenis</th>
              <th>Sumber</th>
              <th>Pemilik</th>
              <th>Tahun</th>
              <th>Sitasi</th>
              <th>Kelengkapan</th>
              <th className={styles.actionHeading} scope="col">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <LoadingRows /> : null}
            {!isLoading
              ? visiblePublications.map((publication) => (
                  <tr key={publication.id}>
                    <td className={styles.titleCell}>
                      <button
                        onClick={() => onOpenPublication(publication.id)}
                        type="button"
                      >
                        <strong>{publication.title}</strong>
                        <span>{publication.authors.join("; ")}</span>
                      </button>
                    </td>
                    <td>
                      <span className={styles.publicationType}>
                        {publication.type}
                      </span>
                    </td>
                    <td>
                      <SourceBadge
                        preferredSourceId={activeSourceId}
                        publication={publication}
                      />
                    </td>
                    <td>
                      <span className={styles.owner}>
                        <Image
                          alt=""
                          height={32}
                          sizes="2rem"
                          src={publication.owner.avatarSrc}
                          width={32}
                        />
                        <span>{publication.owner.name}</span>
                      </span>
                    </td>
                    <td>
                      <span className={styles.year}>{publication.year}</span>
                    </td>
                    <td>
                      <span
                        className={styles.citationSignal}
                        data-empty={publication.citations === null}
                      >
                        <strong>{publication.citations ?? "—"}</strong>
                        <span>
                          {publication.citations === null
                            ? "penyedia belum ditetapkan"
                            : `${publication.citationProvider} · berkala`}
                        </span>
                      </span>
                    </td>
                    <td>
                      <QualitySignal
                        hasProposal={completionProposalIds.includes(
                          publication.id,
                        )}
                        publication={publication}
                      />
                    </td>
                    <td className={styles.actionCell}>
                      <button
                        aria-label={`Lihat rincian publikasi: ${publication.title}`}
                        className={styles.actionButton}
                        onClick={() => onOpenPublication(publication.id)}
                        type="button"
                      >
                        <DetailIcon />
                        <span>Rincian</span>
                      </button>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      {!isLoading ? (
        <div className={styles.mobileList}>
          {visiblePublications.map((publication) => (
            <article className={styles.mobileCard} key={publication.id}>
              <div className={styles.mobileCardTop}>
                <SourceBadge
                  preferredSourceId={activeSourceId}
                  publication={publication}
                />
                <QualitySignal
                  hasProposal={completionProposalIds.includes(publication.id)}
                  publication={publication}
                />
              </div>
              <h4>{publication.title}</h4>
              <p className={styles.mobileAuthors}>
                {publication.authors.join("; ")}
              </p>
              <span
                className={styles.mobileCitation}
                data-empty={publication.citations === null}
              >
                <strong>{publication.citations ?? "—"}</strong>
                <span>
                  {publication.citations === null
                    ? "penyedia belum ditetapkan"
                    : `${publication.citationProvider} · berkala`}
                </span>
              </span>
              <dl className={styles.mobileMeta}>
                <div>
                  <dt>Jenis</dt>
                  <dd>{publication.type}</dd>
                </div>
                <div>
                  <dt>Tahun</dt>
                  <dd>{publication.year}</dd>
                </div>
                <div>
                  <dt>Pemilik</dt>
                  <dd>{publication.owner.name}</dd>
                </div>
              </dl>
              <button
                className={styles.mobileDetailButton}
                onClick={() => onOpenPublication(publication.id)}
                type="button"
              >
                Lihat rincian <ArrowIcon />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <output aria-label="Memuat publikasi" className={styles.mobileLoading}>
          {mobileLoadingIds.map((loadingId) => (
            <span key={loadingId} />
          ))}
        </output>
      )}

      {!isLoading && visiblePublications.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <NexusPublicationsIcon name="book" />
          </span>
          <strong>
            {totalPublicationCount === 0
              ? "Belum ada publikasi resmi"
              : "Tidak ada publikasi yang cocok"}
          </strong>
          <p>
            {totalPublicationCount === 0
              ? "Publikasi akan muncul setelah kandidat disetujui melalui proses tinjauan."
              : "Ubah kata kunci atau filter untuk melihat rekam resmi lain."}
          </p>
          {hasActiveFilters ? (
            <button onClick={onResetFilters} type="button">
              Atur ulang filter
            </button>
          ) : null}
        </div>
      ) : null}

      <NexusTablePagination
        currentPage={safeCurrentPage}
        itemCount={publications.length}
        navigationLabel="Navigasi halaman publikasi"
        nextPageLabel="Halaman berikutnya"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageLabel="Halaman"
        pageSizeConfig={pageSizeConfig}
        pageSizeValue={pageSizeValue}
        previousPageLabel="Halaman sebelumnya"
        rangePrefix="Menampilkan"
        totalUnit="data"
      />
    </NexusWorkspaceTableSection>
  );
}
