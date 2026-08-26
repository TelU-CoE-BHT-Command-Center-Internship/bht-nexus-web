export type NexusWorkspaceIconName =
  | "activity"
  | "alert"
  | "book"
  | "certificate"
  | "chart"
  | "check"
  | "clock"
  | "contract"
  | "database"
  | "document"
  | "graduation"
  | "search"
  | "shield";

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
    case "graduation":
      return (
        <>
          <path d="M12 4.2 3.5 8.3 12 12.4l8.5-4.1Z" />
          <path d="M7 11v5.3c0 1.9 2.2 3.2 5 3.2s5-1.3 5-3.2V11" />
          <path d="M20.5 8.3v6.6" />
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
  }
}
