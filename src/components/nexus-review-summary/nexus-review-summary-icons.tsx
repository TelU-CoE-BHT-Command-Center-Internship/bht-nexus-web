import type { ReviewSummaryIconName } from "@/components/nexus-review-summary/nexus-review-summary-content";

type NexusReviewSummaryIconProps = {
  name: ReviewSummaryIconName;
};

function IconPaths({ name }: NexusReviewSummaryIconProps) {
  switch (name) {
    case "clock":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v5l3.25 2" />
        </>
      );
    case "edit":
      return (
        <>
          <path d="M13.5 5H5.75A1.75 1.75 0 0 0 4 6.75v11.5A1.75 1.75 0 0 0 5.75 20h11.5A1.75 1.75 0 0 0 19 18.25V10.5" />
          <path d="m9 15 1.1-3.65L17.35 4.1a1.63 1.63 0 0 1 2.3 2.3l-7.25 7.25L9 15Z" />
        </>
      );
    case "check-circle":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.2 12.1 2.45 2.45 5.2-5.2" />
        </>
      );
    case "review-complete":
      return (
        <>
          <path d="M7 5.5h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z" />
          <path d="M9 3.5h6v4H9zM8.5 12h7M8.5 16h3.25" />
          <circle cx="17.5" cy="17.5" r="3.25" />
          <path d="m16.2 17.55.85.85 1.7-1.7" />
        </>
      );
  }
}

export function NexusReviewSummaryIcon({ name }: NexusReviewSummaryIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <IconPaths name={name} />
    </svg>
  );
}
