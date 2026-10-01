import { apiFetch, apiFetchPaginated } from "@/lib/api-client";

export type MembershipStatus = "active" | "inactive" | "on_leave";

export type MemberAccountAccessKind = "CONFLICT" | "LINKED" | "NONE";

export type MemberSummary = {
  academicTitle?: string | null;
  accountAccess?: {
    email?: string | null;
    kind: MemberAccountAccessKind;
    userPublicId?: string | null;
  };
  avatarSrc?: string | null;
  coeAssignment?: string | null;
  googleScholarId: string | null;
  isPublic: boolean;
  joinedAt: string;
  name: string;
  office?: string | null;
  orcid?: string | null;
  preferredName?: string | null;
  primaryExpertise?: string | null;
  primaryUnit?: string;
  publicId: string;
  researcherId?: string | null;
  scopusId: string | null;
  secondaryExpertise?: string[];
  sintaId: string | null;
  status: MembershipStatus;
};

export type MemberDetail = {
  academic: {
    googleScholarId: string | null;
    orcid: string | null;
    researcherId: string | null;
    scopusId: string | null;
    sintaId: string | null;
  };
  academicTitle: string | null;
  accountAccess: {
    account?: {
      email: string;
      name: string;
      publicId: string;
      roles: string[];
      status: string;
    } | null;
    kind: MemberAccountAccessKind;
  };
  affiliation: {
    institution: string;
    office: string | null;
    primaryUnit: string;
  };
  avatarOriginalSrc: string | null;
  avatarPosition: { x: number; y: number } | null;
  avatarSrc: string | null;
  biography: string | null;
  coeAssignment: string | null;
  contact: {
    alternateEmail: string | null;
    institutionalEmail: string | null;
    phone: string | null;
  };
  createdAt: string;
  expertise: { primary: string | null; secondary: string[] };
  membership: { isPublic: boolean; joinedAt: string; status: MembershipStatus };
  name: string;
  preferredName: string | null;
  publicId: string;
  updatedAt: string;
  worksCount: {
    activities: number;
    intellectualProperties: number;
    publications: number;
  };
};

export type ListMembersParams = {
  isPublic?: boolean;
  limit?: number;
  page?: number;
  search?: string;
  sortBy?: "createdAt" | "joinedAt" | "name";
  sortOrder?: "asc" | "desc";
  status?: MembershipStatus;
};

const MAX_PAGE_SIZE = 100;

function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query === "" ? "" : `?${query}`;
}

export function listMembers(
  params: ListMembersParams = {},
): Promise<{ data: MemberSummary[]; meta: { total: number } }> {
  return apiFetchPaginated(`/members${buildQuery(params)}`);
}

/**
 * Seluruh direktori anggota, dibaca per halaman sebanyak yang diizinkan server.
 * Direktori CoE berukuran kecil sehingga pencarian dan filter dapat dilakukan
 * di halaman tanpa menghilangkan hitungan per status.
 */
export async function listAllMembers(): Promise<MemberSummary[]> {
  const members: MemberSummary[] = [];
  for (let page = 1; ; page += 1) {
    const result = await listMembers({
      limit: MAX_PAGE_SIZE,
      page,
      sortBy: "name",
      sortOrder: "asc",
    });
    members.push(...result.data);
    if (result.data.length === 0 || members.length >= result.meta.total) {
      return members;
    }
  }
}

/** Isian anggota yang diterima server saat membuat atau mengubah anggota. */
export type MemberWriteBody = {
  alternateEmail?: string | null;
  biography?: string | null;
  coeAssignment?: string | null;
  googleScholarId?: string | null;
  institutionalEmail?: string | null;
  isPublic: boolean;
  joinedAt?: string;
  name: string;
  office?: string | null;
  orcid?: string | null;
  phone?: string | null;
  preferredName?: string | null;
  primaryExpertise?: string | null;
  primaryUnit: string;
  researcherId?: string | null;
  scopusId?: string | null;
  secondaryExpertise: string[];
  sintaId?: string | null;
  status: MembershipStatus;
};

/** Server menerima isian opsional pada pembuatan anggota hanya bila terisi. */
function withoutEmpty(body: MemberWriteBody) {
  return Object.fromEntries(
    Object.entries(body).filter(
      ([, value]) => value !== null && value !== undefined,
    ),
  );
}

export function createMember(body: MemberWriteBody): Promise<MemberDetail> {
  return apiFetch("/members", {
    body: JSON.stringify(withoutEmpty(body)),
    method: "POST",
  });
}

export function updateMember(
  publicId: string,
  body: MemberWriteBody,
): Promise<MemberDetail> {
  return apiFetch(`/members/${encodeURIComponent(publicId)}`, {
    body: JSON.stringify(body),
    method: "PATCH",
  });
}

export function updateMemberAvatar(
  publicId: string,
  body: {
    avatarOriginalSrc?: string;
    avatarPosition?: { x: number; y: number };
    avatarSrc: string;
  },
): Promise<MemberDetail> {
  return apiFetch(`/members/${encodeURIComponent(publicId)}/avatar`, {
    body: JSON.stringify(body),
    method: "POST",
  });
}

export function getMember(publicId: string): Promise<MemberDetail> {
  return apiFetch(`/members/${encodeURIComponent(publicId)}`);
}
