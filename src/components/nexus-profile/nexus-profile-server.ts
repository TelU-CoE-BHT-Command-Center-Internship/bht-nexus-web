"use client";

import { useCallback, useRef, useState } from "react";
import type { NexusRoleResolution } from "@/components/nexus-access-policy/nexus-access-policy";
import type { NexusAccountStatus } from "@/components/nexus-accounts/nexus-account-directory";
import { nexusServerRoleLabel } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { DEFAULT_MEMBER_AVATAR_POSITION } from "@/components/nexus-members/nexus-member-avatar";
import { nexusMemberFromDetail } from "@/components/nexus-members/nexus-member-server";
import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";
import type {
  NexusProfileRequiredField,
  NexusProfileView,
} from "@/components/nexus-profile/nexus-profile-model";
import { personInitials } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { apiErrorKind, apiErrorMessage } from "@/lib/api-client";
import { getMember } from "@/lib/api-members";
import { getMyProfile, type MyProfile } from "@/lib/api-profile";
import { useLoadEffect } from "@/lib/use-load-effect";

/**
 * Satu-satunya penerjemah profil akun server ke bentuk halaman Profil Saya.
 * Identitas pada halaman ini selalu akun yang sedang masuk, sama dengan yang
 * tampil pada header. Bidang yang belum dijawab server dibiarkan kosong.
 */

const accountStatuses: Record<MyProfile["status"], NexusAccountStatus> = {
  active: "ACTIVE",
  invited: "INVITED",
  suspended: "SUSPENDED",
};

function optional(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function googleScholarUrl(id: string | null): string | undefined {
  const value = optional(id);
  return value
    ? `https://scholar.google.com/citations?user=${encodeURIComponent(value)}`
    : undefined;
}

function roleResolution(profile: MyProfile): NexusRoleResolution {
  if (profile.roles.length === 0) return { kind: "UNASSIGNED" };
  return {
    kind: "KNOWN",
    role: {
      description: "",
      id: profile.roles[0].name,
      kind: "SYSTEM",
      label: profile.roles
        .map((role) => nexusServerRoleLabel(role.name))
        .join(", "),
      permissions: [],
      status: "ACTIVE",
    },
  };
}

/**
 * Rekam anggota dari ringkasan pada profil akun, dipakai ketika rincian
 * anggotanya tidak boleh dibaca oleh peran akun ini.
 */
function memberFromProfile(profile: MyProfile): NexusMemberRecord | undefined {
  const member = profile.member;
  if (!member) return undefined;
  return {
    academic: {
      googleScholar: googleScholarUrl(member.googleScholarId),
      scopusAuthorId: optional(member.scopusId) || undefined,
      sintaId: optional(member.sintaId) || undefined,
    },
    affiliation: { institution: "", primaryUnit: "" },
    biography: "",
    coeAssignment: "",
    contact: {},
    expertise: { secondary: [] },
    id: member.publicId,
    identity: { preferredName: "" },
    membership: {
      joinedAt: optional(member.joinedAt) || undefined,
      publicProfile: member.isPublic,
      status: member.status,
    },
    name: profile.name,
  };
}

function missingRequiredFields(fullName: string, phone: string) {
  const missing: NexusProfileRequiredField[] = [];
  if (!fullName.trim()) missing.push("fullName");
  if (!phone.trim()) missing.push("phone");
  return missing;
}

export function nexusProfileFromServer(
  profile: MyProfile,
  linkedMember?: NexusMemberRecord,
): NexusProfileView {
  const member = linkedMember ?? memberFromProfile(profile);
  /* Akun yang terhubung ke anggota membaca informasi pribadinya dari rekam
     anggota bila rekam itu berhasil dibaca; selain itu dari akun sendiri. */
  const fullName = linkedMember ? linkedMember.name : profile.name;
  const preferredName = linkedMember?.identity.preferredName ?? "";
  const phone = linkedMember
    ? optional(linkedMember.contact.phone)
    : optional(profile.phone);
  const biography = linkedMember
    ? linkedMember.biography
    : optional(profile.bio);
  const missing = missingRequiredFields(fullName, phone);

  return {
    account: {
      createdAt: "",
      createdBy: "",
      displayName: profile.name,
      email: profile.email,
      id: profile.publicId,
      relationship: member
        ? { kind: "LINKED", memberId: member.id }
        : { kind: "NON_MEMBER" },
      roleId: profile.roles[0]?.name,
      status: accountStatuses[profile.status],
      updatedAt: "",
    },
    alternateEmail: optional(linkedMember?.contact.alternateEmail),
    avatarOriginalSrc: linkedMember?.avatarOriginalSrc,
    avatarPosition: linkedMember?.avatarPosition
      ? { ...linkedMember.avatarPosition }
      : { ...DEFAULT_MEMBER_AVATAR_POSITION },
    avatarSrc: linkedMember
      ? linkedMember.avatarSrc
      : optional(profile.image) || undefined,
    biography,
    displayName:
      preferredName.trim() || fullName.trim() || profile.name || profile.email,
    fullName,
    hasPersonalData: [fullName, preferredName, phone, biography].some(
      (value) => value.trim() !== "",
    ),
    initials: personInitials(fullName || profile.name),
    institutionalEmail: optional(linkedMember?.contact.institutionalEmail),
    isComplete: missing.length === 0,
    missingRequiredFields: missing,
    phone,
    preferredName,
    relationship: member ? { kind: "LINKED", member } : { kind: "NON_MEMBER" },
    role: roleResolution(profile),
    source: linkedMember ? "MEMBER" : "ACCOUNT",
  };
}

export type NexusProfileLoadState = "error" | "loading" | "ready";

/** Profil akun yang sedang masuk, dibaca dari server setiap halaman dibuka. */
export function useNexusSessionProfile() {
  const [profile, setProfile] = useState<NexusProfileView>();
  const [state, setState] = useState<NexusProfileLoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    getMyProfile()
      .then(async (me) => {
        /* Rincian anggota hanya dapat dibaca peran yang berwenang; tanpa itu
           profil tetap tampil dari ringkasan keanggotaan pada akun. */
        const member = me.member
          ? await getMember(me.member.publicId)
              .then(nexusMemberFromDetail)
              .catch((error: unknown) => {
                if (apiErrorKind(error) === "forbidden") return undefined;
                throw error;
              })
          : undefined;
        if (request !== latestRequest.current) return;
        setProfile(nexusProfileFromServer(me, member));
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(
          apiErrorMessage(error, "Profil Anda belum dapat dimuat."),
        );
        setState("error");
      });
  }, []);

  useLoadEffect(load);

  return { errorMessage, profile, retry: load, state };
}
