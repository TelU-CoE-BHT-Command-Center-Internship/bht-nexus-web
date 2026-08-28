import type { ImageProps } from "next/image";
import ditaPuspitasariPhoto from "@/assets/members/dita-puspitasari.webp";
import fathurRahmanPhoto from "@/assets/members/fathur-rahman.webp";
import hestySusantiPhoto from "@/assets/members/hesty-susanti.png";
import lailyAdeOktavianaPhoto from "@/assets/members/laily-ade-oktaviana.webp";
import miftadiSudjaiPhoto from "@/assets/members/miftadi-sudjai.webp";
import muhammadAmmarAsyrafPhoto from "@/assets/members/muhammad-ammar-asyraf.webp";
import salsabilaAurelliaPhoto from "@/assets/members/salsabila-aurellia.webp";
import suksmandhiraHarimurtiPhoto from "@/assets/members/suksmandhira-harimurti.webp";
import { getMembersContent } from "@/components/members/members-content";
import {
  type NexusAccountDirectoryRecord,
  type NexusAccountDirectoryRole,
  type NexusAccountStatus,
  resolveNexusAccountRelationship,
} from "@/components/nexus-accounts/nexus-account-directory";
import type { NexusMemberAvatarPosition } from "@/components/nexus-members/nexus-member-avatar";
import { COE_BHT_RESEARCH_SPACE } from "@/content/coe-bht";

export type NexusMemberStatus = "active" | "inactive" | "on_leave";

export type NexusMemberAccountStatus = NexusAccountStatus;

export type NexusMemberAccount = {
  email: string;
  id: string;
  roleLabels: string[];
  status: NexusMemberAccountStatus;
};

export type NexusMemberRecord = {
  account?: NexusMemberAccount;
  academic: {
    googleScholar?: string;
    orcid?: string;
    researcherId?: string;
    scopusAuthorId?: string;
    sintaId?: string;
  };
  coeAssignment: string;
  affiliation: {
    institution: string;
    office?: string;
    primaryUnit: string;
  };
  avatarOriginalSrc?: ImageProps["src"];
  avatarPosition?: NexusMemberAvatarPosition;
  avatarSrc?: ImageProps["src"];
  biography: string;
  contact: {
    alternateEmail?: string;
    institutionalEmail?: string;
    phone?: string;
  };
  expertise: {
    primary?: string;
    secondary: string[];
  };
  id: string;
  identity: {
    preferredName: string;
  };
  membership: {
    joinedAt?: string;
    publicProfile: boolean;
    status: NexusMemberStatus;
  };
  name: string;
  updatedAt?: string;
};

export type NexusMembersContent = {
  description: string;
  title: string;
};

const publicContent = getMembersContent("id");

const portraits = {
  ammar: muhammadAmmarAsyrafPhoto,
  dita: ditaPuspitasariPhoto,
  fathur: fathurRahmanPhoto,
  hesty: hestySusantiPhoto,
  laily: lailyAdeOktavianaPhoto,
  miftadi: miftadiSudjaiPhoto,
  salsabila: salsabilaAurelliaPhoto,
  suksmandhira: suksmandhiraHarimurtiPhoto,
} satisfies Record<string, ImageProps["src"]>;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("id-ID")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const sharedAffiliation = {
  institution: "Telkom University",
  office: COE_BHT_RESEARCH_SPACE.name,
  primaryUnit: "CoE Biomedical & Healthcare Technology",
} as const;

const chair: NexusMemberRecord = {
  academic: {},
  affiliation: sharedAffiliation,
  avatarSrc: portraits.hesty,
  biography: publicContent.chair.description,
  coeAssignment: publicContent.leadershipTitle,
  contact: {},
  expertise: {
    primary: publicContent.chair.discipline,
    secondary: publicContent.chair.expertise
      .split(/\s*,\s*|\s*&\s*/)
      .filter(Boolean),
  },
  id: "hesty-susanti",
  identity: {
    preferredName: "Hesty Susanti",
  },
  membership: {
    publicProfile: true,
    status: "active",
  },
  name: publicContent.chair.name,
};

const managementProfiles = publicContent.managementMembers.map(
  (member): NexusMemberRecord => {
    const id = slugify(member.name);

    return {
      academic: {},
      affiliation: sharedAffiliation,
      avatarSrc: portraits[member.portrait],
      biography: member.description,
      coeAssignment: member.field,
      contact: {},
      expertise: {
        secondary: [],
      },
      id,
      identity: {
        preferredName: member.name.split(",")[0] ?? member.name,
      },
      membership: {
        publicProfile: true,
        status: "active",
      },
      name: member.name,
    };
  },
);

/**
 * Adapter presentasi halaman Anggota. Data yang telah dipublikasikan pada
 * halaman institusional dipakai kembali; atribut privat atau yang belum
 * tersedia dari layanan anggota sengaja dibiarkan kosong.
 */
export function getNexusMembersContent(): NexusMembersContent {
  return {
    description:
      "Kelola identitas dan keanggotaan CoE BHT yang menghubungkan orang dengan data organisasi.",
    title: "Anggota",
  };
}

export function getNexusMemberDirectory(): NexusMemberRecord[] {
  return [chair, ...managementProfiles];
}

/**
 * Proyeksi akses anggota selalu dibentuk dari state akun sesi yang sama dengan
 * Administrasi. Hubungan ganda atau konflik tidak dipresentasikan sebagai akun
 * anggota yang sah.
 */
export function projectNexusMemberAccounts(
  records: readonly NexusMemberRecord[],
  accounts: readonly NexusAccountDirectoryRecord[],
  roles: readonly NexusAccountDirectoryRole[],
) {
  const rolesById = new Map(roles.map((role) => [role.id, role.label]));

  return records.map((member): NexusMemberRecord => {
    const projectedMember = { ...member };
    delete projectedMember.account;
    const account = accounts.find((candidate) => {
      const relationship = resolveNexusAccountRelationship(candidate, accounts);
      return (
        relationship.kind === "LINKED" && relationship.memberId === member.id
      );
    });

    if (!account) return projectedMember;
    return {
      ...projectedMember,
      account: {
        email: account.email,
        id: account.id,
        roleLabels: account.roleId
          ? [rolesById.get(account.roleId) ?? account.roleId]
          : [],
        status: account.status,
      },
    };
  });
}
