export type NexusAccountStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export type NexusAccountMemberRelationship =
  | { kind: "LINKED"; memberId: string }
  | { kind: "NON_MEMBER" }
  | { kind: "UNLINKED" }
  | {
      conflictingAccountId?: string;
      kind: "CONFLICT";
      memberId?: string;
    };

export type NexusAccountDirectoryRole = {
  accessSummary: readonly string[];
  description: string;
  id: string;
  label: string;
};

export type NexusAccountDirectoryRecord = {
  createdAt: string;
  createdBy: string;
  displayName: string;
  email: string;
  id: string;
  invitedAt?: string;
  lastActiveAt?: string;
  lastInvitationAt?: string;
  relationship: NexusAccountMemberRelationship;
  roleId?: string;
  status: NexusAccountStatus;
  updatedAt: string;
};

export const nexusAccountStatusLabels: Record<NexusAccountStatus, string> = {
  ACTIVE: "Aktif",
  INVITED: "Menunggu aktivasi",
  SUSPENDED: "Ditangguhkan",
};

const roles: readonly NexusAccountDirectoryRole[] = [
  {
    accessSummary: ["Ringkasan organisasi", "Persetujuan tingkat pimpinan"],
    description:
      "Akses ringkasan strategis dan tindakan persetujuan sesuai kewenangan pimpinan.",
    id: "pimpinan",
    label: "Pimpinan",
  },
  {
    accessSummary: ["Administrasi akun", "Konfigurasi ruang kerja"],
    description:
      "Mengelola akun, peran, dan konfigurasi operasional BHT Nexus.",
    id: "admin",
    label: "Admin",
  },
  {
    accessSummary: ["Antrean tinjauan", "Riwayat perubahan"],
    description:
      "Meninjau kandidat perubahan dan riwayat aktivitas sesuai cakupan yang diberikan.",
    id: "auditor",
    label: "Auditor",
  },
  {
    accessSummary: ["Ruang kerja anggota", "Data yang diizinkan"],
    description:
      "Mengakses ruang kerja anggota dan data organisasi yang tersedia untuknya.",
    id: "anggota",
    label: "Anggota",
  },
  {
    accessSummary: ["Ruang kolaborasi", "Data kerja sama yang diizinkan"],
    description:
      "Mengakses ruang kolaborasi dan informasi kerja sama yang tersedia untuk mitra.",
    id: "partner_eksternal",
    label: "Mitra Eksternal",
  },
];

const accounts: readonly NexusAccountDirectoryRecord[] = [
  {
    createdAt: "12 Mei 2026, 09.18 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Dr. Hesty Susanti, S.T., M.T.",
    email: "hesty.susanti@example.org",
    id: "ACC-BHT-0014",
    lastActiveAt: "28 Agustus 2026, 08.42 WIB",
    relationship: { kind: "LINKED", memberId: "hesty-susanti" },
    roleId: "pimpinan",
    status: "ACTIVE",
    updatedAt: "26 Agustus 2026, 14.10 WIB",
  },
  {
    createdAt: "18 Mei 2026, 13.04 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Muhammad Ammar Asyraf, S.T., M.T.",
    email: "ammar.asyraf@example.org",
    id: "ACC-BHT-0019",
    lastActiveAt: "27 Agustus 2026, 17.26 WIB",
    relationship: {
      kind: "LINKED",
      memberId: "muhammad-ammar-asyraf-s-t-m-t",
    },
    roleId: "admin",
    status: "ACTIVE",
    updatedAt: "18 Mei 2026, 13.04 WIB",
  },
  {
    createdAt: "22 Agustus 2026, 10.15 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Salsabila Aurellia, S.T., M.T.",
    email: "salsabila.aurellia@example.org",
    id: "ACC-BHT-0033",
    invitedAt: "22 Agustus 2026, 10.15 WIB",
    lastInvitationAt: "26 Agustus 2026, 09.30 WIB",
    relationship: {
      kind: "LINKED",
      memberId: "salsabila-aurellia-s-t-m-t",
    },
    roleId: "anggota",
    status: "INVITED",
    updatedAt: "26 Agustus 2026, 09.30 WIB",
  },
  {
    createdAt: "02 Juni 2026, 08.00 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Dimas Arya Pradana",
    email: "dimas.pradana@example.org",
    id: "ACC-BHT-0024",
    lastActiveAt: "28 Agustus 2026, 07.55 WIB",
    relationship: { kind: "NON_MEMBER" },
    roleId: "auditor",
    status: "ACTIVE",
    updatedAt: "21 Agustus 2026, 16.20 WIB",
  },
  {
    createdAt: "07 Juni 2026, 11.24 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Dr. Suksmandhira Harimurti, S.T., M.Eng.",
    email: "suksmandhira.harimurti@example.org",
    id: "ACC-BHT-0027",
    lastActiveAt: "14 Agustus 2026, 15.08 WIB",
    relationship: {
      kind: "LINKED",
      memberId: "dr-suksmandhira-harimurti-s-t-m-eng",
    },
    roleId: "auditor",
    status: "SUSPENDED",
    updatedAt: "19 Agustus 2026, 09.12 WIB",
  },
  {
    createdAt: "10 Juni 2026, 09.40 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Operator BHT",
    email: "operator.bht@example.org",
    id: "ACC-BHT-0031",
    lastActiveAt: "28 Agustus 2026, 08.05 WIB",
    relationship: { kind: "UNLINKED" },
    roleId: "admin",
    status: "ACTIVE",
    updatedAt: "10 Juni 2026, 09.40 WIB",
  },
  {
    createdAt: "25 Agustus 2026, 14.22 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Alya Prameswari",
    email: "alya.prameswari.long-address@example.org",
    id: "ACC-BHT-0042",
    invitedAt: "25 Agustus 2026, 14.22 WIB",
    lastInvitationAt: "25 Agustus 2026, 14.22 WIB",
    relationship: { kind: "NON_MEMBER" },
    roleId: "partner_eksternal",
    status: "INVITED",
    updatedAt: "25 Agustus 2026, 14.22 WIB",
  },
  {
    createdAt: "15 Juli 2026, 10.30 WIB",
    createdBy: "Administrator Sistem",
    displayName: "Naufal Mahendra Putra",
    email: "naufal.mahendra@example.org",
    id: "ACC-BHT-0038",
    lastActiveAt: "26 Agustus 2026, 12.17 WIB",
    relationship: { kind: "UNLINKED" },
    roleId: "auditor",
    status: "ACTIVE",
    updatedAt: "15 Juli 2026, 10.30 WIB",
  },
];

export function getNexusAccountDirectory() {
  return {
    accounts: accounts.map((account) => ({
      ...account,
      relationship: { ...account.relationship },
    })),
    roles: roles.map((role) => ({
      ...role,
      accessSummary: [...role.accessSummary],
    })),
  };
}
