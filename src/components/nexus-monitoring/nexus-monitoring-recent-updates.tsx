"use client";

import { type CSSProperties, useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import {
  type NexusMonitoringDomainId,
  nexusMonitoringDomainIdentity,
} from "@/components/nexus-monitoring/nexus-monitoring-domains";
import {
  MonitoringCard,
  MonitoringIcon,
} from "@/components/nexus-monitoring/nexus-monitoring-ui";
import type { NexusMonitoringUpdate } from "@/components/nexus-monitoring/nexus-monitoring-updates";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceEmptyState } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import {
  NexusWorkspaceMobileCard,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import type { NexusSelectConfig } from "@/components/nexus-workspace-ui/nexus-workspace-select";

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "5",
  id: "monitoring-update-page-size",
  label: "Jumlah pembaruan per halaman",
  options: [
    { label: "5 per halaman", value: "5" },
    { label: "10 per halaman", value: "10" },
    { label: "20 per halaman", value: "20" },
  ],
};

function joinedLabels(labels: readonly string[], fallback: string) {
  return labels.length > 0 ? labels.join(", ") : fallback;
}

function DomainCell({
  domains,
}: {
  domains: NexusMonitoringUpdate["domains"];
}) {
  if (domains.length === 0) {
    return (
      <span className={styles.summaryUpdatePlain}>Belum terkait domain</span>
    );
  }

  return (
    <span className={styles.summaryUpdateDomains}>
      {domains.map((domain) => {
        const identity = nexusMonitoringDomainIdentity(
          domain as NexusMonitoringDomainId,
        );
        return (
          <span
            className={styles.summaryUpdateDomain}
            key={domain}
            style={{ "--domain-accent": identity.accent } as CSSProperties}
          >
            <span aria-hidden="true">
              <MonitoringIcon name={identity.icon} />
            </span>
            {domain}
          </span>
        );
      })}
    </span>
  );
}

export function NexusMonitoringRecentUpdates({
  updates,
}: {
  updates: readonly NexusMonitoringUpdate[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeValue, setPageSizeValue] = useState(
    pageSizeConfig.defaultValue,
  );
  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(1, Math.ceil(updates.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const visibleUpdates = updates.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return (
    <div className={styles.summaryUpdates}>
      <MonitoringCard
        description="Data Resmi terakhir yang terkait indikator KM."
        headingId="monitoring-summary-recent-updates"
        title="Pembaruan Data Terbaru"
      >
        <div className={styles.summaryUpdatesTable}>
          <NexusWorkspaceRecordTable
            caption="Pembaruan Data Resmi terbaru yang terkait dengan indikator KM"
            columns={[
              { id: "updated", label: "Waktu" },
              { id: "record", label: "Data resmi", primary: true },
              { id: "domain", label: "Domain" },
              { id: "indicator", label: "Indikator KM" },
              { id: "source", label: "Sumber data" },
            ]}
            empty={
              <NexusWorkspaceEmptyState
                description="Pembaruan akan muncul setelah Data Resmi dikaitkan dengan indikator KM."
                title="Belum ada pembaruan terkait indikator"
              />
            }
            pagination={
              <NexusTablePagination
                currentPage={safePage}
                itemCount={updates.length}
                navigationLabel="Navigasi pembaruan Data Resmi"
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
                totalUnit="pembaruan"
              />
            }
            rows={visibleUpdates.map((update) => {
              const indicatorLabel = joinedLabels(
                update.indicatorIds,
                "Belum terkait indikator",
              );
              const sourceBadge = (
                <NexusWorkspaceTableBadge
                  key={`${update.id}-source`}
                  tone="info"
                >
                  {update.sourceLabel}
                </NexusWorkspaceTableBadge>
              );

              return {
                cells: {
                  domain: <DomainCell domains={update.domains} />,
                  indicator: (
                    <span className={styles.summaryUpdateIndicators}>
                      {indicatorLabel}
                    </span>
                  ),
                  record: (
                    <NexusWorkspaceTablePrimary
                      subtitle={update.title}
                      title={update.id}
                    />
                  ),
                  source: sourceBadge,
                  updated: (
                    <span className={styles.summaryUpdateTime}>
                      {update.updatedAt}
                    </span>
                  ),
                },
                id: update.id,
                mobile: (
                  <NexusWorkspaceMobileCard
                    action={null}
                    eyebrow={
                      <>
                        {sourceBadge}
                        <span className={styles.summaryUpdateTime}>
                          {update.updatedAt}
                        </span>
                      </>
                    }
                    meta={
                      <dl>
                        <div>
                          <dt>Domain</dt>
                          <dd>
                            <DomainCell domains={update.domains} />
                          </dd>
                        </div>
                        <div>
                          <dt>Indikator</dt>
                          <dd>{indicatorLabel}</dd>
                        </div>
                      </dl>
                    }
                    title={update.title}
                  >
                    <p className={styles.summaryUpdateId}>{update.id}</p>
                  </NexusWorkspaceMobileCard>
                ),
              };
            })}
          />
        </div>
      </MonitoringCard>
    </div>
  );
}
