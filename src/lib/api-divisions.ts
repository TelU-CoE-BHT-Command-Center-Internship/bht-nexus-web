import { apiFetch } from "@/lib/api-client";

/** Satu klaster riset CoE BHT sebagaimana dicatat server. */
export type NexusDivision = {
  description?: string | null;
  leader?: { publicId: string; name: string } | null;
  code: string | null;
  name: string;
  publicId: string;
};

/**
 * Cakupan data akun yang sedang masuk menurut server. Ketua klaster hanya
 * melihat rekam yang melibatkan anggota klasternya; peran lain melihat semua
 * klaster dan boleh memilih satu klaster sebagai filter.
 */
export type NexusDataScope =
  | { kind: "all" }
  | { division: NexusDivision; kind: "division" }
  | { kind: "none" };

export function listDivisions(): Promise<NexusDivision[]> {
  return apiFetch("/divisions");
}

export type DivisionWriteBody = {
  name: string;
  code?: string | null;
  description?: string | null;
  leaderMemberPublicId?: string | null;
};

export function createDivision(
  body: DivisionWriteBody,
): Promise<NexusDivision> {
  return apiFetch("/divisions", { method: "POST", body: JSON.stringify(body) });
}

export function updateDivision(
  publicId: string,
  body: DivisionWriteBody,
): Promise<NexusDivision> {
  return apiFetch(`/divisions/${encodeURIComponent(publicId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** Parameter kueri klaster, kosong bila semua klaster ditampilkan. */
export function divisionQuery(divisionPublicId: string | undefined) {
  return divisionPublicId
    ? `divisionPublicId=${encodeURIComponent(divisionPublicId)}`
    : "";
}
