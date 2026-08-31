import { resolveNexusAccountRelationship } from "@/components/nexus-accounts/nexus-account-directory";
import type {
  NexusAdministrationAccount,
  NexusAdministrationMemberOption,
} from "@/components/nexus-administration/nexus-administration-content";

export type NexusResolvedAdministrationRelationship =
  | { kind: "LINKED"; member: NexusAdministrationMemberOption }
  | { kind: "NON_MEMBER" }
  | { kind: "UNLINKED" }
  | {
      conflictingAccountId?: string;
      kind: "CONFLICT";
      member?: NexusAdministrationMemberOption;
    };

export function resolveAdministrationRelationship(
  account: NexusAdministrationAccount,
  members: readonly NexusAdministrationMemberOption[],
  accounts: readonly NexusAdministrationAccount[],
): NexusResolvedAdministrationRelationship {
  const relationship = resolveNexusAccountRelationship(account, accounts);

  if (relationship.kind === "NON_MEMBER") return relationship;
  if (relationship.kind === "UNLINKED") return relationship;

  const member = relationship.memberId
    ? members.find((candidate) => candidate.id === relationship.memberId)
    : undefined;

  if (relationship.kind === "LINKED" && member) {
    return { kind: "LINKED", member };
  }

  return {
    ...(relationship.kind === "CONFLICT" && relationship.conflictingAccountId
      ? { conflictingAccountId: relationship.conflictingAccountId }
      : {}),
    kind: "CONFLICT",
    ...(member ? { member } : {}),
  };
}

export function administrationRelationshipLabel(
  relationship: NexusResolvedAdministrationRelationship,
) {
  if (relationship.kind === "LINKED") return "Terhubung ke anggota";
  if (relationship.kind === "NON_MEMBER") return "Akun non-anggota";
  if (relationship.kind === "UNLINKED") return "Belum dihubungkan";
  return "Perlu diperiksa";
}
