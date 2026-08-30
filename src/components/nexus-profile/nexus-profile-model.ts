import type { ImageProps } from "next/image";
import {
  type NexusRoleRecord,
  type NexusRoleResolution,
  resolveNexusRole,
} from "@/components/nexus-access-policy/nexus-access-policy";
import {
  type NexusAccountDirectoryRecord,
  type NexusAccountPersonalProfile,
  resolveNexusAccountRelationship,
} from "@/components/nexus-accounts/nexus-account-directory";
import {
  DEFAULT_MEMBER_AVATAR_POSITION,
  type NexusMemberAvatarPosition,
} from "@/components/nexus-members/nexus-member-avatar";
import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";
import {
  createEditDraft,
  memberSecondaryExpertiseList,
  nexusValidEmail,
  normalizedMemberDraft,
} from "@/components/nexus-members/nexus-members-model";
import {
  formatAuditTimestamp,
  personInitials,
} from "@/components/nexus-workspace-ui/nexus-workspace-format";

/**
 * Satu proyeksi profil untuk seluruh permukaan BHT Nexus.
 *
 * Akun dan anggota tetap dua entitas terpisah. Ketika akun terhubung ke sebuah
 * anggota, informasi pribadi yang beririsan dibaca dan ditulis langsung pada
 * rekam anggota kanonis. Akun tanpa hubungan anggota memakai informasi pribadi
 * miliknya sendiri, sehingga tidak pernah ada dua salinan profil yang dapat
 * disunting untuk satu orang yang sama.
 */

export type NexusProfileRelationship =
  | { kind: "LINKED"; member: NexusMemberRecord }
  | { kind: "NON_MEMBER" }
  | { kind: "UNLINKED" }
  | {
      conflictingAccountId?: string;
      kind: "CONFLICT";
      member?: NexusMemberRecord;
    };

/** Menandai dari mana informasi pribadi pada proyeksi ini berasal. */
export type NexusProfileSource = "ACCOUNT" | "MEMBER";

export type NexusProfileRequiredField = "fullName" | "phone";

export type NexusProfileView = {
  account: NexusAccountDirectoryRecord;
  alternateEmail: string;
  avatarOriginalSrc?: ImageProps["src"];
  avatarPosition: NexusMemberAvatarPosition;
  avatarSrc?: ImageProps["src"];
  biography: string;
  /** Nama yang dipakai pada identitas header dan sapaan singkat. */
  displayName: string;
  fullName: string;
  hasPersonalData: boolean;
  initials: string;
  institutionalEmail: string;
  isComplete: boolean;
  missingRequiredFields: readonly NexusProfileRequiredField[];
  phone: string;
  preferredName: string;
  relationship: NexusProfileRelationship;
  role: NexusRoleResolution;
  source: NexusProfileSource;
};

export const nexusProfileRequiredFieldLabels: Record<
  NexusProfileRequiredField,
  string
> = {
  fullName: "Nama lengkap",
  phone: "Nomor HP",
};

export const nexusProfileRelationshipLabels = {
  CONFLICT: "Hubungan keanggotaan perlu diperiksa",
  LINKED: "Anggota CoE BHT",
  NON_MEMBER: "Akun non-anggota",
  UNLINKED: "Hubungan keanggotaan belum ditentukan",
} as const;

function resolveProfileRelationship(
  account: NexusAccountDirectoryRecord,
  accounts: readonly NexusAccountDirectoryRecord[],
  members: readonly NexusMemberRecord[],
): NexusProfileRelationship {
  const relationship = resolveNexusAccountRelationship(account, accounts);
  if (relationship.kind === "NON_MEMBER") return { kind: "NON_MEMBER" };
  if (relationship.kind === "UNLINKED") return { kind: "UNLINKED" };

  const member = relationship.memberId
    ? members.find((candidate) => candidate.id === relationship.memberId)
    : undefined;

  if (relationship.kind === "LINKED" && member) {
    return { kind: "LINKED", member };
  }

  return {
    ...(relationship.kind === "CONFLICT" && relationship.conflictingAccountId
      ? { conflictingAccountId: relationship.conflictingAccountId }
      : {}),
    kind: "CONFLICT",
    ...(member ? { member } : {}),
  };
}

function missingRequiredFields(fullName: string, phone: string) {
  const missing: NexusProfileRequiredField[] = [];
  if (!fullName.trim()) missing.push("fullName");
  if (!phone.trim()) missing.push("phone");
  return missing;
}

function hasPersonalProfileData(
  values: Array<ImageProps["src"] | string | undefined>,
) {
  return values.some((value) =>
    typeof value === "string" ? Boolean(value.trim()) : Boolean(value),
  );
}

/**
 * Nama tampilan mengikuti urutan yang sama di setiap permukaan: nama panggilan,
 * nama lengkap, nama tampilan akun, lalu email masuk sebagai jalan terakhir.
 */
