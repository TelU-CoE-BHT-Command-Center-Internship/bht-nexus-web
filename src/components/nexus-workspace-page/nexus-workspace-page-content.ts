import type { Locale } from "@/i18n/locales";

const previewLabels = {
  id: "Pratinjau",
  en: "Preview",
} satisfies Record<Locale, string>;

/**
 * Marks a page whose content is fixed sample data. Remove the badge from a
 * page once its server adapter supplies real records.
 */
export function getWorkspacePreviewLabel(locale: Locale): string {
  return previewLabels[locale];
}
