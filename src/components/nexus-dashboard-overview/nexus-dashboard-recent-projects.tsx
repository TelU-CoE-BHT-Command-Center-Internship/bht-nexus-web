import styles from "@/components/nexus-dashboard-overview/nexus-dashboard-overview.module.css";
import { NexusDashboardOverviewIcon } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-icons";
import type { NexusDashboardOverviewContent } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-types";

type RecentProjectsProps = {
  content: Pick<
    NexusDashboardOverviewContent,
    | "recentProjects"
    | "recentProjectsActionLabel"
    | "recentProjectsColumns"
    | "recentProjectsTitle"
  >;
};

export function NexusDashboardRecentProjects({ content }: RecentProjectsProps) {
  return (
    <section
      aria-labelledby="recent-projects-title"
      className={`${styles.panel} ${styles.recentProjectsPanel}`}
    >
      <div className={styles.projectsHeader}>
        <h2 id="recent-projects-title">{content.recentProjectsTitle}</h2>
        <span className={styles.projectsAction}>
          {content.recentProjectsActionLabel}
          <NexusDashboardOverviewIcon name="arrow-right" />
        </span>
      </div>

      <div className={styles.projectsTableWrap}>
        <table className={styles.projectsTable}>
          <thead>
            <tr>
              <th scope="col">{content.recentProjectsColumns.project}</th>
              <th scope="col">
                {content.recentProjectsColumns.leadResearcher}
              </th>
              <th scope="col">{content.recentProjectsColumns.status}</th>
              <th scope="col">{content.recentProjectsColumns.updatedAt}</th>
            </tr>
          </thead>
          <tbody>
            {content.recentProjects.map((project) => (
              <tr key={project.id}>
                <th scope="row">{project.title}</th>
                <td data-label={content.recentProjectsColumns.leadResearcher}>
                  {project.leadResearcher}
                </td>
                <td data-label={content.recentProjectsColumns.status}>
                  <span
                    className={styles.projectStatus}
                    data-status={project.status}
                  >
                    {project.status}
                  </span>
                </td>
                <td data-label={content.recentProjectsColumns.updatedAt}>
                  <time>{project.updatedAt}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
