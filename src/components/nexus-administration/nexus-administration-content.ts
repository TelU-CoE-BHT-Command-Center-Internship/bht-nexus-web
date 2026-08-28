import {
  type NexusAccountDirectoryRecord,
  type NexusAccountDirectoryRole,
  type NexusAccountMemberRelationship,
  type NexusAccountStatus,
  nexusAccountStatusLabels,
} from "@/components/nexus-accounts/nexus-account-directory";

export type NexusAdministrationRole = NexusAccountDirectoryRole;

export type NexusAdministrationMemberOption = {
  assignment: string;
  id: string;
  name: string;
};

export type NexusAdministrationAccount = NexusAccountDirectoryRecord;

export type NexusAdministrationContent = {
  description: string;
  title: string;
};

export const accountStatusLabels = nexusAccountStatusLabels;

export type { NexusAccountMemberRelationship, NexusAccountStatus };

export function getNexusAdministrationContent(): NexusAdministrationContent {
  return {
    description: "Kelola akun, hubungan anggota, peran, dan status akses.",
    title: "Administrasi",
  };
}
