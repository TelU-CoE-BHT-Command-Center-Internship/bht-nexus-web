import { ResearchExplorer } from "@/components/research-focus/research-explorer";
import styles from "@/components/research-focus/research-focus.module.css";
import { getResearchFocusContent } from "@/components/research-focus/research-focus-content";
import { ResearchMetrics } from "@/components/research-focus/research-metrics";
import type { Locale } from "@/components/site-header/site-navigation";

type ResearchFocusProps = {
  locale: Locale;
};

export function ResearchFocus({ locale }: ResearchFocusProps) {
  const content = getResearchFocusContent(locale);
  const titleId = `research-title-${locale}`;

  return (
    <section
      className={styles.section}
      id="research-focus"
      aria-labelledby={titleId}
    >
      <div className={styles.inner}>
        <h2 className={styles.title} id={titleId}>
          {content.title}
        </h2>

        <ResearchExplorer content={content} />
      </div>

      <ResearchMetrics
        categories={content.categories}
        title={content.metricsTitle}
      />
    </section>
  );
}
