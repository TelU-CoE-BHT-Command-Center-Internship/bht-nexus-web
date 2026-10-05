import type { ImageProps } from "next/image";
import type { NexusAccountStatus } from "@/components/nexus-accounts/nexus-account-directory";
import type { NexusMemberAvatarPosition } from "@/components/nexus-members/nexus-member-avatar";

export type NexusMemberStatus = "active" | "inactive" | "on_leave";

export type NexusMemberAccountStatus = NexusAccountStatus;

/** Akun BHT Nexus yang terhubung ke anggota, sebagaimana dijawab server. */
export type NexusMemberAccount = {
  email: string;
  id: string;
  roleLabel?: string;
  status?: NexusMemberAccountStatus;
};

export type NexusMemberAccountAccess =
  | { kind: "NONE" }
  | { account: NexusMemberAccount; kind: "LINKED" }
  | { accountIds: readonly string[]; kind: "CONFLICT" };

export type NexusMemberRecord = {
  division?: { publicId: string; name?: string };
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

export type NexusMemberViewRecord = NexusMemberRecord & {
  accountAccess: NexusMemberAccountAccess;
};

export type NexusMembersContent = {
  description: string;
  title: string;
};

/**
 * Judul dan keterangan halaman Anggota. Direktori anggotanya dibaca dari server.
 */
export function getNexusMembersContent(): NexusMembersContent {
  return {
    description:
      "Kelola identitas dan keanggotaan CoE BHT yang menghubungkan orang dengan data organisasi.",
    title: "Anggota",
  };
}
