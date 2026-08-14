"use client";

import { useState } from "react";
import { NexusReviewSummary } from "@/components/nexus-review-summary/nexus-review-summary";
import type { NexusReviewSummaryContent } from "@/components/nexus-review-summary/nexus-review-summary-content";
import styles from "@/components/nexus-review-workspace/nexus-review-workspace.module.css";
import { NexusScraperResults } from "@/components/nexus-scraper-results/nexus-scraper-results";
import type { NexusScraperResultsContent } from "@/components/nexus-scraper-results/nexus-scraper-results-content";
import { NexusWorkspaceTabs } from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import type { Locale } from "@/i18n/locales";

type ReviewDomain = "cross-domain" | "publications";

const labels = {
  id: {
    crossDomain: "Kegiatan & karya lain",
    navigation: "Jenis data yang ditinjau",
    publications: "Publikasi & metadata",
  },
  en: {
    crossDomain: "Activities & other works",
    navigation: "Review data domain",
    publications: "Publications & metadata",
  },
} satisfies Record<
  Locale,
  { crossDomain: string; navigation: string; publications: string }
>;

export function NexusReviewWorkspace({
  crossDomainContent,
  locale,
  publicationContent,
}: {
  crossDomainContent: NexusScraperResultsContent;
  locale: Locale;
  publicationContent?: NexusReviewSummaryContent;
}) {
  const [domain, setDomain] = useState<ReviewDomain>(
    publicationContent ? "publications" : "cross-domain",
  );
  const copy = labels[locale];

  if (!publicationContent)
    return <NexusScraperResults content={crossDomainContent} />;

  return (
    <div>
      <div className={styles.domainTabs}>
        <NexusWorkspaceTabs
          activeId={domain}
          label={copy.navigation}
          onActiveChange={(value) => setDomain(value as ReviewDomain)}
          panelId="review-domain-panel"
          tabs={[
            {
              count: publicationContent.filters.table.rows.length,
              id: "publications",
              label: copy.publications,
            },
            {
              count: crossDomainContent.candidates.length,
              id: "cross-domain",
              label: copy.crossDomain,
            },
          ]}
        />
      </div>
      <div id="review-domain-panel" role="tabpanel">
        {domain === "publications" ? (
          <NexusReviewSummary content={publicationContent} />
        ) : (
          <NexusScraperResults content={crossDomainContent} />
        )}
      </div>
    </div>
  );
}
