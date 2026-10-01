import { getMember } from "@/lib/api-members";

const names = new Map<string, Promise<string | undefined>>();

function nameOf(publicId: string) {
  const cached = names.get(publicId);
  if (cached) return cached;
  const lookup = getMember(publicId)
    .then((member) => member.name)
    .catch(() => undefined);
  names.set(publicId, lookup);
  return lookup;
}

/** Nama anggota untuk sekumpulan id; id yang tidak terbaca dilewati. */
export async function resolveMemberNames(
  publicIds: readonly string[],
): Promise<Map<string, string>> {
  const unique = [...new Set(publicIds)];
  const resolved = await Promise.all(unique.map(nameOf));
  return new Map(
    unique.flatMap((id, index) => {
      const name = resolved[index];
      return name ? [[id, name] as const] : [];
    }),
  );
}
