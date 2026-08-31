import type { NexusRoleRecord } from "@/components/nexus-access-policy/nexus-access-policy";
import {
  type NexusAccountDirectoryRecord,
  type NexusAccountMemberRelationship,
  type NexusAccountStatus,
  nexusAccountStatusLabels,
} from "@/components/nexus-accounts/nexus-account-directory";

export type NexusAdministrationRole = NexusRoleRecord;

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
