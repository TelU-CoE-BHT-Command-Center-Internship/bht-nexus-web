import type { ReactNode } from "react";
import {
  type NexusWorkspaceIconName,
  NexusWorkspaceIconPaths,
} from "@/components/nexus-workspace-ui/nexus-workspace-icons";

export type NexusBroadcastIconName =
  | "bold"
  | "bulletList"
  | "chevronDown"
  | "clearFormat"
  | "close"
  | "desktop"
  | "dots"
  | "eraser"
  | "exclamation"
  | "eye"
  | "image"
  | "imageCenter"
  | "imageLeft"
  | "imageRight"
  | "italic"
  | "link"
  | "minus"
  | "numberedList"
  | "phone"
  | "redo"
  | "send"
  | "tick"
  | "trash"
  | "undo"
  | "unlink"
  | "upload"
  | NexusWorkspaceIconName;

/**
 * Ikon khas Broadcast: perkakas editor dan tindakan halaman. Ikon yang
 * konsepnya dipakai lintas modul, seperti surat, orang, dan peringatan,
 * diambil dari `nexus-workspace-icons` supaya satu konsep tetap satu gambar.
 */
const broadcastPaths: Partial<Record<NexusBroadcastIconName, ReactNode>> = {
  bold: (
    <path d="M6.7 4.5h5.4a3.6 3.6 0 0 1 0 7.2H6.7Zm0 7.2h6.3a3.9 3.9 0 0 1 0 7.8H6.7Z" />
  ),
  bulletList: (
    <>
      <path d="M9.5 6.5h11M9.5 12h11M9.5 17.5h11" />
      <circle cx="4.6" cy="6.5" fill="currentColor" r="1.1" stroke="none" />
      <circle cx="4.6" cy="12" fill="currentColor" r="1.1" stroke="none" />
      <circle cx="4.6" cy="17.5" fill="currentColor" r="1.1" stroke="none" />
    </>
  ),
  chevronDown: <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />,
  clearFormat: (
    <>
      <path d="M4.5 5.5h11M10 5.5v13" />
      <path d="m14.5 14.5 5 5M19.5 14.5l-5 5" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  desktop: (
    <>
      <rect height="11.5" rx="1.8" width="17" x="3.5" y="4.5" />
      <path d="M9 19.5h6M12 16v3.5" />
    </>
  ),
  dots: <path d="M7 12h.01M12 12h.01M17 12h.01" />,
  exclamation: <path d="M12 6.5v7M12 17.5h.01" />,
  eraser: (
    <>
      <path d="m13.8 4.6 5.6 5.6a1.6 1.6 0 0 1 0 2.3l-6.9 6.9H8.3l-3.7-3.7a1.6 1.6 0 0 1 0-2.3l6.9-6.9a1.6 1.6 0 0 1 2.3 0Z" />
      <path d="M9 9.4l5.6 5.6M8.3 19.4h11.2" />
    </>
  ),
  eye: (
    <>
      <path d="M3.5 12c2-4 5-6 8.5-6s6.5 2 8.5 6c-2 4-5 6-8.5 6s-6.5-2-8.5-6Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  image: (
    <>
      <rect height="15" rx="2.2" width="17" x="3.5" y="4.5" />
      <circle cx="9" cy="9.6" r="1.6" />
      <path d="m3.9 17.4 4.6-4.6 3.4 3.4 2.6-2.6 5.6 5.6" />
    </>
  ),
  imageCenter: (
    <>
      <rect height="7.5" rx="1.4" width="9" x="7.5" y="4.5" />
      <path d="M3.5 16h17M6 19.5h12" />
    </>
  ),
  imageLeft: (
    <>
      <rect height="7.5" rx="1.4" width="8" x="3.5" y="4.5" />
      <path d="M14.5 5.5h6M14.5 9h6M14.5 12.5h6M3.5 16h17M3.5 19.5h12" />
    </>
  ),
  imageRight: (
    <>
      <rect height="7.5" rx="1.4" width="8" x="12.5" y="4.5" />
      <path d="M3.5 5.5h6M3.5 9h6M3.5 12.5h6M3.5 16h17M8.5 19.5h12" />
    </>
  ),
  italic: <path d="M10.5 4.5h7M6.5 19.5h7M14 4.5l-4 15" />,
  minus: <path d="M7 12h10" />,
  link: (
    <>
      <path d="M9.5 16.3H7.8a4.3 4.3 0 0 1 0-8.6h1.7" />
      <path d="M14.5 7.7h1.7a4.3 4.3 0 0 1 0 8.6h-1.7" />
      <path d="M8.6 12h6.8" />
    </>
  ),
  numberedList: (
    <>
      <path d="M10 6.5h10.5M10 12h10.5M10 17.5h10.5" />
      <path d="M4.2 4.8h1.2v4M4 8.8h2.8M3.9 11.3a1.3 1.3 0 0 1 2.4.6c0 .9-2.4 1.9-2.4 3h2.6" />
    </>
  ),
  phone: (
    <>
      <rect height="17" rx="2.6" width="10.5" x="6.75" y="3.5" />
      <path d="M10.6 17.2h2.8" />
    </>
  ),
  redo: (
    <>
      <path d="M15.8 5.4 19.5 9l-3.7 3.6" />
      <path d="M19.5 9h-9.6a5.4 5.4 0 0 0 0 10.8h3.4" />
    </>
  ),
  send: (
    <>
      <path d="M20.5 3.5 3.5 10.6l6.9 2.9 2.9 6.9Z" />
      <path d="m20.5 3.5-10.1 10" />
    </>
  ),
  tick: <path d="m6.5 12.5 3.5 3.5 7.5-8" />,
  trash: (
    <path d="M4.5 6.8h15M9.2 6.8V4.5h5.6v2.3M6.8 6.8l.7 12.7h9l.7-12.7M10.2 10.4v5.4M13.8 10.4v5.4" />
  ),
  upload: (
    <>
      <path d="M12 15.5V4.5m0 0-4 4m4-4 4 4" />
      <path d="M4.5 14.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    </>
  ),
  undo: (
    <>
      <path d="M8.2 5.4 4.5 9l3.7 3.6" />
      <path d="M4.5 9h9.6a5.4 5.4 0 0 1 0 10.8h-3.4" />
    </>
  ),
  unlink: (
    <>
      <path d="M9.5 16.3H7.8a4.3 4.3 0 0 1-1.6-8.3" />
      <path d="M14.5 7.7h1.7a4.3 4.3 0 0 1 1.6 8.3" />
      <path d="m4.5 4.5 15 15" />
    </>
  ),
};

export function NexusBroadcastIcon({ name }: { name: NexusBroadcastIconName }) {
  const paths = broadcastPaths[name] ?? (
    <NexusWorkspaceIconPaths name={name as NexusWorkspaceIconName} />
  );

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths}
    </svg>
  );
}
