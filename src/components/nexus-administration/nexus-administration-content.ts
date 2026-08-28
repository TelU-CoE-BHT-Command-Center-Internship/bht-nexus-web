import {
  getNexusAccountDirectory,
  type NexusAccountDirectoryRecord,
  type NexusAccountDirectoryRole,
  type NexusAccountMemberRelationship,
  type NexusAccountStatus,
  nexusAccountStatusLabels,
} from "@/components/nexus-accounts/nexus-account-directory";
import { getNexusMembersContent } from "@/components/nexus-members/nexus-members-content";

export type NexusAdministrationRole = NexusAccountDirectoryRole;

export type NexusAdministrationMemberOption = {
  assignment: string;
  id: string;
  name: string;
};

export type NexusAdministrationAccount = NexusAccountDirectoryRecord;

export type NexusAdministrationContent = {
  accounts: NexusAdministrationAccount[];
  description: string;
  memberDirectory: NexusAdministrationMemberOption[];
  roles: NexusAdministrationRole[];
  title: string;
  updatedAt: string;
};

export const accountStatusLabels = nexusAccountStatusLabels;

export type { NexusAccountMemberRelationship, NexusAccountStatus };

/**
 * Adapter presentasi akun mengambil referensi anggota dari direktori Anggota
 * agar kedua ruang kerja memakai ID anggota yang sama.
 */
export function getNexusAdministrationContent(): NexusAdministrationContent {
  const accountDirectory = getNexusAccountDirectory();
  const members = getNexusMembersContent().records;

  return {
    accounts: accountDirectory.accounts,
    description: "Kelola akun, hubungan anggota, peran, dan status akses.",
    memberDirectory: members.map((member) => ({
      assignment: member.coeAssignment,
      id: member.id,
      name: member.name,
    })),
    roles: accountDirectory.roles,
    title: "Administrasi",
    updatedAt: "Diperbarui 28 Agustus 2026",
  };
}