function profileDisplayName(
  preferredName: string,
  fullName: string,
  account: NexusAccountDirectoryRecord,
) {
  return (
    preferredName.trim() ||
    fullName.trim() ||
    account.displayName.trim() ||
    account.email
  );
}

export function resolveNexusProfile({
  account,
  accounts,
  members,
  roles,
}: {
  account: NexusAccountDirectoryRecord;
  accounts: readonly NexusAccountDirectoryRecord[];
  members: readonly NexusMemberRecord[];
  roles: readonly NexusRoleRecord[];
}): NexusProfileView {
  const relationship = resolveProfileRelationship(account, accounts, members);
  const role = resolveNexusRole(account.roleId, roles);

  if (relationship.kind === "LINKED") {
    const { member } = relationship;
    const fullName = member.name;
    const preferredName = member.identity.preferredName;
    const phone = member.contact.phone ?? "";
    const missing = missingRequiredFields(fullName, phone);

    return {
      account,
      alternateEmail: member.contact.alternateEmail ?? "",
      avatarOriginalSrc: member.avatarOriginalSrc,
      avatarPosition: member.avatarPosition
        ? { ...member.avatarPosition }
        : { ...DEFAULT_MEMBER_AVATAR_POSITION },
      avatarSrc: member.avatarSrc,
      biography: member.biography,
      displayName: profileDisplayName(preferredName, fullName, account),
      fullName,
      hasPersonalData: hasPersonalProfileData([
        fullName,
        preferredName,
        phone,
        member.contact.alternateEmail,
        member.contact.institutionalEmail,
        member.biography,
        member.avatarSrc,
      ]),
      initials: personInitials(fullName || account.displayName),
      institutionalEmail: member.contact.institutionalEmail ?? "",
      isComplete: missing.length === 0,
      missingRequiredFields: missing,
      phone,
      preferredName,
      relationship,
      role,
      source: "MEMBER",
    };
  }

  const personalProfile = account.personalProfile ?? {};
  const fullName = personalProfile.fullName ?? "";
  const preferredName = personalProfile.preferredName ?? "";
  const phone = personalProfile.phone ?? "";
  const missing = missingRequiredFields(fullName, phone);

  return {
    account,
    alternateEmail: personalProfile.alternateEmail ?? "",
    avatarOriginalSrc: personalProfile.avatarOriginalSrc,
    avatarPosition: personalProfile.avatarPosition
      ? { ...personalProfile.avatarPosition }
      : { ...DEFAULT_MEMBER_AVATAR_POSITION },
    avatarSrc: personalProfile.avatarSrc,
    biography: personalProfile.biography ?? "",
    displayName: profileDisplayName(preferredName, fullName, account),
    fullName,
    hasPersonalData: hasPersonalProfileData([
      fullName,
      preferredName,
      phone,
      personalProfile.alternateEmail,
      personalProfile.biography,
      personalProfile.avatarSrc,
    ]),
    initials: personInitials(fullName || account.displayName),
    institutionalEmail: "",
    isComplete: missing.length === 0,
    missingRequiredFields: missing,
    phone,
    preferredName,
    relationship,
    role,
    source: "ACCOUNT",
  };
}

export type NexusProfileDraft = {
  alternateEmail: string;
  avatarOriginalSrc?: ImageProps["src"];
  avatarPosition: NexusMemberAvatarPosition;
  avatarSrc?: ImageProps["src"];
  biography: string;
  fullName: string;
  institutionalEmail: string;
  phone: string;
  preferredName: string;
};

export type NexusProfileField = keyof NexusProfileDraft;
export type NexusProfileErrors = Partial<Record<NexusProfileField, string>>;

export function createNexusProfileDraft(
  profile: NexusProfileView,
): NexusProfileDraft {
  return {
    alternateEmail: profile.alternateEmail,
    avatarOriginalSrc: profile.avatarOriginalSrc,
    avatarPosition: { ...profile.avatarPosition },
    avatarSrc: profile.avatarSrc,
    biography: profile.biography,
    fullName: profile.fullName,
    institutionalEmail: profile.institutionalEmail,
    phone: profile.phone,
    preferredName: profile.preferredName,
  };
}

export function nexusProfileDraftIsDirty(
  draft: NexusProfileDraft,
  initialDraft: NexusProfileDraft,
) {
  return JSON.stringify(draft) !== JSON.stringify(initialDraft);
}

export function validateNexusProfileDraft(
  draft: NexusProfileDraft,
  { includeInstitutionalEmail }: { includeInstitutionalEmail: boolean },
) {
  const errors: NexusProfileErrors = {};

  if (!draft.fullName.trim()) errors.fullName = "Nama lengkap wajib diisi.";
  if (!draft.phone.trim()) errors.phone = "Nomor HP wajib diisi.";
  if (draft.alternateEmail.trim() && !nexusValidEmail(draft.alternateEmail)) {
    errors.alternateEmail = "Gunakan alamat email yang valid.";
  }
  if (
    includeInstitutionalEmail &&
    draft.institutionalEmail.trim() &&
    !nexusValidEmail(draft.institutionalEmail)
  ) {
    errors.institutionalEmail = "Gunakan alamat email yang valid.";
  }

  return errors;
}

