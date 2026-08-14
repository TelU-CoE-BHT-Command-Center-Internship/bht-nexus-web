import styles from "@/components/nexus-workspace-ui/nexus-workspace-loading.module.css";

const cards = ["metric-a", "metric-b", "metric-c"];
const rows = ["row-a", "row-b", "row-c", "row-d", "row-e", "row-f"];
const cells = ["primary", "type", "source", "owner", "status", "action"];

export function NexusWorkspaceLoading({ label }: { label: string }) {
  return (
    <section aria-busy="true" aria-live="polite" className={styles.page}>
      <span className={styles.visuallyHidden}>{label}</span>
      <header className={styles.header}>
        <span className={styles.title} />
        <span className={styles.description} />
      </header>
      <div className={styles.metrics}>
        {cards.map((card) => (
          <span key={card}>
            <i />
            <b />
            <small />
          </span>
        ))}
      </div>
      <div className={styles.tabs}>
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className={styles.controls}>
        <span className={styles.search} />
        <span />
        <span />
        <span />
      </div>
      <div className={styles.tableHeading}>
        <span />
        <span />
      </div>
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          {cells.map((cell) => (
            <span key={`head-${cell}`} />
          ))}
        </div>
        {rows.map((row) => (
          <div className={styles.tableRow} key={row}>
            {cells.map((cell) => (
              <span key={`${row}-${cell}`} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
