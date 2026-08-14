import type { ReactNode } from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-records.module.css";

export type NexusWorkspaceRecordColumn = {
  id: string;
  label: string;
  primary?: boolean;
};

export type NexusWorkspaceRecordRow = {
  cells: Record<string, ReactNode>;
  id: string;
  mobile: ReactNode;
};

type NexusWorkspaceRecordTableProps = {
  caption: string;
  columns: readonly NexusWorkspaceRecordColumn[];
  empty: ReactNode;
  isLoading?: boolean;
  pagination: ReactNode;
  rows: readonly NexusWorkspaceRecordRow[];
};

type NexusWorkspaceTableActionProps = {
  children: ReactNode;
  label: string;
  onClick: () => void;
};

type NexusWorkspaceTableBadgeProps = {
  children: ReactNode;
  tone?: "danger" | "info" | "neutral" | "success" | "waiting";
};

type NexusWorkspaceTablePrimaryProps = {
  onClick?: () => void;
  subtitle?: string;
  title: string;
};

type NexusWorkspaceTableSignalProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  tone?: "danger" | "info" | "neutral" | "success" | "waiting";
};

const loadingRows = ["a", "b", "c", "d", "e", "f"];

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
    </svg>
  );
}

export function NexusWorkspaceMobileCard({
  action,
  children,
  eyebrow,
  meta,
  title,
}: {
  action: ReactNode;
  children?: ReactNode;
  eyebrow: ReactNode;
  meta: ReactNode;
  title: string;
}) {
  return (
    <article className={styles.mobileCard}>
      <div className={styles.mobileCardTop}>{eyebrow}</div>
      <h4>{title}</h4>
      {children}
      <div className={styles.mobileMeta}>{meta}</div>
      {action}
    </article>
  );
}

export function NexusWorkspaceTableAction({
  children,
  label,
  onClick,
}: NexusWorkspaceTableActionProps) {
  return (
    <button
      aria-label={label}
      className={styles.actionButton}
      onClick={onClick}
      type="button"
    >
      <DetailIcon />
      <span>{children}</span>
    </button>
  );
}

export function NexusWorkspaceTableBadge({
  children,
  tone = "neutral",
}: NexusWorkspaceTableBadgeProps) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {children}
    </span>
  );
}

export function NexusWorkspaceTablePrimary({
  onClick,
  subtitle,
  title,
}: NexusWorkspaceTablePrimaryProps) {
  const copy = (
    <>
      <strong>{title}</strong>
      {subtitle ? <span>{subtitle}</span> : null}
    </>
  );

  return onClick ? (
    <button
      className={styles.primaryCellButton}
      onClick={onClick}
      type="button"
    >
      {copy}
    </button>
  ) : (
    <span className={styles.primaryCell}>{copy}</span>
  );
}

export function NexusWorkspaceTableSignal({
  primary,
  secondary,
  tone = "info",
}: NexusWorkspaceTableSignalProps) {
  return (
    <span className={styles.signal} data-tone={tone}>
      <strong>{primary}</strong>
      {secondary ? <span>{secondary}</span> : null}
    </span>
  );
}

export function NexusWorkspaceMobileAction({
  children,
  label,
  onClick,
}: NexusWorkspaceTableActionProps) {
  return (
    <button
      aria-label={label}
      className={styles.mobileAction}
      onClick={onClick}
      type="button"
    >
      {children} <ArrowIcon />
    </button>
  );
}

export function NexusWorkspaceRecordTable({
  caption,
  columns,
  empty,
  isLoading = false,
  pagination,
  rows,
}: NexusWorkspaceRecordTableProps) {
  return (
    <>
      <div className={styles.desktopTable}>
        <table>
          <caption className={styles.visuallyHidden}>{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th data-column={column.id} key={column.id} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? loadingRows.map((rowId) => (
                  <tr className={styles.loadingRow} key={rowId}>
                    {columns.map((column) => (
                      <td key={`${rowId}-${column.id}`}>
                        <span />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((column) => {
                      const Cell = column.primary ? "th" : "td";
                      return (
                        <Cell
                          data-column={column.id}
                          key={column.id}
                          scope={column.primary ? "row" : undefined}
                        >
                          {row.cells[column.id]}
                        </Cell>
                      );
                    })}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {isLoading ? (
        <output aria-label="Memuat data" className={styles.mobileLoading}>
          {["mobile-a", "mobile-b", "mobile-c"].map((id) => (
            <span key={id} />
          ))}
        </output>
      ) : (
        <div className={styles.mobileList}>
          {rows.map((row) => (
            <div key={row.id}>{row.mobile}</div>
          ))}
        </div>
      )}

      {!isLoading && rows.length === 0 ? empty : null}
      {pagination}
    </>
  );
}

export { styles as nexusWorkspaceRecordStyles };
