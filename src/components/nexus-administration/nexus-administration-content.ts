export type NexusAccountStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export type NexusAdministrationRole = {
  accessSummary: readonly string[];
  description: string;
  id: string;
  label: string;
};

export type NexusAdministrationMemberOption = {
  assignment: string;
  id: string;
  name: string;
};

export type NexusAdministrationAccount = {
  accountKind: "individual" | "operational";
  createdAt: string;
  createdBy: string;
  displayName: string;
  email: string;
  id: string;
  invitedAt?: string;
  lastActiveAt?: string;
  lastInvitationAt?: string;
  member?: NexusAdministrationMemberOption;
  roleId?: string;
  status: NexusAccountStatus;
  updatedAt: string;
};

export type NexusAdministrationContent = {
  accounts: NexusAdministrationAccount[];
  availableMembers: NexusAdministrationMemberOption[];
  description: string;
  roles: NexusAdministrationRole[];
  title: string;
  updatedAt: string;
};

export const accountStatusLabels: Record<NexusAccountStatus, string> = {
  ACTIVE: "Aktif",
  INVITED: "Menunggu aktivasi",
  SUSPENDED: "Ditangguhkan",
};

const roles: NexusAdministrationRole[] = [
  {
    accessSummary: ["Ringkasan organisasi", "Persetujuan tingkat pimpinan"],
    description:
      "Akses ringkasan strategis dan tindakan persetujuan yang ditetapkan layanan server.",
    id: "leadership",
    label: "Pimpinan",
  },
  {
    accessSummary: ["Administrasi akun", "Konfigurasi operasional"],
    description:
      "Mengelola kebutuhan operasional ruang kerja tanpa mengambil alih keputusan data resmi.",
    id: "operations-admin",
    label: "Admin Operasional",
  },
  {
    accessSummary: ["Antrean tinjauan", "Keputusan kandidat"],
    description:
      "Meninjau kandidat dan mengambil keputusan sesuai cakupan yang diberikan server.",
    id: "reviewer",
    label: "Reviewer",
  },
  {
    accessSummary: ["Pengumpulan data", "Pelengkapan metadata"],
    description:
      "Menjalankan pekerjaan input dan pelengkapan data yang memerlukan pemeriksaan reviewer.",
    id: "data-operator",
    label: "Operator Data",
  },
  {
    accessSummary: ["Ruang kerja anggota", "Data yang diizinkan"],
    description:
      "Mengakses ruang kerja dan data yang secara eksplisit tersedia untuk anggota.",
    id: "member",
    label: "Anggota",
  },
];

const memberMaya = {
  assignment: "Kelompok Riset Biomedis",
  id: "BHT-014",
  name: "Maya Anindita",
} satisfies NexusAdministrationMemberOption;

const memberCitra = {
  assignment: "Program Akademik dan SDM",
  id: "BHT-028",
  name: "Citra Laksmi",
} satisfies NexusAdministrationMemberOption;

const memberRafi = {
  assignment: "Kelompok Teknologi Kesehatan Digital",
  id: "BHT-031",
  name: "Rafi Nugraha",
} satisfies NexusAdministrationMemberOption;

const memberSari = {
  assignment: "Pengurus CoE BHT",
  id: "BHT-006",
  name: "Sari Wicaksono",
} satisfies NexusAdministrationMemberOption;

/**
 * Adapter presentasi Accounts & Access. Seluruh identitas bersifat fixture
 * netral; autentikasi, role assignment, status, undangan, dan audit final akan
 * digantikan payload layanan server tanpa mengubah struktur halaman.
 */
