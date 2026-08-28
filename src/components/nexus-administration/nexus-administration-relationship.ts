import type {
  NexusAdministrationAccount,
  NexusAdministrationMemberOption,
} from "@/components/nexus-administration/nexus-administration-content";

export type NexusResolvedAdministrationRelationship =
  | { kind: "LINKED"; member: NexusAdministrationMemberOption }
  | { kind: "NON_MEMBER" }
  | { kind: "UNLINKED" }
  | { kind: "CONFLICT"; member?: NexusAdministrationMemberOption };

export function resolveAdministrationRelationship(
  account: NexusAdministrationAccount,
  members: readonly NexusAdministrationMemberOption[],
): NexusResolvedAdministrationRelationship {
  const relationship = account.relationship;

  if (relationship.kind === "NON_MEMBER") return relationship;
  if (relationship.kind === "UNLINKED") return relationship;

  const member = relationship.memberId
    ? members.find((candidate) => candidate.id === relationship.memberId)
    : undefined;

  if (relationship.kind === "LINKED" && member) {
    return { kind: "LINKED", member };
  }

  return { kind: "CONFLICT", ...(member ? { member } : {}) };
}

export function administrationRelationshipLabel(
  relationship: NexusResolvedAdministrationRelationship,
) {
  if (relationship.kind === "LINKED") return "Terhubung ke anggota";
  if (relationship.kind === "NON_MEMBER") return "Akun non-anggota";
  if (relationship.kind === "UNLINKED") return "Belum dihubungkan";
  return "Perlu diperiksa";
}
