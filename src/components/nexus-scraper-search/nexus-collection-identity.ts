import type { NexusMemberId } from "@/components/nexus-members/nexus-member-identity";
import type { CollectionSource } from "@/components/nexus-scraper-search/nexus-scraper-search-content";
import { normalizeWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-format";

export type CollectionMemberBinding = {
  memberId: NexusMemberId;
  memberName: string;
  profileUrl: string;
  source: CollectionSource;
  sourcePersonId: string;
};

export type CollectionIdentityInput = {
  memberId?: NexusMemberId;
  memberName?: string;
  profileUrl?: string;
  source?: CollectionSource;
};

export function collectionSourcePersonId(
  urlValue: string,
  source: CollectionSource,
) {
  try {
    const url = new URL(urlValue);
    if (url.protocol !== "https:") return undefined;

    if (source === "sinta") {
      if (url.hostname !== "sinta.kemdiktisaintek.go.id") return undefined;
      const match = url.pathname.match(/^\/authors\/profile\/(\d+)\/?$/);
      return match?.[1];
    }

    if (url.hostname !== "scholar.google.com") return undefined;
    const personId = url.searchParams.get("user")?.trim();
    return personId || undefined;
  } catch {
    return undefined;
  }
}

export function createCollectionMemberBinding(
  input: CollectionIdentityInput,
): CollectionMemberBinding | undefined {
  const memberId = input.memberId?.trim();
  const memberName = input.memberName?.trim();
  const profileUrl = input.profileUrl?.trim();
  const source = input.source;
  if (!memberId || !memberName || !profileUrl || !source) return undefined;

  const sourcePersonId = collectionSourcePersonId(profileUrl, source);
  if (!sourcePersonId) return undefined;

  return { memberId, memberName, profileUrl, source, sourcePersonId };
}

export function collectionMemberBindingMatches(
  binding: CollectionMemberBinding | undefined,
  input: { memberName: string; profileUrl: string; source: CollectionSource },
) {
  if (!binding || binding.source !== input.source) return false;
  if (
    normalizeWorkspaceSearch(binding.memberName) !==
    normalizeWorkspaceSearch(input.memberName)
  ) {
    return false;
  }

  return (
    collectionSourcePersonId(input.profileUrl, input.source) ===
    binding.sourcePersonId
  );
}

export function collectionProfileMatchesSource(
  urlValue: string,
  source: CollectionSource,
) {
  return Boolean(collectionSourcePersonId(urlValue, source));
}
