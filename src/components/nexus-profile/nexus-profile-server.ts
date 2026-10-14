"use client";

import { useCallback, useRef, useState } from "react";
import type { NexusRoleResolution } from "@/components/nexus-access-policy/nexus-access-policy";
import type { NexusAccountStatus } from "@/components/nexus-accounts/nexus-account-directory";
import { nexusServerRoleLabel } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { DEFAULT_MEMBER_AVATAR_POSITION } from "@/components/nexus-members/nexus-member-avatar";
import { nexusMemberFromSummary } from "@/components/nexus-members/nexus-member-server";
import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";
import {
  type MemberProfileDraft,
  type MemberProfileErrors,
  normalizeOrcid,
  validateMemberProfile,
} from "@/components/nexus-members/nexus-members-model";
import type {
  NexusProfileDraft,
  NexusProfileErrors,
  NexusProfileRequiredField,
  NexusProfileView,
} from "@/components/nexus-profile/nexus-profile-model";
import { personInitials } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { apiErrorKind, apiErrorMessage } from "@/lib/api-client";
import { listAllMembers } from "@/lib/api-members";
import {
  getMyProfile,
  type MyProfile,
  removeMyPhoto,
  updateMyAcademicIdentifiers,
  updateMyMemberProfile,
  updateMyPhoto,
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
 * Rekam milik pemilik sesi; tidak membutuhkan izin membaca anggota lain.
 */
function memberFromProfile(profile: MyProfile): NexusMemberRecord | undefined {
  const member = profile.member;
  if (!member) return undefined;
  return {
    academic: {
      googleScholar: googleScholarUrl(member.googleScholarId),
      scopusAuthorId: optional(member.scopusId) || undefined,
      sintaId: optional(member.sintaId) || undefined,
      orcid: optional(member.orcid) || undefined,
      researcherId: optional(member.researcherId) || undefined,
    },
    affiliation: {
      institution: "Telkom University",
      primaryUnit: member.primaryUnit,
      office: optional(member.office),
    },
    biography: optional(member.biography),
    coeAssignment: optional(member.coeAssignment),
    contact: {
      phone: optional(member.phone),
      institutionalEmail: optional(member.institutionalEmail),
      alternateEmail: optional(member.alternateEmail),
    },
    expertise: {
      primary: optional(member.primaryExpertise),
      secondary: member.secondaryExpertise,
    },
    avatarSrc: member.avatarSrc ?? profile.image ?? undefined,
    avatarOriginalSrc: member.avatarOriginalSrc ?? undefined,
    avatarPosition: member.avatarPosition ?? {
      ...DEFAULT_MEMBER_AVATAR_POSITION,
    },
    id: member.publicId,
    identity: { preferredName: optional(member.preferredName) },
    membership: {
      joinedAt: optional(member.joinedAt) || undefined,
      publicProfile: member.isPublic,
      status: member.status,
    },
    name: member.name,
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
  const fullName = member ? member.name : profile.name;
  const preferredName = member?.identity.preferredName ?? "";
  const phone = member
    ? optional(member.contact.phone)
    : optional(profile.phone);
  const biography = member ? member.biography : optional(profile.bio);
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
    alternateEmail: optional(member?.contact.alternateEmail),
    avatarOriginalSrc: member?.avatarOriginalSrc,
    avatarPosition: member?.avatarPosition
      ? { ...member.avatarPosition }
      : { ...DEFAULT_MEMBER_AVATAR_POSITION },
    avatarSrc: member ? member.avatarSrc : optional(profile.image) || undefined,
    biography,
    displayName:
      preferredName.trim() || fullName.trim() || profile.name || profile.email,
    fullName,
    hasPersonalData: [fullName, preferredName, phone, biography].some(
      (value) => value.trim() !== "",
    ),
    initials: personInitials(fullName || profile.name),
    institutionalEmail: optional(member?.contact.institutionalEmail),
    isComplete: missing.length === 0,
    missingRequiredFields: missing,
    phone,
    preferredName,
    relationship: member ? { kind: "LINKED", member } : { kind: "NON_MEMBER" },
    role: roleResolution(profile),
    source: member ? "MEMBER" : "ACCOUNT",
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
  "orcid",
  "researcherId",
] as const satisfies readonly (keyof MemberProfileDraft)[];

/** Profil akun yang sedang masuk, dibaca dari server setiap halaman dibuka. */
export function useNexusSessionProfile() {
  const [profile, setProfile] = useState<NexusProfileView>();
  const [state, setState] = useState<NexusProfileLoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const latestRequest = useRef(0);
  /* Foto terakhir dijawab server dipakai untuk membedakan ganti/hapus dan
     penyimpanan informasi pribadi tanpa perubahan foto. */
  const latestProfile = useRef<MyProfile>(undefined);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    getMyProfile()
      .then((me) => {
        if (request !== latestRequest.current) return;
        latestProfile.current = me;
        setProfile(nexusProfileFromServer(me));
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
   * Menyimpan informasi pribadi dan, bila berubah, foto milik pemilik sesi.
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
        latestProfile.current = await updateMyProfile({
          bio: draft.biography.trim() || null,
          name: draft.fullName.trim(),
          phone: draft.phone.trim() || null,
          ...(current.member
            ? {
                preferredName: draft.preferredName.trim() || null,
                institutionalEmail: draft.institutionalEmail.trim() || null,
                alternateEmail: draft.alternateEmail.trim() || null,
              }
            : {}),
        });
      } catch (error) {
        return {
          message: apiErrorMessage(
            error,
            "Informasi pribadi belum dapat disimpan.",
          ),
        };
      }
      const initialPhoto =
        current.member?.avatarSrc ?? current.image ?? undefined;
      if (draft.avatarSrc !== initialPhoto) {
        try {
          latestProfile.current =
            typeof draft.avatarSrc === "string" && draft.avatarSrc
              ? await updateMyPhoto(
                  draft.avatarSrc,
                  typeof draft.avatarOriginalSrc === "string"
                    ? draft.avatarOriginalSrc
                    : draft.avatarSrc,
                )
              : await removeMyPhoto();
        } catch (error) {
          load();
          return {
            message: `Informasi pribadi tersimpan. ${apiErrorMessage(error, "Foto belum dapat disimpan. Coba lagi.")}`,
          };
        }
      }
      load();
      return undefined;
    },
    [load],
  );

  /**
   * Menyimpan lima pengenal akademik anggota yang tertaut ke akun
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
          orcid: normalizeOrcid(draft.orcid) || null,
          researcherId: draft.researcherId.trim() || null,
        });
      } catch (error) {
        return {
          message:
            apiErrorKind(error) === "conflict"
              ? "Salah satu identitas akademik ini sudah dipakai anggota lain."
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

  const saveMemberProfile = useCallback(
    async (
      draft: MemberProfileDraft,
      kind: "expertise" | "member",
    ): Promise<NexusProfileSaveResult<MemberProfileErrors>> => {
      try {
        await updateMyMemberProfile(
          kind === "member"
            ? {
                office: draft.office.trim() || null,
                isPublic: draft.publicProfile,
              }
            : {
                primaryExpertise: draft.primaryExpertise.trim() || null,
                secondaryExpertise: [
                  ...new Set(
                    draft.secondaryExpertise
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean),
                  ),
                ],
              },
        );
      } catch (error) {
        return {
          message: apiErrorMessage(
            error,
            "Profil anggota belum dapat disimpan.",
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
    saveMemberProfile,
    state,
  };
}
