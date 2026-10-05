import type { AuditReviewField } from "@/components/nexus-audit-review/nexus-audit-review-content";

export const memberPersonFieldIds = ["authors", "creators", "mentors"] as const;

export type MemberPersonFieldId = (typeof memberPersonFieldIds)[number];

export function splitReviewPeople(value?: string) {
  return (value ?? "")
    .split(/[;/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function reviewPeople(fieldId: string, value?: string) {
  return splitReviewPeople(value).map((name, index) => ({
    id: `${fieldId}:${index + 1}`,
    name,
  }));
}

export function memberPersonField(
  fields: readonly AuditReviewField[],
): AuditReviewField | undefined {
  return fields.find((field) =>
    memberPersonFieldIds.includes(field.id as MemberPersonFieldId),
  );
}
