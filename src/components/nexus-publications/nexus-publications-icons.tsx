export type PublicationsIconName =
  | "alert"
  | "book"
  | "check"
  | "database"
  | "quartile";

type NexusPublicationsIconProps = {
  name: PublicationsIconName;
};

function IconPaths({ name }: NexusPublicationsIconProps) {
  switch (name) {
    case "alert":
      return (
        <>
          <path d="M12 3.5 21 20H3L12 3.5Z" />
          <path d="M12 9v5M12 17.2h.01" />
        </>
      );
    case "book":
      return (
        <>
          <path d="M5.5 4.5h9a2 2 0 0 1 2 2v13h-9a2 2 0 0 1-2-2v-13Z" />
          <path d="M16.5 7.5h2a1.5 1.5 0 0 1 1.5 1.5v10.5h-3.5M8.5 8.5h5M8.5 12h5" />
        </>
      );
    case "quartile":
      return (
        <>
          <path d="M4 20V13.5M10 20V9M16 20v-6M4 20h17" />
          <path d="m13.5 6.5 3-3 3 3M16.5 3.5V9" />
        </>
      );
    case "check":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12.25 2.5 2.5L16.5 9" />
        </>
      );
    case "database":
      return (
        <>
          <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
          <path d="M4.5 5.5v6c0 1.65 3.36 3 7.5 3s7.5-1.35 7.5-3v-6M4.5 11.5v6c0 1.65 3.36 3 7.5 3s7.5-1.35 7.5-3v-6" />
        </>
      );
  }
}

export function NexusPublicationsIcon({ name }: NexusPublicationsIconProps) {
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
