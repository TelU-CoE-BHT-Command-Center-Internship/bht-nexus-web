export type NexusMemberFilteredPageProps = {
  searchParams: Promise<{ member?: string | string[] }>;
};

export async function memberIdFromSearchParams(
  searchParams: NexusMemberFilteredPageProps["searchParams"],
) {
  const { member } = await searchParams;
  return Array.isArray(member) ? member[0] : member;
}
