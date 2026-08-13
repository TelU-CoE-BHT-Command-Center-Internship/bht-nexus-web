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
          <path d="M6 2h8l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
          <path d="M14 2v6h5M8 13h7M8 17h7" />
        </>
      );
    case "administration":
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V21h-4v-.08A1.7 1.7 0 0 0 8.96 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.52-1.03H3v-4h.08A1.7 1.7 0 0 0 4.6 8.96a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.96 4.6 1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.03 1.52 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
        </>
      );
    case "documents":
      return (
        <>
          <path d="M8 2h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
          <path d="M14 2v5h4M9.5 12h5M9.5 16h5" />
        </>
      );
    case "questions":
      return (
        <>
          <path d="M21 11.5a8 8 0 0 1-11.6 7.15L4 20.5l1.85-5.4A8 8 0 1 1 21 11.5Z" />
          <path d="M10.2 9.4a2 2 0 1 1 2.55 2.2c-.7.2-1.1.6-1.1 1.2v.3M12 16h.01" />
        </>
      );
    case "extraction":
      return (
        <>
          <path d="M4 4h9l3 3v4M4 4v16h8" />
          <path d="M15.5 14.5 19 18l-3.5 3.5M22 18h-6.5" />
        </>
      );
    case "candidates":
      return (
        <>
          <rect x="3.5" y="5" width="17" height="14" rx="2" />
          <path d="M3.5 10h17M8 14.5l1.8 1.8L13 13" />
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
