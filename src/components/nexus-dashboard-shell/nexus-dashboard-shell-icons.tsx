import type { DashboardShellIconName } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";

type IconName =
  | DashboardShellIconName
  | "bell"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "close"
  | "help"
  | "menu"
  | "search"
  | "user";

type DashboardShellIconProps = {
  name: IconName;
};

function IconPaths({ name }: DashboardShellIconProps) {
  switch (name) {
    case "dashboard":
      return (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </>
      );
    case "members":
      return (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      );
    case "publications":
      return (
        <>
          <path d="M12 7.4C10.4 5.9 8.4 5.2 4.3 5.2v11.6c4.1 0 6.1.7 7.7 2.2 1.6-1.5 3.6-2.2 7.7-2.2V5.2c-4.1 0-6.1.7-7.7 2.2Z" />
          <path d="M12 7.4V19" />
        </>
      );
    case "documents":
      return (
        <>
          <path d="M8 2h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
          <path d="M14 2v5h4M9.5 12h5M9.5 16h5" />
        </>
      );
    case "intellectualProperty":
      return (
        <>
          <path d="M12 2.5 4.5 6v6.2c0 4.3 3.1 7.6 7.5 9.3 4.4-1.7 7.5-5 7.5-9.3V6L12 2.5Z" />
          <path d="M9 11.8h6M12 8.8v6" />
        </>
      );
    case "contracts":
      return (
        <>
          <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
          <path d="M13.5 3v5h5M9 9.5h3M9 13h3" />
          <path d="m20.4 13.1-5.5 5.5-2.7.8.8-2.7 5.5-5.5a1.3 1.3 0 0 1 1.9 1.9Z" />
        </>
      );
    case "academic":
      return (
        <>
          <path d="M12 4 2.8 8.5 12 13l9.2-4.5L12 4Z" />
          <path d="M6.5 10.8v4.6c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9v-4.6M20.6 9v5.2" />
        </>
      );
    case "activities":
      return (
        <>
          <rect height="15" rx="2" width="17" x="3.5" y="5.5" />
          <path d="M7.5 3v5M16.5 3v5M3.5 10.5h17M8 14.2h3.5M8 17.4h6.5" />
        </>
      );
    case "reviews":
      return (
        <>
          <rect x="4" y="4" width="16" height="18" rx="2" />
          <path d="M9 4.5V3a3 3 0 0 1 6 0v1.5M8.5 13l2.25 2.25L16 10" />
        </>
      );
    case "administration":
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V21h-4v-.08A1.7 1.7 0 0 0 8.96 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.52-1.03H3v-4h.08A1.7 1.7 0 0 0 4.6 8.96a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.96 4.6 1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.03 1.52 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
        </>
      );
    case "search":
      return (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </>
      );
    case "bell":
      return (
        <>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </>
      );
    case "help":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.7 9a2.6 2.6 0 1 1 3.15 2.54c-.85.24-1.35.73-1.35 1.46v.35M12 17.25h.01" />
        </>
      );
    case "user":
      return (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </>
      );
    case "menu":
      return <path d="M4 7h16M4 12h16M4 17h16" />;
    case "close":
      return <path d="m6 6 12 12M18 6 6 18" />;
    case "chevron-left":
      return <path d="m15 18-6-6 6-6" />;
    case "chevron-right":
      return <path d="m9 18 6-6-6-6" />;
    case "chevron-down":
      return <path d="m7 10 5 5 5-5" />;
  }
}

export function DashboardShellIcon({ name }: DashboardShellIconProps) {
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
