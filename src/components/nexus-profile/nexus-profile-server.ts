"use client";

import { useCallback, useRef, useState } from "react";
import type { NexusRoleResolution } from "@/components/nexus-access-policy/nexus-access-policy";
import type { NexusAccountStatus } from "@/components/nexus-accounts/nexus-account-directory";
import { nexusServerRoleLabel } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { DEFAULT_MEMBER_AVATAR_POSITION } from "@/components/nexus-members/nexus-member-avatar";
import {
  nexusMemberFromDetail,
  nexusMemberFromSummary,
} from "@/components/nexus-members/nexus-member-server";
import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";
import {
  type MemberProfileDraft,
  type MemberProfileErrors,
  validateMemberProfile,
} from "@/components/nexus-members/nexus-members-model";
import type {
  NexusProfileDraft,
  NexusProfileErrors,
  NexusProfileRequiredField,
  NexusProfileView,
} from "@/components/nexus-profile/nexus-profile-model";
import { personInitials } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { apiErrorKind, apiErrorMessage, whenForbidden } from "@/lib/api-client";
import { getMember, listAllMembers } from "@/lib/api-members";
import {
  getMyProfile,
  type MyProfile,
  updateMyAcademicIdentifiers,
  updateMyProfile,
} from "@/lib/api-profile";
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
      /* Server hanya mengenal akun yang tertaut ke anggota atau tidak; akun
         tanpa tautan diperlakukan sebagai akun non-anggota. */
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

/** Hasil menyimpan dari Profil Saya; kosong bila tersimpan. */
export type NexusProfileSaveResult<Errors> =
  | { fieldErrors?: Errors; message?: string }
  | undefined;

/** Batas panjang yang diterima server untuk informasi pribadi akun. */
function accountProfileLimitErrors(draft: NexusProfileDraft) {
  const errors: NexusProfileErrors = {};
  if (draft.fullName.trim().length > 255) {
    errors.fullName = "Nama lengkap maksimal 255 karakter.";
  }
  if (draft.phone.trim().length > 50) {
    errors.phone = "Nomor HP maksimal 50 karakter.";
  }
  if (draft.biography.trim().length > 1000) {
    errors.biography = "Ringkasan profil maksimal 1.000 karakter.";
  }
  return errors;
}

/** Server menyimpan pengenal Google Scholar saja, bukan tautan profilnya. */
function googleScholarId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed).searchParams.get("user") ?? trimmed;
  } catch {
    return trimmed;
  }
}

/** Pengenal akademik yang dapat disimpan pemilik akun lewat server. */
export const nexusSelfAcademicFields = [
  "sintaId",
  "googleScholar",
  "scopusAuthorId",
] as const satisfies readonly (keyof MemberProfileDraft)[];

/** Profil akun yang sedang masuk, dibaca dari server setiap halaman dibuka. */
export function useNexusSessionProfile() {
  const [profile, setProfile] = useState<NexusProfileView>();
  const [state, setState] = useState<NexusProfileLoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const latestRequest = useRef(0);
  /* Profil akun sebagaimana terakhir dijawab server; nilai yang tidak
     disunting dikirim ulang apa adanya saat menyimpan. */
  const latestProfile = useRef<MyProfile>(undefined);

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
              .catch(whenForbidden(undefined))
          : undefined;
        if (request !== latestRequest.current) return;
        latestProfile.current = me;
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

  /**
   * Menyimpan nama lengkap, nomor HP, dan ringkasan profil pada akun. Foto
   * akun tidak disunting dari halaman ini, sehingga nilainya dikirim ulang.
   */
  const saveAccountProfile = useCallback(
    async (
      draft: NexusProfileDraft,
    ): Promise<NexusProfileSaveResult<NexusProfileErrors>> => {
      const current = latestProfile.current;
      if (!current) {
        return {
          message:
            "Profil Anda belum dapat disimpan. Muat ulang halaman lalu coba lagi.",
        };
      }
      const fieldErrors = accountProfileLimitErrors(draft);
      if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
      try {
        await updateMyProfile({
          bio: draft.biography.trim() || null,
          image: current.image,
          name: draft.fullName.trim(),
          phone: draft.phone.trim() || null,
        });
      } catch (error) {
        return {
          message: apiErrorMessage(
            error,
            "Informasi pribadi belum dapat disimpan.",
          ),
        };
      }
      load();
      return undefined;
    },
    [load],
  );

  /**
   * Menyimpan SINTA, Scopus, dan Google Scholar anggota yang tertaut ke akun
   * ini. Keunikannya diperiksa terhadap direktori Anggota bila boleh dibaca,
   * supaya bentrok tampil pada bidangnya; server tetap menolak bentrok.
   */
  const saveAcademicIdentifiers = useCallback(
    async (
      draft: MemberProfileDraft,
      memberId: string,
    ): Promise<NexusProfileSaveResult<MemberProfileErrors>> => {
      /* Tanpa direktori Anggota, bentrok hanya diperiksa oleh server. */
      const records = await listAllMembers()
        .then((members) => members.map(nexusMemberFromSummary))
        .catch(() => undefined);
      if (records) {
        const errors = validateMemberProfile(draft, records, memberId);
        const fieldErrors: MemberProfileErrors = {};
        for (const field of nexusSelfAcademicFields) {
          if (errors[field]) fieldErrors[field] = errors[field];
        }
        if (Object.keys(fieldErrors).length > 0) return { fieldErrors };
      }
      try {
        await updateMyAcademicIdentifiers({
          googleScholarId: googleScholarId(draft.googleScholar),
          scopusId: draft.scopusAuthorId.trim() || null,
          sintaId: draft.sintaId.trim() || null,
        });
      } catch (error) {
        return {
          message:
            apiErrorKind(error) === "conflict"
              ? "SINTA ID, Scopus Author ID, atau Google Scholar ini sudah dipakai anggota lain."
              : apiErrorMessage(
                  error,
                  "Identitas akademik belum dapat disimpan.",
                ),
        };
      }
      load();
      return undefined;
    },
    [load],
  );

  return {
    errorMessage,
    profile,
    retry: load,
    saveAcademicIdentifiers,
    saveAccountProfile,
    state,
  };
}
