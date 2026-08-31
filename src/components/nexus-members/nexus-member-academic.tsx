import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";

export type NexusAcademicIdentifier = keyof NexusMemberRecord["academic"];

/**
 * Alamat profil publik untuk setiap pengenal akademik.
 *
 * Satu definisi dipakai bersama oleh direktori Anggota dan halaman Profil Saya
 * supaya pengenal yang sama tidak pernah tampil sebagai tautan di satu tempat
 * dan sebagai teks biasa di tempat lain. Google Scholar sudah tersimpan sebagai
 * URL profil sehingga nilainya dipakai apa adanya.
 */
export function nexusAcademicProfileUrl(
  identifier: NexusAcademicIdentifier,
  value?: string,
) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  if (identifier === "googleScholar") return trimmed;
  if (identifier === "orcid") return `https://orcid.org/${trimmed}`;
  if (identifier === "sintaId") {
    return `https://sinta.kemdiktisaintek.go.id/authors/profile/${trimmed}`;
  }
  if (identifier === "scopusAuthorId") {
    return `https://www.scopus.com/authid/detail.uri?authorId=${trimmed}`;
  }
  return `https://www.webofscience.com/wos/author/record/${trimmed}`;
}

const identifierLabels: Record<NexusAcademicIdentifier, string> = {
  googleScholar: "Google Scholar",
  orcid: "ORCID iD",
  researcherId: "ResearcherID",
  scopusAuthorId: "Scopus Author ID",
  sintaId: "SINTA ID",
};

/**
 * Pengenal akademik ditampilkan sebagai tautan ke profil publiknya dan dibuka
 * pada tab baru agar pekerjaan yang sedang berjalan tidak ditinggalkan. Nama
 * aksesibelnya menyebut jenis pengenal dan tujuan tab baru, karena teks
 * tautannya sendiri berupa nomor yang tidak menjelaskan apa pun.
 */
export function NexusAcademicIdentifierValue({
  fallback = "Belum tercatat",
  identifier,
  value,
}: {
  fallback?: string;
  identifier: NexusAcademicIdentifier;
  value?: string;
}) {
  const href = nexusAcademicProfileUrl(identifier, value);
  if (!href) return <>{fallback}</>;

  const label =
    identifier === "googleScholar"
      ? "Buka profil"
      : (value?.trim() ?? fallback);

  return (
    <a
      aria-label={`Buka profil ${identifierLabels[identifier]} pada tab baru`}
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}
