import type {
  MetadataCompletionFieldKey,
  MetadataCompletionFieldState,
  MetadataCompletionProposal,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { metadataCompletionFieldStateLabels } from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import detail from "@/components/nexus-workspace-ui/nexus-workspace-detail.module.css";

export type NexusMetadataCompletenessItem = {
  fieldState?: MetadataCompletionFieldState;
  key: string;
  label: string;
  missingFieldKey?: MetadataCompletionFieldKey;
  value: string;
};

function proposalSummary(
  proposal: MetadataCompletionProposal | undefined,
  key: MetadataCompletionFieldKey,
) {
  const resolution = proposal?.resolutions[key];
  if (!resolution) return null;
  if (resolution.status === "provided") return resolution.value;
  if (resolution.status === "not-available") {
    return `Diajukan sebagai memang tidak tersedia · ${resolution.reason}`;
  }
  return `Diajukan sebagai tidak berlaku · ${resolution.reason}`;
}

const markerByState = {
  available: "✓",
  "not-applicable": "—",
  "not-available": "−",
  unresolved: "?",
} satisfies Record<MetadataCompletionFieldState, string>;

/** Satu presentasi status metadata untuk seluruh rumah data resmi. */
export function NexusMetadataCompletenessList({
  items,
  proposal,
}: {
  items: readonly NexusMetadataCompletenessItem[];
  proposal?: MetadataCompletionProposal;
}) {
  return (
    <ul className={detail.completenessList}>
      {items.map((item) => {
        const fieldState = item.fieldState ?? "available";
        const isPending = Boolean(item.missingFieldKey && proposal);
        const status = isPending ? "pending" : fieldState;
        const summary = item.missingFieldKey
          ? proposalSummary(proposal, item.missingFieldKey)
          : null;

        return (
          <li data-status={status} key={item.key}>
            <span aria-hidden="true" className={detail.completenessMarker}>
              {status === "pending" ? "↗" : markerByState[fieldState]}
            </span>
            <span className={detail.completenessCopy}>
              <strong>{item.label}</strong>
              <small>{summary ?? item.value}</small>
            </span>
            <span className={detail.completenessStatus}>
              {status === "pending"
                ? "Menunggu Tinjauan"
                : metadataCompletionFieldStateLabels[fieldState]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
