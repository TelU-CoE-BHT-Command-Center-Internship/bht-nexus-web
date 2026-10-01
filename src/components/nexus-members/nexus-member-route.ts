export type NexusMemberFilteredPageProps = {
  searchParams: Promise<{ member?: string | string[] }>;
};

const memberPublicIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Penanda anggota dari `?member=`; nilai yang bukan penanda publik diabaikan. */
export async function memberIdFromSearchParams(
  searchParams: NexusMemberFilteredPageProps["searchParams"],
) {
  const { member } = await searchParams;
  const value = Array.isArray(member) ? member[0] : member;
  return value && memberPublicIdPattern.test(value) ? value : undefined;
}