export function getNexusAdministrationContent(): NexusAdministrationContent {
  return {
    accounts: [
      {
        accountKind: "individual",
        createdAt: "12 Mei 2026, 09.18 WIB",
        createdBy: "Admin Operasional",
        displayName: "Maya Anindita",
        email: "maya.anindita@example.org",
        id: "ACC-BHT-0014",
        lastActiveAt: "28 Agustus 2026, 08.42 WIB",
        member: memberMaya,
        roleId: "operations-admin",
        status: "ACTIVE",
        updatedAt: "26 Agustus 2026, 14.10 WIB",
      },
      {
        accountKind: "individual",
        createdAt: "18 Mei 2026, 13.04 WIB",
        createdBy: "Admin Operasional",
        displayName: "Dimas Arya Pradana",
        email: "dimas.pradana@example.org",
        id: "ACC-BHT-0019",
        lastActiveAt: "27 Agustus 2026, 17.26 WIB",
        roleId: "reviewer",
        status: "ACTIVE",
        updatedAt: "18 Mei 2026, 13.04 WIB",
      },
      {
        accountKind: "individual",
        createdAt: "22 Agustus 2026, 10.15 WIB",
        createdBy: "Admin Operasional",
        displayName: "Citra Laksmi",
        email: "citra.laksmi@example.org",
        id: "ACC-BHT-0033",
        invitedAt: "22 Agustus 2026, 10.15 WIB",
        lastInvitationAt: "26 Agustus 2026, 09.30 WIB",
        member: memberCitra,
        roleId: "member",
        status: "INVITED",
        updatedAt: "26 Agustus 2026, 09.30 WIB",
      },
      {
        accountKind: "operational",
        createdAt: "02 Juni 2026, 08.00 WIB",
        createdBy: "Admin Operasional",
        displayName: "Operasional Data BHT",
        email: "operasional.data@example.org",
        id: "ACC-BHT-OPS-002",
        lastActiveAt: "28 Agustus 2026, 07.55 WIB",
        roleId: "data-operator",
        status: "ACTIVE",
        updatedAt: "21 Agustus 2026, 16.20 WIB",
      },
      {
        accountKind: "individual",
        createdAt: "07 Juni 2026, 11.24 WIB",
        createdBy: "Admin Operasional",
        displayName: "Rafi Nugraha",
        email: "rafi.nugraha@example.org",
        id: "ACC-BHT-0027",
        lastActiveAt: "14 Agustus 2026, 15.08 WIB",
        member: memberRafi,
        roleId: "reviewer",
        status: "SUSPENDED",
        updatedAt: "19 Agustus 2026, 09.12 WIB",
      },
      {
        accountKind: "individual",
        createdAt: "10 Juni 2026, 09.40 WIB",
        createdBy: "Admin Operasional",
        displayName: "Sari Wicaksono",
        email: "sari.wicaksono@example.org",
        id: "ACC-BHT-0031",
        lastActiveAt: "28 Agustus 2026, 08.05 WIB",
        member: memberSari,
        roleId: "leadership",
        status: "ACTIVE",
        updatedAt: "10 Juni 2026, 09.40 WIB",
      },
      {
        accountKind: "individual",
        createdAt: "25 Agustus 2026, 14.22 WIB",
        createdBy: "Admin Operasional",
        displayName: "Alya Prameswari",
        email: "alya.prameswari.long-address@example.org",
        id: "ACC-BHT-0042",
        invitedAt: "25 Agustus 2026, 14.22 WIB",
        lastInvitationAt: "25 Agustus 2026, 14.22 WIB",
        status: "INVITED",
        updatedAt: "25 Agustus 2026, 14.22 WIB",
      },
      {
        accountKind: "individual",
        createdAt: "15 Juli 2026, 10.30 WIB",
        createdBy: "Admin Operasional",
        displayName: "Naufal Mahendra Putra",
        email: "naufal.mahendra@example.org",
        id: "ACC-BHT-0038",
        lastActiveAt: "26 Agustus 2026, 12.17 WIB",
        roleId: "data-operator",
        status: "ACTIVE",
        updatedAt: "15 Juli 2026, 10.30 WIB",
      },
    ],
    availableMembers: [
      {
        assignment: "Kelompok Riset Biosensor dan Instrumentasi Medis",
        id: "BHT-043",
        name: "Anggota BHT 043",
      },
      {
        assignment: "Program Kegiatan dan Pengabdian Masyarakat",
        id: "BHT-052",
        name: "Anggota BHT 052",
      },
      {
        assignment: "Kelompok Riset Informatika Kesehatan",
        id: "BHT-061",
        name: "Anggota BHT 061",
      },
    ],
    description: "Kelola akun dan akses pengguna BHT Nexus.",
    roles,
    title: "Administrasi",
    updatedAt: "Data pratinjau · 28 Agustus 2026",
  };
}
