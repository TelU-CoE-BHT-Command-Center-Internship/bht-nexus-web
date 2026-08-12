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
    case "x-circle":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m9 9 6 6M15 9l-6 6" />
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
