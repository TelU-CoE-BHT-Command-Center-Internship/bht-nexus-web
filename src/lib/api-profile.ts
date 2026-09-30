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
