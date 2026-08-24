import { normalizeWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-format";

export type NexusMemberId = string;

type KnownMemberIdentity = {
  aliases: readonly string[];
  id: NexusMemberId;
  name: string;
};

/**
 * Alias ini hanya adapter fixture untuk menyelaraskan nama pada workbook dengan
 * ID anggota kanonis. Server kelak mengirim relasi `memberId` secara eksplisit;
 * UI tidak boleh menjalankan pencocokan nama ini sebagai keputusan identitas.
 */
const knownMemberIdentities: readonly KnownMemberIdentity[] = [
  {
    aliases: ["Hesty Susanti", "Dr. Hesty Susanti, S.T., M.T."],
    id: "hesty-susanti",
    name: "Dr. Hesty Susanti, S.T., M.T.",
  },
  {
    aliases: ["Muhammad Ammar Asyraf", "M. Ammar Asyraf", "MAM"],
    id: "muhammad-ammar-asyraf-s-t-m-t",
    name: "Muhammad Ammar Asyraf, S.T., M.T.",
  },
  {
    aliases: ["Salsabila Aurellia"],
    id: "salsabila-aurellia-s-t-m-t",
    name: "Salsabila Aurellia, S.T., M.T.",
  },
  {
    aliases: ["Suksmandhira Harimurti"],
    id: "dr-suksmandhira-harimurti-s-t-m-eng",
    name: "Dr. Suksmandhira Harimurti, S.T., M.Eng.",
  },
  {
    aliases: ["Fathur Rahman"],
    id: "fathur-rahman-s-t-m-t",
    name: "Fathur Rahman, S.T., M.T.",
  },
  {
    aliases: ["Dita Puspitasari", "D. Puspitasari"],
    id: "dita-puspitasari-s-t-b-sc-m-t",
    name: "Dita Puspitasari, S.T., B.Sc., M.T.",
  },
  {
    aliases: ["Miftadi Sudjai", "Miftadi Sudja'i"],
    id: "ir-miftadi-sudjai-m-sc-ph-d",
    name: "Ir. Miftadi Sudjai, M.Sc., Ph.D.",
  },
  {
    aliases: ["Laily Ade Oktaviana"],
    id: "laily-ade-oktaviana-s-t-m-t",
    name: "Laily Ade Oktaviana, S.T., M.T.",
  },
];

const aliasToMemberId = new Map(
  knownMemberIdentities.flatMap((member) =>
    [member.name, ...member.aliases].map(
      (alias) => [normalizeWorkspaceSearch(alias), member.id] as const,
    ),
  ),
);

const identityById = new Map(
  knownMemberIdentities.map((member) => [member.id, member] as const),
);

export function knownMemberName(memberId?: string) {
  return memberId ? identityById.get(memberId)?.name : undefined;
}

export function resolveKnownMemberId(name: string) {
  return aliasToMemberId.get(normalizeWorkspaceSearch(name));
}

export function relatedDataHref(pathname: string, memberId: NexusMemberId) {
  return `${pathname}?member=${encodeURIComponent(memberId)}`;
}
