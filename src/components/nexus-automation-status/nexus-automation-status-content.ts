import type { AutomationJobStatus } from "@/components/nexus-automation-status/nexus-automation-status-types";
import type { Locale } from "@/i18n/locales";

const automationStatusLabels = {
  id: {
    failed: "Gagal",
    failed_permanently: "Gagal permanen",
    queued: "Antre",
    retrying: "Dicoba ulang",
    running: "Berjalan",
    succeeded: "Berhasil",
  },
  en: {
    failed: "Failed",
    failed_permanently: "Failed permanently",
    queued: "Queued",
    retrying: "Retrying",
    running: "Running",
    succeeded: "Succeeded",
  },
} satisfies Record<Locale, Record<AutomationJobStatus, string>>;

export function getAutomationStatusLabel(
  locale: Locale,
  status: AutomationJobStatus,
): string {
  return automationStatusLabels[locale][status];
}
