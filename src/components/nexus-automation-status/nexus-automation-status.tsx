import styles from "@/components/nexus-automation-status/nexus-automation-status.module.css";
import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";

type AutomationStatusBadgeProps = {
  label: string;
  status: AutomationJobStatus;
};

export function AutomationStatusBadge({
  label,
  status,
}: AutomationStatusBadgeProps) {
  return (
    <span className={styles.badge} data-status={status}>
      {label}
    </span>
  );
}
