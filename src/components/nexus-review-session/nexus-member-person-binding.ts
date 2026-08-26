import type {
  AuditMemberPersonBinding,
  AuditReviewField,
  AuditReviewRecord,
} from "@/components/nexus-audit-review/nexus-audit-review-content";

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

export function bindingMatchesFields(
  binding: AuditMemberPersonBinding | undefined,
  fields: readonly AuditReviewField[],
) {
  if (!binding) return false;
  const field = fields.find((item) => item.id === binding.fieldId);
  return reviewPeople(binding.fieldId, field?.rawValue ?? field?.value).some(
    (person) =>
      person.id === binding.personId && person.name === binding.personName,
  );
}

export function reconcileMemberPersonBinding(
  record: AuditReviewRecord,
): AuditReviewRecord {
  if (!record.memberPersonBinding) return record;
  if (bindingMatchesFields(record.memberPersonBinding, record.fields)) {
    return record;
  }

  return {
    ...record,
    memberPersonBinding: undefined,
  };
}
