"use client";

import {
  importActionCopy,
  importHouseLabels,
  importIssueColumn,
  importIssuesByPriority,
  importRowEvidence,
  importRowFields,
  importRowRecordType,
  importRowSource,
  importRowTitle,
  importRowYear,
} from "@/components/nexus-import/nexus-import-model";
import detail from "@/components/nexus-workspace-ui/nexus-workspace-detail.module.css";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import { NexusWorkspaceTableBadge } from "@/components/nexus-workspace-ui/nexus-workspace-records";
import type { ImportIssue, ImportRow } from "@/lib/api-imports";

const issueKindLabels: Record<ImportIssue["kind"], string> = {
  change: "Perubahan",
  duplicate: "Sudah ada",
  error: "Harus diperbaiki",
  warning: "Perlu diperhatikan",
};

export function NexusImportRowDetail({
  onClose,
  row,
}: {
  onClose: () => void;
  row: ImportRow;
}) {
  const action = importActionCopy[row.action];
  const fields = importRowFields(row);
  const evidence = importRowEvidence(row);
  const issues = importIssuesByPriority(row.issues);
  const sourceValues = Object.entries(row.sourceValues ?? {});

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup rincian baris impor"
      description="Periksa isian yang dibaca dari berkas, catatan pemeriksaan, dan nilai asli pada lembar sebelum mengirimnya ke Tinjauan."
      eyebrow={importRowSource(row)}
      onClose={onClose}
      title="Rincian baris impor"
    >
      <section
        aria-labelledby="import-row-overview-title"
        className={detail.overview}
      >
        <div className={detail.overviewTop}>
          <div>
            <NexusWorkspaceTableBadge tone={action.tone}>
              {action.label}
            </NexusWorkspaceTableBadge>
            {row.targetEntity ? (
              <NexusWorkspaceTableBadge tone="info">
                {importHouseLabels[row.targetEntity]}
              </NexusWorkspaceTableBadge>
            ) : null}
          </div>
        </div>
        <h3 id="import-row-overview-title">{importRowTitle(row)}</h3>
        <p>{importRowRecordType(row) ?? "Jenis rekam belum diketahui"}</p>
        <dl className={detail.metaGrid}>
          <div className={detail.metaItem}>
            <dt>Asal</dt>
            <dd>{importRowSource(row)}</dd>
          </div>
          <div className={detail.metaItem}>
            <dt>Tahun</dt>
            <dd>{importRowYear(row)}</dd>
          </div>
          <div className={detail.metaItem}>
            <dt>Bukti</dt>
            <dd>
              {evidence ? (
                <a href={evidence} rel="noreferrer" target="_blank">
                  Buka tautan bukti
                </a>
              ) : (
                "Belum ada"
              )}
            </dd>
          </div>
          <div className={detail.metaItem}>
            <dt>Catatan</dt>
            <dd>{issues.length}</dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="import-row-issues-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>01</span>
            <h3 id="import-row-issues-title">Catatan pemeriksaan</h3>
          </div>
          <p>Diurutkan dari yang harus diperbaiki</p>
        </div>
        <ul className={detail.kmLinkList}>
          {issues.length === 0 ? (
            <li data-empty="true">
              <strong>Tidak ada catatan</strong>
              <small>Baris ini dapat dikirim ke Tinjauan apa adanya.</small>
            </li>
          ) : (
            issues.map((issue, index) => (
              <li key={`${issue.column}-${issue.reason}-${index}`}>
                <strong>
                  {issueKindLabels[issue.kind]} · {importIssueColumn(issue)}:{" "}
                  {issue.reason}
                </strong>
                <small>{issue.suggestion}</small>
              </li>
            ))
          )}
        </ul>
      </section>

      <section
        aria-labelledby="import-row-fields-title"
        className={detail.detailSection}
      >
        <div className={detail.sectionHeading}>
          <div>
            <span className={detail.sectionIndex}>02</span>
            <h3 id="import-row-fields-title">Isian yang akan dikirim</h3>
          </div>
          <p>Sama dengan isian formulir Ajukan</p>
        </div>
        {fields.length === 0 ? (
          <p className={detail.explanation}>
            Belum ada isian yang dapat dibaca dari baris ini.
          </p>
        ) : (
          <dl className={detail.metadataDetails}>
            {fields.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {sourceValues.length > 0 ? (
        <section
          aria-labelledby="import-row-source-title"
          className={detail.detailSection}
        >
          <div className={detail.sectionHeading}>
            <div>
              <span className={detail.sectionIndex}>03</span>
              <h3 id="import-row-source-title">Nilai pada berkas</h3>
            </div>
            <p>Apa adanya, per judul kolom</p>
          </div>
          <dl className={detail.metadataDetails}>
            {sourceValues.map(([column, value]) => (
              <div className={detail.wideMetadata} key={column}>
                <dt>{column}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </NexusWorkspaceDrawer>
  );
}
