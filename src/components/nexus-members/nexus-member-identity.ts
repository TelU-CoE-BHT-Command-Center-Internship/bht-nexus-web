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
  id: NexusMemberId;
  name: string;
};

/**
 * Identitas anggota untuk halaman Anggota situs publik. ID ditulis eksplisit agar
 * perubahan gelar atau nama tampilan tidak pernah menghasilkan identitas baru.
 */
const knownMemberIdentities: Record<
  NexusKnownMemberIdentityKey,
  KnownMemberIdentity
> = {
  hesty: {
    id: "hesty-susanti",
    name: "Dr. Hesty Susanti, S.T., M.T.",
  },
  ammar: {
    id: "muhammad-ammar-asyraf-s-t-m-t",
    name: "Muhammad Ammar Asyraf, S.T., M.T.",
  },
  salsabila: {
    id: "salsabila-aurellia-s-t-m-t",
    name: "Salsabila Aurellia, S.T., M.T.",
  },
  suksmandhira: {
    id: "dr-suksmandhira-harimurti-s-t-m-eng",
    name: "Dr. Suksmandhira Harimurti, S.T., M.Eng.",
  },
  fathur: {
    id: "fathur-rahman-s-t-m-t",
    name: "Fathur Rahman, S.T., M.T.",
  },
  dita: {
    id: "dita-puspitasari-s-t-b-sc-m-t",
    name: "Dita Puspitasari, S.T., B.Sc., M.T.",
  },
  miftadi: {
    id: "ir-miftadi-sudjai-m-sc-ph-d",
    name: "Ir. Miftadi Sudjai, M.Sc., Ph.D.",
  },
  laily: {
    id: "laily-ade-oktaviana-s-t-m-t",
    name: "Laily Ade Oktaviana, S.T., M.T.",
  },
};

export function getKnownMemberIdentity(key: NexusKnownMemberIdentityKey) {
  return knownMemberIdentities[key];
}

export function relatedDataHref(pathname: string, memberId: NexusMemberId) {
  return `${pathname}?member=${encodeURIComponent(memberId)}`;
}
