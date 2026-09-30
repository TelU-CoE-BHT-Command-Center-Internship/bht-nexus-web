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

/**
 * Jumlah penyesuaian akses khusus pada satu akun. Selain angka, jumlahnya bisa
 * sedang dibaca atau tidak dapat dibaca oleh akun yang sedang melihat.
 */
export type NexusAccountSpecialAccess = number | "loading" | "unavailable";

/** Pembaca akses khusus per akun bila jumlahnya dibaca terpisah dari sesi. */
export type NexusAccountSpecialAccessReader = {
  countFor: (accountId: string) => NexusAccountSpecialAccess;
  /** Dipanggil ketika detail akun dibuka. */
  request: (accountId: string) => void;
};

export const accountStatusLabels = nexusAccountStatusLabels;

export type { NexusAccountMemberRelationship, NexusAccountStatus };

export function getNexusAdministrationContent(): NexusAdministrationContent {
  return {
    description: "Kelola akun, hubungan anggota, peran, dan status akses.",
    title: "Administrasi",
  };
}
