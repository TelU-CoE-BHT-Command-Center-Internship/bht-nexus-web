import { apiFetch } from "@/lib/api-client";
import type { MembershipStatus } from "@/lib/api-members";

export type ProfileAccountStatus = "active" | "invited" | "suspended";

/** Profil akun yang sedang masuk, sebagaimana dijawab server. */
export type MyProfile = {
  bio: string | null;
  email: string;
  image: string | null;
  isLinkedMember: boolean;
  member: {
    googleScholarId: string | null;
    isPublic: boolean;
    joinedAt: string;
    publicId: string;
    scopusId: string | null;
    sintaId: string | null;
    status: MembershipStatus;
    name: string;
    preferredName: string | null;
    phone: string | null;
    biography: string | null;
    institutionalEmail: string | null;
    alternateEmail: string | null;
    primaryUnit: string;
    office: string | null;
    coeAssignment: string | null;
    primaryExpertise: string | null;
    secondaryExpertise: string[];
    orcid: string | null;
    researcherId: string | null;
    avatarSrc: string | null;
    avatarOriginalSrc: string | null;
    avatarPosition: { x: number; y: number } | null;
  } | null;
  name: string;
  phone: string | null;
  publicId: string;
  roles: { name: string }[];
  status: ProfileAccountStatus;
};

export function getMyProfile(): Promise<MyProfile> {
  return apiFetch("/profile/me");
}

/**
 * Informasi pribadi akun dan anggota yang tertaut. Foto disimpan terpisah.
 */
export type MyProfileUpdate = {
  bio: string | null;
  name: string;
  phone: string | null;
  preferredName?: string | null;
  institutionalEmail?: string | null;
  alternateEmail?: string | null;
};

export function updateMyProfile(input: MyProfileUpdate): Promise<MyProfile> {
  return apiFetch("/profile/me", {
    body: JSON.stringify(input),
    method: "PATCH",
  });
}

/**
 * Lima pengenal akademik anggota yang tertaut ke akun ini. Nilai kosong
 * menghapus pengenal terkait; server mempertahankan bidang yang tidak dikirim.
 */
export type MyAcademicIdentifiers = {
  googleScholarId: string | null;
  scopusId: string | null;
  sintaId: string | null;
  orcid: string | null;
  researcherId: string | null;
};

export function updateMyAcademicIdentifiers(
  input: MyAcademicIdentifiers,
): Promise<MyProfile> {
  return apiFetch("/profile/me/academic-identifiers", {
    body: JSON.stringify(input),
    method: "PATCH",
  });
}

export function updateMyMemberProfile(input: {
  office?: string | null;
  isPublic?: boolean;
  primaryExpertise?: string | null;
  secondaryExpertise?: string[];
}): Promise<MyProfile> {
  return apiFetch("/profile/me/member-profile", {
    body: JSON.stringify(input),
    method: "PATCH",
  });
}

export function getMyOriginalPhoto(): Promise<{ image: string }> {
  return apiFetch("/profile/me/photo/original");
}

export function removeMyPhoto(): Promise<MyProfile> {
  return apiFetch("/profile/me/photo", { method: "DELETE" });
}

export async function updateMyPhoto(
  cropped: string,
  original: string,
): Promise<MyProfile> {
  const body = new FormData();
  for (const [field, value] of [
    ["cropped", cropped],
    ["original", original],
  ]) {
    const type = /^data:image\/(jpeg|png|webp);base64,/.exec(value)?.[1];
    if (!type) throw new Error("Pilih dan atur foto sebelum menyimpan.");
    const blob = await fetch(value).then((response) => response.blob());
    body.append(field, blob, `${field}.${type === "jpeg" ? "jpg" : type}`);
  }
  return apiFetch("/profile/me/photo", { body, method: "POST" });
}
