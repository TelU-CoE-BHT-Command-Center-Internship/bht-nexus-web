import type { NexusRoleRecord } from "@/components/nexus-access-policy/nexus-access-policy";
import {
  type NexusAccountDirectoryRecord,
  type NexusAccountMemberRelationship,
  type NexusAccountStatus,
  nexusAccountStatusLabels,
} from "@/components/nexus-accounts/nexus-account-directory";
import { NexusApiError } from "@/components/nexus-api/nexus-api-error";

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

export type NexusAdministrationAction =
  | "invite"
  | "load"
  | "relationship"
  | "role"
  | "status";

const conflictMessages: Record<NexusAdministrationAction, string> = {
  invite: "Email ini sudah digunakan oleh akun lain.",
  load: "Daftar akun belum dapat dimuat. Coba lagi.",
  relationship: "Profil anggota ini sudah terhubung ke akun lain.",
  role: "Peran lama tidak dapat dicabut karena akun ini pemegang terakhir kewenangan pengelolaan peran.",
  status: "Status akun tidak dapat diubah saat ini. Muat ulang daftar akun.",
};

/**
 * Kalimat kegagalan untuk tindakan Administrasi. Pesan layanan tidak pernah
 * ditampilkan mentah; perubahan yang gagal selalu dinyatakan belum tersimpan.
 */
export function nexusAdministrationErrorMessage(
  error: unknown,
  action: NexusAdministrationAction,
) {
  const status = error instanceof NexusApiError ? error.status : 0;
  if (status === 409) return conflictMessages[action];
  if (status === 403) {
    return "Tindakan ini tidak diizinkan untuk akun Anda. Peran dan status akun Anda sendiri dikelola pengelola lain.";
  }
  if (status === 404) {
    return "Akun, peran, atau anggota yang dipilih tidak lagi tersedia. Muat ulang daftar akun.";
  }
  if (status === 400 || status === 422) {
    return "Periksa kembali isian lalu coba lagi.";
  }
  if (status === 429) {
    return "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.";
  }
  return action === "load"
    ? "Daftar akun belum dapat dimuat karena layanan BHT Nexus tidak menjawab."
    : "Layanan BHT Nexus belum dapat dihubungi. Perubahan belum disimpan.";
}
