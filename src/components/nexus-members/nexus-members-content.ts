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
  COE_BHT_LINKS,
  COE_BHT_PRIMARY_LOCATION,
  COE_BHT_RESEARCH_SPACE,
} from "@/content/coe-bht";

export type NexusMemberStatus = "active" | "inactive" | "on_leave";

export type NexusMemberAccountStatus = "active" | "invited" | "suspended";

export type NexusMemberRecord = {
  account?: {
    email: string;
    roleLabels: string[];
    status: NexusMemberAccountStatus;
  };
  academic: {
    googleScholar?: string;
    orcid?: string;
    researcherId?: string;
    scopusAuthorId?: string;
    sintaId?: string;
  };
  coeAssignment: string;
  affiliation: {
    employmentStatus?: string;
    functionalPosition?: string;
    institution: string;
    office?: string;
    primaryUnit: string;
    secondaryUnit?: string;
  };
  avatarSrc?: ImageProps["src"];
  biography: string;
  contact: {
    alternateEmail?: string;
    institutionalEmail?: string;
    location?: string;
    phone?: string;
  };
  expertise: {
    primary?: string;
    secondary: string[];
  };
  id: string;
  identity: {
    citizenship?: string;
    dateOfBirth?: string;
    gender?: string;
    preferredName: string;
  };
  membership: {
    joinedAt?: string;
    memberCode?: string;
    publicProfile: boolean;
    status: NexusMemberStatus;
  };
  name: string;
  updatedAt: string;
};

export type NexusMembersContent = {
  description: string;
  records: NexusMemberRecord[];
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

const sharedContact = {
  institutionalEmail: COE_BHT_LINKS.email.replace("mailto:", ""),
  location: COE_BHT_PRIMARY_LOCATION.address,
} as const;

const chair: NexusMemberRecord = {
  academic: {},
  affiliation: sharedAffiliation,
  avatarSrc: portraits.hesty,
  biography: publicContent.chair.description,
  coeAssignment: publicContent.leadershipTitle,
  contact: sharedContact,
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
  updatedAt: "22 Agustus 2026",
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
      contact: sharedContact,
      expertise: {
        primary: member.field,
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
      updatedAt: "22 Agustus 2026",
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
    records: [chair, ...managementProfiles],
    title: "Anggota",
  };
}