/**
 * Menuliskan bidang pribadi bersama ke rekam anggota kanonis. Hanya nama,
 * nama panggilan, kontak personal, ringkasan, dan foto yang ditulis; bidang
 * organisasi, bidang keahlian, serta pengenal akademik pada rekam yang sama
 * dipertahankan apa adanya.
 */
export function applyNexusPersonalProfileToMember(
  member: NexusMemberRecord,
  draft: NexusProfileDraft,
): NexusMemberRecord {
  return {
    ...member,
    avatarOriginalSrc: draft.avatarSrc ? draft.avatarOriginalSrc : undefined,
    avatarPosition: draft.avatarSrc ? { ...draft.avatarPosition } : undefined,
    avatarSrc: draft.avatarSrc,
    biography: draft.biography.trim(),
    contact: {
      ...member.contact,
      alternateEmail: draft.alternateEmail.trim() || undefined,
      institutionalEmail: draft.institutionalEmail.trim() || undefined,
      phone: draft.phone.trim() || undefined,
    },
    identity: {
      ...member.identity,
      preferredName: draft.preferredName.trim() || draft.fullName.trim(),
    },
    name: draft.fullName.trim(),
    updatedAt: formatAuditTimestamp(),
  };
}

/**
 * Batas kepemilikan penyuntingan profil sendiri.
 *
 * Setiap editor pada halaman Profil Saya hanya boleh menyerahkan bidang yang
 * memang dimilikinya. Bidang milik organisasi—penugasan CoE, unit utama,
 * status keanggotaan, dan tanggal bergabung—sengaja tidak pernah menjadi
 * bagian dari kontrak ini, sehingga pemilik akun tidak dapat menulisnya
 * meskipun sedang menyunting bidang lain. Perubahan bidang tersebut tetap
 * menjadi kewenangan direktori Anggota.
 */
export type NexusMemberProfileSettingsPatch = {
  office: string;
  publicProfile: boolean;
};

export type NexusMemberExpertisePatch = {
  primaryExpertise: string;
  secondaryExpertise: string;
};

export type NexusMemberAcademicPatch = {
  googleScholar: string;
  orcid: string;
  researcherId: string;
  scopusAuthorId: string;
  sintaId: string;
};

export type NexusSelfMemberPatch =
  | { kind: "academic"; value: NexusMemberAcademicPatch }
  | { kind: "expertise"; value: NexusMemberExpertisePatch }
  | { kind: "member"; value: NexusMemberProfileSettingsPatch };

/**
 * Menerapkan satu patch profil sendiri ke rekam anggota kanonis. Hanya
 * kelompok bidang yang disebut patch yang ditulis ulang; bidang lain pada
 * rekam dipertahankan apa adanya sehingga penyuntingan satu kartu tidak
 * pernah menyentuh nilai kartu lain. Normalisasi pengenal akademik memakai
 * aturan yang sama dengan direktori Anggota.
 */
export function applyNexusSelfMemberPatch(
  member: NexusMemberRecord,
  patch: NexusSelfMemberPatch,
): NexusMemberRecord {
  const base: NexusMemberRecord = {
    ...member,
    updatedAt: formatAuditTimestamp(),
  };

  if (patch.kind === "member") {
    return {
      ...base,
      affiliation: {
        ...member.affiliation,
        office: patch.value.office.trim() || undefined,
      },
      membership: {
        ...member.membership,
        publicProfile: patch.value.publicProfile,
      },
    };
  }

  if (patch.kind === "expertise") {
    return {
      ...base,
      expertise: {
        primary: patch.value.primaryExpertise.trim() || undefined,
        secondary: memberSecondaryExpertiseList(patch.value.secondaryExpertise),
      },
    };
  }

  const normalized = normalizedMemberDraft({
    ...createEditDraft(member),
    ...patch.value,
  });

  return {
    ...base,
    academic: {
      googleScholar: normalized.googleScholar || undefined,
      orcid: normalized.orcid || undefined,
      researcherId: normalized.researcherId || undefined,
      scopusAuthorId: normalized.scopusAuthorId || undefined,
      sintaId: normalized.sintaId || undefined,
    },
  };
}

export function nexusAccountPersonalProfileFromDraft(
  draft: NexusProfileDraft,
): NexusAccountPersonalProfile {
  return {
    alternateEmail: draft.alternateEmail.trim() || undefined,
    avatarOriginalSrc: draft.avatarSrc ? draft.avatarOriginalSrc : undefined,
    avatarPosition: draft.avatarSrc ? { ...draft.avatarPosition } : undefined,
    avatarSrc: draft.avatarSrc,
    biography: draft.biography.trim() || undefined,
    fullName: draft.fullName.trim() || undefined,
    phone: draft.phone.trim() || undefined,
    preferredName: draft.preferredName.trim() || undefined,
  };
}
