import {
  DEFAULT_MEMBER_AVATAR_POSITION,
  type NexusMemberAvatarPosition,
} from "@/components/nexus-members/nexus-member-avatar";
import type {
  NexusMemberRecord,
  NexusMemberStatus,
} from "@/components/nexus-members/nexus-members-content";
import { normalizeWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-format";

export type MemberProfileDraft = {
  alternateEmail: string;
  avatarPosition: NexusMemberAvatarPosition;
  avatarSrc?: NexusMemberRecord["avatarSrc"];
  biography: string;
  coeAssignment: string;
  googleScholar: string;
  institutionalEmail: string;
  joinedAt: string;
  membershipStatus: NexusMemberStatus;
  name: string;
  office: string;
  orcid: string;
  phone: string;
  preferredName: string;
  primaryExpertise: string;
  primaryUnit: string;
  publicProfile: boolean;
  researcherId: string;
  scopusAuthorId: string;
  secondaryExpertise: string;
  sintaId: string;
};

export type MemberProfileField = keyof MemberProfileDraft;
export type MemberProfileErrors = Partial<Record<MemberProfileField, string>>;

export type ProfileEditorState = {
  initialValue: MemberProfileDraft;
  mode: "create" | "edit";
  value: MemberProfileDraft;
};

export const DEFAULT_MEMBER_UNIT = "CoE Biomedical & Healthcare Technology";

export const statusDefinitions = [
  { id: "all", label: "Semua" },
  { id: "active", label: "Aktif" },
  { id: "on_leave", label: "Cuti" },
  { id: "inactive", label: "Nonaktif" },
] as const;

export const statusLabels: Record<NexusMemberStatus, string> = {
  active: "Aktif",
  inactive: "Nonaktif",
  on_leave: "Cuti",
};

export function createEditDraft(member: NexusMemberRecord): MemberProfileDraft {
  return {
    alternateEmail: member.contact.alternateEmail ?? "",
    avatarPosition: {
      ...(member.avatarPosition ?? DEFAULT_MEMBER_AVATAR_POSITION),
    },
    avatarSrc: member.avatarSrc,
    biography: member.biography,
    coeAssignment: member.coeAssignment,
    googleScholar: member.academic.googleScholar ?? "",
    institutionalEmail: member.contact.institutionalEmail ?? "",
    joinedAt: member.membership.joinedAt ?? "",
    membershipStatus: member.membership.status,
    name: member.name,
    office: member.affiliation.office ?? "",
    orcid: member.academic.orcid ?? "",
    phone: member.contact.phone ?? "",
    preferredName: member.identity.preferredName,
    primaryExpertise: member.expertise.primary ?? "",
    primaryUnit: member.affiliation.primaryUnit,
    publicProfile: member.membership.publicProfile,
    researcherId: member.academic.researcherId ?? "",
    scopusAuthorId: member.academic.scopusAuthorId ?? "",
    secondaryExpertise: member.expertise.secondary.join(", "),
    sintaId: member.academic.sintaId ?? "",
  };
}

export function createNewMemberDraft(): MemberProfileDraft {
  return {
    alternateEmail: "",
    avatarPosition: { ...DEFAULT_MEMBER_AVATAR_POSITION },
    avatarSrc: undefined,
    biography: "",
    coeAssignment: "",
    googleScholar: "",
    institutionalEmail: "",
    joinedAt: "",
    membershipStatus: "active",
    name: "",
    office: "",
    orcid: "",
    phone: "",
    preferredName: "",
    primaryExpertise: "",
    primaryUnit: DEFAULT_MEMBER_UNIT,
    publicProfile: false,
    researcherId: "",
    scopusAuthorId: "",
    secondaryExpertise: "",
    sintaId: "",
  };
}

export function profileDraftIsDirty(editor: ProfileEditorState) {
  return JSON.stringify(editor.value) !== JSON.stringify(editor.initialValue);
}

function normalizedIdentifier(field: MemberProfileField, value: string) {
  if (field === "orcid") return normalizeOrcid(value).replace(/-/g, "");
  if (field === "googleScholar") {
    try {
      return (
        new URL(value).searchParams.get("user")?.toLocaleLowerCase("id-ID") ??
        ""
      );
    } catch {
      return normalizeWorkspaceSearch(value).replace(/\s+/g, "");
    }
  }
  if (field === "scopusAuthorId") return value.replace(/\D/g, "");
  return normalizeWorkspaceSearch(value).replace(/[\s-]+/g, "");
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function normalizeOrcid(value: string) {
  const compact = value
    .trim()
    .replace(/^https?:\/\/(?:www\.)?orcid\.org\//i, "")
    .replace(/[^0-9x]/gi, "")
    .toUpperCase();

  return compact.length === 16
    ? (compact.match(/.{1,4}/g)?.join("-") ?? compact)
    : value.trim();
}

function validOrcid(value: string) {
  const compact = normalizeOrcid(value).replace(/-/g, "");
  if (!/^\d{15}[\dX]$/.test(compact)) return false;

  let total = 0;
  for (const digit of compact.slice(0, 15)) {
    total = (total + Number(digit)) * 2;
  }
  const remainder = total % 11;
  const result = (12 - remainder) % 11;
  const checkDigit = result === 10 ? "X" : String(result);
  return compact.at(-1) === checkDigit;
}

function validGoogleScholar(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "scholar.google.com" &&
      url.pathname === "/citations" &&
      Boolean(url.searchParams.get("user"))
    );
  } catch {
    return false;
  }
}

function duplicateOwner(
  records: readonly NexusMemberRecord[],
  currentMemberId: string | undefined,
  field: MemberProfileField,
  selector: (member: NexusMemberRecord) => string | undefined,
  value: string,
) {
  const needle = normalizedIdentifier(field, value);
  return records.find(
    (member) =>
      member.id !== currentMemberId &&
      normalizedIdentifier(field, selector(member) ?? "") === needle,
  );
}

export function validateMemberProfile(
  draft: MemberProfileDraft,
  records: readonly NexusMemberRecord[],
  currentMemberId?: string,
) {
  const errors: MemberProfileErrors = {};

  if (!draft.name.trim()) errors.name = "Nama lengkap wajib diisi.";
  if (!draft.coeAssignment.trim()) {
    errors.coeAssignment = "Penugasan CoE wajib diisi.";
  }
  if (!draft.primaryUnit.trim()) errors.primaryUnit = "Unit utama wajib diisi.";

  if (
    draft.institutionalEmail.trim() &&
    !validEmail(draft.institutionalEmail)
  ) {
    errors.institutionalEmail = "Gunakan alamat email yang valid.";
  }
  if (draft.alternateEmail.trim() && !validEmail(draft.alternateEmail)) {
    errors.alternateEmail = "Gunakan alamat email yang valid.";
  }

  if (draft.sintaId.trim() && !/^\d{4,}$/.test(draft.sintaId.trim())) {
    errors.sintaId = "Gunakan ID numerik dari profil SINTA.";
  }
  if (draft.orcid.trim() && !validOrcid(draft.orcid)) {
    errors.orcid =
      "ORCID iD tidak valid. Periksa 16 digit dan digit pemeriksa.";
  }
  if (draft.googleScholar.trim() && !validGoogleScholar(draft.googleScholar)) {
    errors.googleScholar =
      "Gunakan URL profil https://scholar.google.com/citations?user=…";
  }
  if (
    draft.scopusAuthorId.trim() &&
    !/^\d{6,15}$/.test(draft.scopusAuthorId.trim())
  ) {
    errors.scopusAuthorId = "Scopus Author ID harus berupa 6–15 digit.";
  }
  if (
    draft.researcherId.trim() &&
    !/^[A-Z]{1,3}-\d{4}-\d{4}$/i.test(draft.researcherId.trim())
  ) {
    errors.researcherId =
      "Gunakan format ResearcherID, misalnya AAB-1234-2026.";
  }

  const identifiers = [
    [
      "sintaId",
      "SINTA ID",
      (member: NexusMemberRecord) => member.academic.sintaId,
    ],
    ["orcid", "ORCID iD", (member: NexusMemberRecord) => member.academic.orcid],
    [
      "googleScholar",
      "Google Scholar",
      (member: NexusMemberRecord) => member.academic.googleScholar,
    ],
    [
      "scopusAuthorId",
      "Scopus Author ID",
      (member: NexusMemberRecord) => member.academic.scopusAuthorId,
    ],
    [
      "researcherId",
      "ResearcherID",
      (member: NexusMemberRecord) => member.academic.researcherId,
    ],
  ] as const;

  for (const [field, label, selector] of identifiers) {
    const value = draft[field];
    if (!value.trim() || errors[field]) continue;
    const owner = duplicateOwner(
      records,
      currentMemberId,
      field,
      selector,
      value,
    );
    if (owner) errors[field] = `${label} sudah digunakan oleh ${owner.name}`;
  }

  return errors;
}

export function normalizedMemberDraft(draft: MemberProfileDraft) {
  return {
    ...draft,
    googleScholar: draft.googleScholar.trim(),
    orcid: normalizeOrcid(draft.orcid),
    researcherId: draft.researcherId.trim().toUpperCase(),
    scopusAuthorId: draft.scopusAuthorId.trim(),
    sintaId: draft.sintaId.trim(),
  };
}
