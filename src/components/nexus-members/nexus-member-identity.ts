import { normalizeWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-format";

export type NexusMemberId = string;

export type NexusKnownMemberIdentityKey =
  | "ammar"
  | "dita"
  | "fathur"
  | "hesty"
  | "laily"
  | "miftadi"
  | "salsabila"
  | "suksmandhira";

type KnownMemberIdentity = {
  aliases: readonly string[];
  id: NexusMemberId;
  name: string;
};

/**
 * Satu definisi identitas anggota kanonis untuk sumber konten publik, direktori
 * Anggota, dan adapter fixture/workbook. ID ditulis eksplisit agar perubahan
 * gelar atau nama tampilan tidak pernah menghasilkan identitas baru.
 *
 * Alias hanya dipakai untuk menyelaraskan fixture yang belum membawa memberId.
 * Relasi runtime tetap wajib memakai memberId eksplisit dan tidak boleh
 * menyimpulkan identitas dari kemiripan nama.
 */
const knownMemberIdentities: Record<
  NexusKnownMemberIdentityKey,
  KnownMemberIdentity
> = {
  hesty: {
    aliases: ["Hesty Susanti", "Dr. Hesty Susanti, S.T., M.T."],
    id: "hesty-susanti",
    name: "Dr. Hesty Susanti, S.T., M.T.",
  },
  ammar: {
    aliases: ["Muhammad Ammar Asyraf", "M. Ammar Asyraf", "MAM"],
    id: "muhammad-ammar-asyraf-s-t-m-t",
    name: "Muhammad Ammar Asyraf, S.T., M.T.",
  },
  salsabila: {
    aliases: ["Salsabila Aurellia"],
    id: "salsabila-aurellia-s-t-m-t",
    name: "Salsabila Aurellia, S.T., M.T.",
  },
  suksmandhira: {
    aliases: ["Suksmandhira Harimurti"],
    id: "dr-suksmandhira-harimurti-s-t-m-eng",
    name: "Dr. Suksmandhira Harimurti, S.T., M.Eng.",
  },
  fathur: {
    aliases: ["Fathur Rahman"],
    id: "fathur-rahman-s-t-m-t",
    name: "Fathur Rahman, S.T., M.T.",
  },
  dita: {
    aliases: ["Dita Puspitasari", "D. Puspitasari"],
    id: "dita-puspitasari-s-t-b-sc-m-t",
    name: "Dita Puspitasari, S.T., B.Sc., M.T.",
  },
  miftadi: {
    aliases: ["Miftadi Sudjai", "Miftadi Sudja'i"],
    id: "ir-miftadi-sudjai-m-sc-ph-d",
    name: "Ir. Miftadi Sudjai, M.Sc., Ph.D.",
  },
  laily: {
    aliases: ["Laily Ade Oktaviana"],
    id: "laily-ade-oktaviana-s-t-m-t",
    name: "Laily Ade Oktaviana, S.T., M.T.",
  },
};

const identityList = Object.values(knownMemberIdentities);

const aliasToMemberId = new Map(
  identityList.flatMap((member) =>
    [member.name, ...member.aliases].map(
      (alias) => [normalizeWorkspaceSearch(alias), member.id] as const,
    ),
  ),
);

const identityById = new Map(
  identityList.map((member) => [member.id, member] as const),
);

export function getKnownMemberIdentity(key: NexusKnownMemberIdentityKey) {
  return knownMemberIdentities[key];
}

export function knownMemberName(memberId?: string) {
  return memberId ? identityById.get(memberId)?.name : undefined;
}

export function resolveKnownMemberId(name: string) {
  return aliasToMemberId.get(normalizeWorkspaceSearch(name));
}

export function relatedDataHref(pathname: string, memberId: NexusMemberId) {
  return `${pathname}?member=${encodeURIComponent(memberId)}`;
}
