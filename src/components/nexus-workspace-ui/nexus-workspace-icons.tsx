export type NexusWorkspaceIconName =
  | "activity"
  | "alert"
  | "book"
  | "briefcase"
  | "building"
  | "bulb"
  | "certificate"
  | "chart"
  | "check"
  | "clock"
  | "contract"
  | "database"
  | "document"
  | "flask"
  | "globe"
  | "graduation"
  | "heart"
  | "money"
  | "pencil"
  | "people"
  | "search"
  | "shield"
  | "target";

export function NexusWorkspaceIconPaths({
  name,
}: {
  name: NexusWorkspaceIconName;
}) {
  switch (name) {
    case "activity":
      return (
        <>
          <rect height="15.5" rx="2.2" width="17" x="3.5" y="5" />
          <path d="M8 3.5v3.6M16 3.5v3.6M3.5 10.4h17" />
          <path d="m9 15.2 2 2 4-4.2" />
        </>
      );
    case "alert":
      return (
        <>
          <path d="M12 3.5 20.5 20.5h-17Z" />
          <path d="M12 9.6v4.7M12 17.4h.01" />
        </>
      );
    case "book":
      return (
        <>
          <path d="M12 6.8C10.2 5.2 8 4.4 3.5 4.4v12.4c4.5 0 6.7.8 8.5 2.4 1.8-1.6 4-2.4 8.5-2.4V4.4c-4.5 0-6.7.8-8.5 2.4Z" />
          <path d="M12 6.8v12.4" />
        </>
      );
    case "briefcase":
      return (
        <>
          <rect height="12.4" rx="2.2" width="17" x="3.5" y="7.6" />
          <path d="M9 7.6V6.1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
          <path d="M3.5 12.6h17" />
        </>
      );
    case "building":
      return (
        <>
          <path d="M4.6 20.5V5.2a1.7 1.7 0 0 1 1.7-1.7h7.4a1.7 1.7 0 0 1 1.7 1.7v15.3" />
          <path d="M15.4 9.6h2.7a1.7 1.7 0 0 1 1.7 1.7v9.2" />
          <path d="M3.5 20.5h17" />
          <path d="M8.1 7.6h1.6M8.1 11.2h1.6M8.1 14.8h1.6M12.3 7.6h1.6M12.3 11.2h1.6M12.3 14.8h1.6" />
        </>
      );
    case "bulb":
      return (
        <>
          <path d="M15.9 15.4A6.6 6.6 0 1 0 8.1 15.4a4.2 4.2 0 0 1 1.4 2.5h5a4.2 4.2 0 0 1 1.4-2.5Z" />
          <path d="M9.7 17.9v1.2a1.4 1.4 0 0 0 1.4 1.4h1.8a1.4 1.4 0 0 0 1.4-1.4v-1.2" />
        </>
      );
    case "certificate":
      return (
        <>
          <path d="M5.5 3.5h8.6l4.4 4.4v6.6H5.5Z" />
          <path d="M14.1 3.5v4.4h4.4M8.6 7.4h3.4M8.6 10.8h5.4" />
          <path d="M12 14.5v6l3.2-1.7 3.3 1.7v-6" />
        </>
      );
    case "chart":
      return (
        <>
          <path d="M3.5 20.5h17" />
          <path d="M7.6 20.5v-9.4M12 20.5V3.5M16.4 20.5v-6.6" />
        </>
      );
    case "check":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8 12.3 2.8 2.8 5.4-6" />
        </>
      );
    case "clock":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 6.9v5.4l3.6 2.1" />
        </>
      );
    case "contract":
      return (
        <>
          <path d="M13.2 3.5H6.8a2.2 2.2 0 0 0-2.2 2.2v12.6a2.2 2.2 0 0 0 2.2 2.2h5" />
          <path d="M13.2 3.5v5.2h5.2M8.4 10.5h3.6M8.4 13.9h2.8" />
          <path d="m19.6 13-5.4 5.4-2.7.8.8-2.7 5.4-5.4a1.35 1.35 0 0 1 1.9 1.9Z" />
        </>
      );
    case "database":
      return (
        <>
          <ellipse cx="12" cy="6.4" rx="8.5" ry="3.2" />
          <path d="M3.5 6.4v5.6c0 1.8 3.8 3.2 8.5 3.2s8.5-1.4 8.5-3.2V6.4M3.5 12v5.6c0 1.8 3.8 3.2 8.5 3.2s8.5-1.4 8.5-3.2V12" />
        </>
      );
    case "document":
      return (
        <>
          <path d="M13.6 3.5H7.2a2.2 2.2 0 0 0-2.2 2.2v12.6a2.2 2.2 0 0 0 2.2 2.2h9.6a2.2 2.2 0 0 0 2.2-2.2V8.7Z" />
          <path d="M13.6 3.5v5.2h5.2M8.8 12.9h6.4M8.8 16.3h4.2" />
        </>
      );
    case "flask":
      return (
        <>
          <path d="M9.6 3.5h4.8M10.6 3.5v5.4L5 17.7a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5.6-8.8V3.5" />
          <path d="M7.7 14.6h8.6" />
        </>
      );
    case "globe":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17" />
          <path d="M12 3.5c2.5 2.4 3.9 5.4 3.9 8.5S14.5 18.1 12 20.5c-2.5-2.4-3.9-5.4-3.9-8.5S9.5 5.9 12 3.5Z" />
        </>
      );
    case "graduation":
      return (
        <>
          <path d="M12 4.2 3.5 8.3 12 12.4l8.5-4.1Z" />
          <path d="M7 11v5.3c0 1.9 2.2 3.2 5 3.2s5-1.3 5-3.2V11" />
          <path d="M20.5 8.3v6.6" />
        </>
      );
    case "heart":
      return (
        <path d="M12 19.9 5.2 13a4.6 4.6 0 0 1 6.2-6.7l.6.5.6-.5A4.6 4.6 0 0 1 18.8 13Z" />
      );
    case "money":
      return (
        <>
          <rect height="11.4" rx="2.2" width="17" x="3.5" y="6.3" />
          <circle cx="12" cy="12" r="2.7" />
          <path d="M7.1 10.2v3.6M16.9 10.2v3.6" />
        </>
      );
    case "pencil":
      return (
        <>
          <path d="M16.9 3.5a2.5 2.5 0 0 1 3.5 3.5L8.1 19.4l-4.6 1.1 1.1-4.6Z" />
          <path d="m14.3 6.1 3.5 3.5" />
        </>
      );
    case "people":
      return (
        <>
          <circle cx="9.2" cy="8.3" r="3.8" />
          <path d="M3.5 20.5a5.7 5.7 0 0 1 11.4 0" />
          <path d="M16.1 4.9a3.8 3.8 0 0 1 0 6.8" />
          <path d="M17.2 15.2a5.7 5.7 0 0 1 3.3 5.3" />
        </>
      );
    case "search":
      return (
        <>
          <circle cx="10.6" cy="10.6" r="7.1" />
          <path d="m15.9 15.9 4.6 4.6" />
        </>
      );
    case "shield":
      return (
        <>
          <path d="M12 3.5 5 6.6v5.7c0 3.9 2.8 6.9 7 8.4 4.2-1.5 7-4.5 7-8.4V6.6Z" />
          <path d="m8.9 12.1 2.2 2.2 4-4.3" />
        </>
      );
    case "target":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="4.6" />
          <circle cx="12" cy="12" r="1.1" />
        </>
      );
  }
}
