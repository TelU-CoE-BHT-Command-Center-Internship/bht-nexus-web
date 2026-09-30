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
 * Informasi pribadi akun. Server menulis ulang keempat bidang sekaligus dan
 * mengosongkan bidang yang tidak dikirim, sehingga nilai yang tidak diubah
 * tetap harus dikirim apa adanya.
 */
export type MyProfileUpdate = {
  bio: string | null;
  image: string | null;
  name: string;
  phone: string | null;
};

export function updateMyProfile(input: MyProfileUpdate): Promise<MyProfile> {
  return apiFetch("/profile/me", {
    body: JSON.stringify(input),
    method: "PATCH",
  });
}

/**
 * Pengenal akademik anggota yang tertaut ke akun ini. Ketiganya selalu dikirim
 * karena server mengosongkan pengenal yang tidak disertakan.
 */
export type MyAcademicIdentifiers = {
  googleScholarId: string | null;
  scopusId: string | null;
  sintaId: string | null;
};

export function updateMyAcademicIdentifiers(
  input: MyAcademicIdentifiers,
): Promise<MyProfile> {
  return apiFetch("/profile/me/academic-identifiers", {
    body: JSON.stringify(input),
    method: "PATCH",
  });
}
