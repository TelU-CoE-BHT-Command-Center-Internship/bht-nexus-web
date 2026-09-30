import type { MetadataCompletionResolutions } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import type { CompletionProposalItem } from "@/lib/api-publications";

export function toCompletionProposals(
  resolutions: MetadataCompletionResolutions,
): Record<string, CompletionProposalItem> {
  return Object.fromEntries(
    Object.entries(resolutions).flatMap(([field, resolution]) =>
      resolution
        ? [
            [
              field,
              {
                reason: resolution.reason.trim() || undefined,
                status: resolution.status,
                value: resolution.value,
              },
            ],
          ]
        : [],
    ),
  );
}
